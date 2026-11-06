import mongoose from "mongoose"
const orderItemSchema = new mongoose.Schema(
    {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)
const orderSchema = new mongoose.Schema(
  {
    customer: {
      fullName: { type: String, required: true, trim: true, maxlength: 100 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      address: { type: String, required: true, trim: true, maxlength: 300 },
      note: { type: String, default: "", trim: true, maxlength: 500 },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Đơn hàng cần có ít nhất một sản phẩm",
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cod"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);