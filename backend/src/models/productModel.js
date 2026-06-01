import { Product } from "./schemas.js";

function toProduct(doc) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  const category = p.category && typeof p.category === "object" ? p.category : null;
  return {
    id: String(p._id),
    name: p.name,
    sku: p.sku ?? null,
    description: p.description ?? null,
    category_id: category ? String(category._id) : p.category ? String(p.category) : null,
    category_name: category ? category.name : null,
    price: Number(p.price) || 0,
    cost: Number(p.cost) || 0,
    stock: Number(p.stock) || 0,
    reorder_level: Number(p.reorder_level) || 0,
    image_url: p.image_url ?? null,
    created_at: p.created_at,
  };
}

const ProductModel = {
  async findAll() {
    const docs = await Product.find().populate("category", "name").sort({ name: 1 });
    return docs.map(toProduct);
  },

  async findById(id) {
    const doc = await Product.findById(id).populate("category", "name");
    return toProduct(doc);
  },

  async lowStock() {
    const docs = await Product.find({ $expr: { $lte: ["$stock", "$reorder_level"] } })
      .populate("category", "name")
      .sort({ stock: 1 });
    return docs.map(toProduct);
  },

  async create(data) {
    const doc = await Product.create({
      name: data.name,
      sku: data.sku || null,
      description: data.description || null,
      category: data.category_id || null,
      price: data.price || 0,
      cost: data.cost || 0,
      stock: data.stock || 0,
      reorder_level: data.reorder_level || 5,
      image_url: data.image_url || null,
    });
    return this.findById(doc._id);
  },

  async update(id, data) {
    await Product.findByIdAndUpdate(id, {
      name: data.name,
      sku: data.sku || null,
      description: data.description || null,
      category: data.category_id || null,
      price: data.price || 0,
      cost: data.cost || 0,
      stock: data.stock || 0,
      reorder_level: data.reorder_level || 5,
      image_url: data.image_url || null,
    });
    return this.findById(id);
  },

  async adjustStock(id, delta) {
    await Product.updateOne({ _id: id }, { $inc: { stock: delta } });
  },

  async remove(id) {
    await Product.findByIdAndDelete(id);
  },
};

export default ProductModel;
