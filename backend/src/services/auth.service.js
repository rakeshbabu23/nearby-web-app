const axios = require("axios");
const { Session, User, Otp } = require("../models");
const { generateAccessToken } = require("../utils/jwt.util");
const {
  UnauthorizedError,
  InternalServerError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} = require("../lib/customError");
const { sendEmail } = require("../config/email.config");
const { uploadProfilePicture } = require("../utils/s3.util");
const { generateRandomSixDigitOtp } = require("../utils/otp.util");

const createUserWithFirebaseToken = async (
  name,
  email,
  password,
  userLocation,
  gender,
  profileImage
) => {
  //const parsedLocation = validateCoordinates(userLocation);
  const checkEmailExists = await User.findOne({ email: email });
  if (checkEmailExists) {
    throw new ForbiddenError("Email already in use", {
      message: "Email already in use",
    });
  }
  let accessToken = null,
    refreshToken = null;
  // const sanitizedCoordinates = userLocation
  //   .replace(/[\[\]']/g, "") // Remove brackets and single quotes
  //   .split(",") // Split by comma
  //   .map(Number); // Convert to numbers
  if (!checkEmailExists) {
    let address = "";
    const response = await axios.get(
      `https://us1.locationiq.com/v1/reverse?key=pk.b947b52cdc557100cbb97527d1289281&lat=${userLocation[1]}&lon=${userLocation[0]}&format=json`
    );
    address = response.data.display_name;
    const newUser = await User.create({
      email,
      password,
      name,
      gender,
      location: {
        type: "Point",
        coordinates: userLocation,
      },
      address,
    });
    if (profileImage) {
      const profilePictureUrl = await uploadProfilePicture(
        profileImage,
        newUser._id,
        "profile-pictures"
      );
      newUser.profileImage = profilePictureUrl;
      await newUser.save();
    }
    accessToken = generateAccessToken(
      { userId: newUser._id, email, name },
      "1d",
      process.env.JWT_ACCESS_SECRET
    );
    refreshToken = generateAccessToken(
      {
        userId: newUser._id,
        email,
        name,
      },
      "15d",
      process.env.JWT_REFRESH_SECRET
    );
    await Session.create({
      userId: newUser._id,
      refreshToken,
    });
    return { accessToken, refreshToken, user: newUser };
  } else {
    await Session.deleteOne({ userId: createUser._id });
    accessToken = generateAccessToken(
      { userId: createUser._id, email, name },
      "1d",
      process.env.JWT_ACCESS_SECRET
    );
    refreshToken = generateAccessToken(
      { userId: createUser._id, email, name },
      "15d",
      process.env.JWT_REFRESH_SECRET
    );
    await Session.create({
      userId: createUser._id,
      refreshToken,
    });
    return { accessToken, refreshToken, user: createUser };
  }
};

const login = async (email, password, location) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Email not found.Please sign up");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }
  let updatedUser = null;
  try {
    if (!Array.isArray(location) || location.length !== 2) {
      throw new Error(
        "Invalid location format. Expected an array with two elements [longitude, latitude]."
      );
    }

    const sanitizedCoordinates = location.map(Number); // Ensure all elements are numbers

    // Reverse geocoding
    const response = await axios.get(
      `https://us1.locationiq.com/v1/reverse?key=pk.b947b52cdc557100cbb97527d1289281&lat=${sanitizedCoordinates[1]}&lon=${sanitizedCoordinates[0]}&format=json`
    );
    let address = response.data.display_name;
    user.location = {
      type: "Point",
      coordinates: sanitizedCoordinates,
    };
    user.address = address;
    updatedUser = await user.save();
  } catch (err) {
    console.error("Error fetching address", err.response);
    throw err;
  }
  const accessToken = generateAccessToken(
    { userId: updatedUser._id, email, name: user.name },
    "1d",
    process.env.JWT_ACCESS_SECRET
  );
  const refreshToken = generateAccessToken(
    { userId: updatedUser._id, email, name: user.name },
    "15d",
    process.env.JWT_REFRESH_SECRET
  );
  await Session.deleteOne({ userId: updatedUser._id });
  await Session.create({ userId: updatedUser._id, refreshToken });
  return { accessToken, refreshToken, user };
};

const accessTokenFromRefresh = async (req) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedError("User not authenticated", {
        message: "User not authenticated",
      });
    }
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw new UnauthorizedError("Invalid refresh token", {
        message: "Invalid refresh token",
      });
    }
    req.userId = session.userId;
    const userInfo = await User.findById(session.userId);
    if (!userInfo) {
      throw new UnauthorizedError("User not found", {
        message: "User not found",
      });
    }

    const accessToken = generateAccessToken(
      { userId: userInfo._id, email: userInfo.email, name: userInfo.name },
      "1d",
      process.env.JWT_ACCESS_SECRET
    );
    return accessToken;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError(error.message, { message: error.message });
    }
    throw new InternalServerError(error.message);
  }
};

const checkUserSession = async (userId) => {
  const session = await Session.findOne({ userId });
  if (!session) {
    throw new UnauthorizedError("User not authenticated", {
      message: "User not authenticated",
    });
  }
  return true;
};

const sendOTPToEmail = async (email) => {
  const otp = generateRandomSixDigitOtp();
  const fiveMinutes = 5 * 60 * 1000;
  const now = new Date();
  const existingOtp = await Otp.findOne({ email });
  if (existingOtp) {
    const otpAge = now - new Date(existingOtp.createdAt);
    if (otpAge < fiveMinutes) {
      throw new ConflictError(
        "An OTP has already been sent and is not expired yet."
      );
    }
  }

  const otpObj = await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: now },
    { upsert: true, new: true }
  );
  try {
    await sendEmail(email, otp);
    return;
  } catch (error) {
    console.error("Error sending OTP", error);
    throw error;
  }
};

const verifyOtp = async (email, otp) => {
  const otpObj = await Otp.findOne({ email });
  if (!otpObj) {
    throw NotFoundError("OTP not found.", {
      message: "Please request for otp verification",
    });
  }
  const otpAge = new Date() - new Date(otpObj.createdAt);
  if (otpAge > 5 * 60 * 1000) {
    throw new BadRequestError("OTP has expired.", {
      message: "OTP has expired.",
    });
  }
  if (otpObj.otp.toString() !== otp.toString()) {
    throw new BadRequestError("Invalid OTP.", {
      message: "Invalid otp",
    });
  }
  return;
};
module.exports = {
  createUserWithFirebaseToken,
  login,
  accessTokenFromRefresh,
  checkUserSession,
  sendOTPToEmail,
  verifyOtp,
};
