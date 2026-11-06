import Product from '../models/Product.js'

const sendError = (res, error) => {
  const isBadRequest =
    error.name === "ValidationError" || error.name === "CastError";

  return res.status(isBadRequest ? 400 : 500).json({
    success: false,
    message: isBadRequest ? error.message : "Lỗi máy chủ",
  });
};
export const getProducts = async (req, res) => {
  try {

    const filter =
      req.query.includeInactive === "true" ? {} : { isActive: true };
    const products = await Product.find(filter).sort({ createdAt: -1 })
    return res.json({ success: true, data: products })
  } catch (error) {
    return sendError(res, error);
  }

}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    })

    if (!product) {
      return res.status(404).json({ success: false, message: "Khong tim thay san pham" })
    }
    return res.json({ success: true, data: product })
  } catch (error) {
    return sendError(res, error);
  }
}

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
    return res.status(201).json({ success: true, data: product })
  } catch (error) {
    return sendError(res, error)

  }
}
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) {
      return res.status(404).json({ success: false, message: "khong tim thay san pham" })

    }
    return res.json({ success: true, data: product })
  } catch (error) {
    return sendError(res, error)

  }
}
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: "khong tim thay san pham" })
    }
    return res.json({ success: true, message: "xoa san pham thanh cong" })

  } catch (error) {
    return sendError(res, error)
  }
}
