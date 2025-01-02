const jwt = require("jsonwebtoken");
const {
  ValidationError,
  UnauthorizedError,
  InternalServerError,
  ForbiddenError,
  APIError,
} = require("../lib/customError");
const { Session } = require("../models");
const { generateAccessToken } = require("../utils/jwt.util");
const cookieOptions = require("../config/cookies.config");

const verifyToken = async (req, res, next) => {
  try {
    // console.log("Verifying token", req.cookies);
    // console.log(
    //   "Verifying accessTokentoken",
    //   req.header("Authorization")?.split(" ")[1]
    // );
    const { refreshToken, userId } = req.cookies;
    const accessToken = req.header("Authorization")?.split(" ")[1];
    if (!accessToken || !refreshToken || !userId) {
      throw new UnauthorizedError("User not authenticated", {
        message: "User not authenticated",
      });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.userId = decoded.userId;
      req.email = decoded.email;
      req.name = decoded.name;
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const { userId, refreshToken } = req.cookies;
        const session = await Session.findOne({ userId });
        if (session && session.refreshToken === refreshToken) {
          try {
            const verifyRefreshToken = jwt.verify(
              session.refreshToken,
              process.env.JWT_REFRESH_SECRET
            );
          } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
              throw new ForbiddenError("Token expired", {
                message: "Token expired",
              });
            } else {
              throw new ForbiddenError("Invalid refresh token", {
                message: "Invalid refresh token",
              });
            }
          }
          const newAccessToken = generateAccessToken(
            { userId, email: req.email, name: req.name },
            process.env.JWT_ACCESS_SECRET,
            "1d"
          );
          req.userId = userId;
          req.email = req.email;
          req.name = req.name;
          res.cookie("accessToken", newAccessToken, cookieOptions);
          return next();
        }
        throw new UnauthorizedError("Invalid refresh token", {
          message: "Invalid refresh token",
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token", {
          message: "Invalid token",
        });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof APIError) {
      return next(error);
    }
    return next(new InternalServerError(error.message));
  }
};

const accessTokenFromRefresh = async (req, res, next) => {
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
      process.env.JWT_ACCESS_SECRET,
      "1d"
    );
    res.cookie("accessToken", accessToken, cookieOptions);
    return next();
  } catch (error) {
    if (error instanceof APIError) {
      return next(error);
    }
    return next(new InternalServerError(error.message));
  }
};

module.exports = { verifyToken, accessTokenFromRefresh };