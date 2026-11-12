import { findUserByToken } from "../services/auth.service.js";

export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập để tiếp tục.",
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