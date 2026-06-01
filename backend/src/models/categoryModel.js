import { Category } from "./schemas.js";

function toCategory(doc) {
  if (!doc) return null;
  const c = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(c._id),
    name: c.name,
    description: c.description ?? null,
    created_at: c.created_at,
  };
}

const CategoryModel = {
  async findAll() {
    const docs = await Category.find().sort({ name: 1 });
    return docs.map(toCategory);
  },

  async findById(id) {
    return toCategory(await Category.findById(id));
  },

  async create({ name, description }) {
    const doc = await Category.create({ name, description: description || null });
    return toCategory(doc);
  },

  async update(id, { name, description }) {
    const doc = await Category.findByIdAndUpdate(
      id,
      { name, description: description || null },
      { new: true }
    );
    return toCategory(doc);
  },

  async remove(id) {
    await Category.findByIdAndDelete(id);
  },
};

export default CategoryModel;
