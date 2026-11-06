import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default : '',
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    images: {
        type: [String],
        default: [],
    },
    sizes: {
        type: [String],
        default: [],
    },
    colors: {
        type: [String],
        default: [],
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },

},
    { timestamps: true }
)
const Product =mongoose.model('Product', productSchema)
export default Product