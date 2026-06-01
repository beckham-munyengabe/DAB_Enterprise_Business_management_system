import { Customer, Sale } from "./schemas.js";

function toCustomer(doc) {
  if (!doc) return null;
  const c = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(c._id),
    full_name: c.full_name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    address: c.address ?? null,
    created_at: c.created_at,
  };
}

const CustomerModel = {
  async findAll() {
    const docs = await Customer.find().sort({ full_name: 1 });
    return docs.map(toCustomer);
  },

  async findById(id) {
    return toCustomer(await Customer.findById(id));
  },

  async history(id) {
    const docs = await Sale.find({ customer: id }).sort({ created_at: -1 });
    return docs.map((d) => {
      const s = d.toObject();
      return {
        id: String(s._id),
        invoice_no: s.invoice_no,
        total: Number(s.total) || 0,
        status: s.status,
        created_at: s.created_at,
      };
    });
  },

  async create({ full_name, email, phone, address }) {
    const doc = await Customer.create({
      full_name,
      email: email || null,
      phone: phone || null,
      address: address || null,
    });
    return toCustomer(doc);
  },

  async update(id, { full_name, email, phone, address }) {
    const doc = await Customer.findByIdAndUpdate(
      id,
      { full_name, email: email || null, phone: phone || null, address: address || null },
      { new: true }
    );
    return toCustomer(doc);
  },

  async remove(id) {
    await Customer.findByIdAndDelete(id);
  },
};

export default CustomerModel;
