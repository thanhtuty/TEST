import {
  changeCustomerPassword,
  createCustomerAddress,
  addCustomerWishlistItem,
  deleteSession,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerWishlist,
  loginCustomer,
  removeCustomerWishlistItem,
  registerCustomer,
  updateCustomerAddress,
  updateCustomerProfile,
} from "../services/auth.service.js";
import { validateAddressPayload } from "../validators/address.validator.js";
import {
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateRegistration,
} from "../validators/auth.validator.js";
function sendError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email này đã được sử dụng.",
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Đã có lỗi xảy ra. Vui lòng thử lại."
        : error.message,
  });
}

export async function register(req, res) {
  const validation = validateRegistration(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const data = await registerCustomer(validation.value);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function login(req, res) {
  const validation = validateLogin(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const data = await loginCustomer(validation.value);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    data: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
}

export async function logout(req, res) {
  await deleteSession(req.authToken);

  return res.json({
    success: true,
    message: "Đã đăng xuất.",
  });
}
export async function updateProfile(req, res) {
  const validation = validateProfileUpdate(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const data = await updateCustomerProfile(
      req.user._id,
      validation.value
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function changePassword(req, res) {
  const validation = validatePasswordChange(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const data = await changeCustomerPassword(
      req.user._id,
      validation.value
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAddresses(req, res) {
  try {
    const addresses = await getCustomerAddresses(req.user._id);
    return res.json({ success: true, data: addresses });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function createAddress(req, res) {
  const validation = validateAddressPayload(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const addresses = await createCustomerAddress(
      req.user._id,
      validation.value
    );
    return res.status(201).json({ success: true, data: addresses });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateAddress(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy địa chỉ.",
    });
  }

  const validation = validateAddressPayload(req.body || {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const addresses = await updateCustomerAddress(
      req.user._id,
      req.params.id,
      validation.value
    );
    return res.json({ success: true, data: addresses });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function deleteAddress(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy địa chỉ.",
    });
  }

  try {
    const addresses = await deleteCustomerAddress(
      req.user._id,
      req.params.id
    );
    return res.json({ success: true, data: addresses });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getWishlist(req, res) {
  try {
    const products = await getCustomerWishlist(req.user._id);
    return res.json({ success: true, data: products });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function addWishlistItem(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.productId)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm.",
    });
  }

  try {
    const products = await addCustomerWishlistItem(
      req.user._id,
      req.params.productId
    );
    return res.status(201).json({ success: true, data: products });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function removeWishlistItem(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.productId)) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm.",
    });
  }

  try {
    const products = await removeCustomerWishlistItem(
      req.user._id,
      req.params.productId
    );
    return res.json({ success: true, data: products });
  } catch (error) {
    return sendError(res, error);
  }
}
