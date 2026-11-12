import { findUserByToken } from "../services/auth.service.js";

export async function optionalAuth(req, res, next) {
  const authorization = req.get("authorization");

  // Không có token thì tiếp tục như khách vãng lai.
  if (!authorization) {
    return next();
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    });
  }

  try {
    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
      });
    }

    req.user = user;
    req.authToken = token;
    return next();
  } catch (error) {
    return next(error);
  }
}