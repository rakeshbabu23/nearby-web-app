const jwt = require("jsonwebtoken");

const { authService } = require("../services");
const {
  ValidationError,
  UnauthorizedError,
  InternalServerError,
  ForbiddenError,
  BadRequestError,
  APIError,
} = require("../lib/customError");
const cookieOptions = require("../config/cookies.config");
const { Session } = require("../models");
const createUserWithFirebaseToken = async (req, res, next) => {
  try {
    const { name, email, password, userLocation, gender } = req.body;
    const profileImage = req.file;
    const parsedLocation = JSON.parse(userLocation);
    if (!name) {
      throw new BadRequestError("Name is required", {
        message: "Name is required",
      });
    }
    if (!email) {
      throw new BadRequestError("Email is required", {
        message: "Email is required",
      });
    }
    if (!password) {
      throw new BadRequestError("Password is required", {
        message: "Password is required",
      });
    }

    const { user, accessToken, refreshToken } =
      await authService.createUserWithFirebaseToken(
        name,
        email,
        password,
        parsedLocation,
        gender,
        profileImage
      );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("userId", user._id, {
      ...cookieOptions,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "Registered successfully",
      data: { user, accessToken },
    });
  } catch (e) {
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, userLocation } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required", {
        message: "Email is required",
      });
    }
    if (!password) {
      throw new BadRequestError("Password is required", {
        message: "Password is required",
      });
    }
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
      userLocation
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("userId", user._id, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ message: "Logged in successfully", data: { user, accessToken } });
  } catch (e) {
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e));
  }
};

const getAccessTokenFromRefresh = async (req, res, next) => {
  try {
    const token = await authService.accessTokenFromRefresh(req);
    return res.status(200).json({ data: token });
  } catch (e) {
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e));
  }
};

const validUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return next(
        new UnauthorizedError("User not authenticated", {
          message: "User not authenticated",
        })
      );
    }

    const accessToken = authHeader.split(" ")[1];
    // Check for both "null" string and actual null/undefined
    if (!accessToken || accessToken === "null") {
      return next(
        new UnauthorizedError("User not authenticated", {
          message: "User not authenticated",
        })
      );
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.userId;
    const checkUserSession = await authService.checkUserSession(userId);
    return res.status(200).json({
      data: { isAuthenticated: checkUserSession, message: "success" },
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return res
        .status(200)
        .json({ data: { isAuthenticated: false, message: "TOKEN_EXPIRED" } });
    }
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e));
  }
};

const sendOTPToEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return next(
        new BadRequestError("Invalid email address", {
          message: "Invalid email address",
        })
      );
    }
    await authService.sendOTPToEmail(email);

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (e) {
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e.message));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }
    await authService.verifyOtp(email, otp);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (e) {
    if (e instanceof APIError) {
      return next(e);
    }
    return next(new InternalServerError(e.message));
  }
};

module.exports = {
  createUserWithFirebaseToken,
  login,
  getAccessTokenFromRefresh,
  validUser,
  sendOTPToEmail,
  verifyOtp,
};
