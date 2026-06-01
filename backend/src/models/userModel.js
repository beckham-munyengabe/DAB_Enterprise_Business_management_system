import { User } from "./schemas.js";

// Maps a Mongoose document into the plain shape the controllers expect.
function toUser(doc, { withHash = false } = {}) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : doc;
  const out = {
    id: String(u._id),
    full_name: u.full_name,
    email: u.email,
    phone: u.phone ?? null,
    created_at: u.created_at,
    roles: Array.isArray(u.roles) ? u.roles : [],
  };
  if (withHash) out.password_hash = u.password_hash;
  return out;
}

const UserModel = {
  async findById(id) {
    const doc = await User.findById(id);
    return toUser(doc);
  },

  async findByEmail(email) {
    const doc = await User.findOne({ email: String(email).toLowerCase() });
    return toUser(doc, { withHash: true });
  },

  async create({ full_name, email, phone, password_hash }) {
    const doc = await User.create({
      full_name,
      email,
      phone: phone || null,
      password_hash,
      roles: [],
    });
    return String(doc._id);
  },

  async count() {
    return User.countDocuments();
  },

  async listAll() {
    const docs = await User.find().sort({ created_at: -1 });
    return docs.map((d) => toUser(d));
  },

  async addRole(userId, role) {
    await User.updateOne({ _id: userId }, { $addToSet: { roles: role } });
  },

  async removeRole(userId, role) {
    await User.updateOne({ _id: userId }, { $pull: { roles: role } });
  },
};

export default UserModel;
