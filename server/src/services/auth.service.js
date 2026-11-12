import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import Product from "../models/Product.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function toPublicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);

  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [algorithm, saltHex, keyHex] = storedHash.split(":");

  if (algorithm !== "scrypt" || !saltHex || !keyHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await scrypt(password, salt, expectedKey.length);

  return (
    expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
  );
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(user) {
  const token = randomBytes(32).toString("hex");

  await Session.create({
    user: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function registerCustomer({
  fullName,
  email,
  phone,
  password,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("Email này đã được sử dụng.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    phone,
    passwordHash,
    role: "customer",
  });

  return createSession(user);
}

export async function loginCustomer({ email, password }) {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+passwordHash");

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const error = new Error("Email hoặc mật khẩu không chính xác.");
    error.statusCode = 401;
    throw error;
  }

  return createSession(user);
}
export async function updateCustomerProfile(userId, profile) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("fullName email phone role");

  if (!user) {
    const error = new Error("Không tìm thấy tài khoản.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function changeCustomerPassword(
  userId,
  { currentPassword, newPassword }
) {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    const error = new Error("Không tìm thấy tài khoản.");
    error.statusCode = 404;
    throw error;
  }

  const currentPasswordMatches = await verifyPassword(
    currentPassword,
    user.passwordHash
  );

  if (!currentPasswordMatches) {
    const error = new Error("Mật khẩu hiện tại không chính xác.");
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { message: "Đổi mật khẩu thành công." };
}

function createAddressServiceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getSortedAddresses(user) {
  return user.addresses
    .map((address) => address.toObject())
    .sort((first, second) => Number(second.isDefault) - Number(first.isDefault));
}

export async function getCustomerAddresses(userId) {
  const user = await User.findById(userId).select("addresses");

  if (!user) {
    throw createAddressServiceError(404, "Không tìm thấy tài khoản.");
  }

  return getSortedAddresses(user);
}

export async function createCustomerAddress(userId, addressInput) {
  const user = await User.findById(userId).select("addresses");

  if (!user) {
    throw createAddressServiceError(404, "Không tìm thấy tài khoản.");
  }

  const makeDefault = addressInput.isDefault || user.addresses.length === 0;

  if (makeDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  user.addresses.push({
    ...addressInput,
    isDefault: makeDefault,
  });

  await user.save();
  return getSortedAddresses(user);
}

export async function updateCustomerAddress(userId, addressId, addressInput) {
  const user = await User.findById(userId).select("addresses");

  if (!user) {
    throw createAddressServiceError(404, "Không tìm thấy tài khoản.");
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    throw createAddressServiceError(404, "Không tìm thấy địa chỉ.");
  }

  address.set({
    label: addressInput.label,
    fullName: addressInput.fullName,
    phone: addressInput.phone,
    address: addressInput.address,
    isDefault: false,
  });

  if (addressInput.isDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = item._id.equals(address._id);
    });
  } else if (!user.addresses.some((item) => item.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return getSortedAddresses(user);
}

export async function deleteCustomerAddress(userId, addressId) {
  const user = await User.findById(userId).select("addresses");

  if (!user) {
    throw createAddressServiceError(404, "Không tìm thấy tài khoản.");
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    throw createAddressServiceError(404, "Không tìm thấy địa chỉ.");
  }

  user.addresses.pull({ _id: addressId });

  if (
    user.addresses.length > 0 &&
    !user.addresses.some((item) => item.isDefault)
  ) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return getSortedAddresses(user);
}

function createWishlistServiceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function getCustomerWishlist(userId) {
  const user = await User.findById(userId)
    .select("wishlist")
    .populate({
      path: "wishlist",
      match: { isActive: true },
      select: "name description price category images sizes colors stock isActive createdAt",
    });

  if (!user) {
    throw createWishlistServiceError(404, "Không tìm thấy tài khoản.");
  }

  return user.wishlist.filter(Boolean);
}

export async function addCustomerWishlistItem(userId, productId) {
  const productExists = await Product.exists({
    _id: productId,
    isActive: true,
  });

  if (!productExists) {
    throw createWishlistServiceError(404, "Không tìm thấy sản phẩm.");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },
    { new: true }
  ).select("_id");

  if (!user) {
    throw createWishlistServiceError(404, "Không tìm thấy tài khoản.");
  }

  return getCustomerWishlist(userId);
}

export async function removeCustomerWishlistItem(userId, productId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true }
  ).select("_id");

  if (!user) {
    throw createWishlistServiceError(404, "Không tìm thấy tài khoản.");
  }

  return getCustomerWishlist(userId);
}

export async function findUserByToken(token) {
  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).populate("user", "fullName email phone role");

  return session?.user || null;
}

export async function deleteSession(token) {
  await Session.deleteOne({
    tokenHash: hashToken(token),
  });
}
