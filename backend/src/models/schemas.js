import mongoose from "mongoose";

/**
 * Central place where every Mongoose schema/model is defined.
 * Keeping them together avoids "model overwrite" errors and makes the
 * data layer easy to read for the MVC structure.
 */

const { Schema } = mongoose;

const timestamps = { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } };

// ----- Users (with embedded roles array) -----
const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    password_hash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ["admin", "sales_manager", "store_keeper"],
      default: [],
    },
  },
  timestamps
);

// ----- Categories -----
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
  },
  timestamps
);

// ----- Products -----
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: null },
    description: { type: String, default: null },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    price: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    reorder_level: { type: Number, default: 5 },
    image_url: { type: String, default: null },
  },
  timestamps
);

// ----- Customers -----
const customerSchema = new Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
  },
  timestamps
);

// ----- Sales (with embedded line items) -----
const saleItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    product_name: { type: String, default: null },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new Schema(
  {
    invoice_no: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
    cashier: { type: Schema.Types.ObjectId, ref: "User", default: null },
    total: { type: Number, required: true, default: 0 },
    status: { type: String, default: "completed" },
    items: { type: [saleItemSchema], default: [] },
  },
  timestamps
);

// ----- Purchases (stock in, with embedded line items) -----
const purchaseItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    product_name: { type: String, default: null },
    quantity: { type: Number, required: true },
    unit_cost: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const purchaseSchema = new Schema(
  {
    reference_no: { type: String, required: true, unique: true },
    supplier: { type: String, default: null },
    received_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    total: { type: Number, required: true, default: 0 },
    items: { type: [purchaseItemSchema], default: [] },
  },
  timestamps
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
