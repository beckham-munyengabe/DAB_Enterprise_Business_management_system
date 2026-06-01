import { Purchase, Product, User } from "./schemas.js";

function toPurchase(doc, extra = {}) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(p._id),
    reference_no: p.reference_no,
    supplier: p.supplier ?? null,
    received_by: p.received_by ? String(p.received_by) : null,
    total: Number(p.total) || 0,
    created_at: p.created_at,
    items: (p.items || []).map((it) => ({
      product_id: it.product ? String(it.product) : null,
      product_name: it.product_name ?? null,
      quantity: it.quantity,
      unit_cost: it.unit_cost,
      subtotal: it.subtotal,
    })),
    ...extra,
  };
}

const PurchaseModel = {
  async findAll() {
    const docs = await Purchase.find()
      .populate("received_by", "full_name")
      .sort({ created_at: -1 });
    return docs.map((d) => {
      const p = d.toObject();
      return toPurchase(d, {
        received_by_name: p.received_by ? p.received_by.full_name : null,
      });
    });
  },

  async findById(id) {
    return toPurchase(await Purchase.findById(id));
  },

  // Records a purchase + items and increments stock (stock in).
  async create({ supplier, received_by, items }) {
    let total = 0;
    const lineItems = [];

    for (const it of items) {
      const product = await Product.findById(it.product_id);
      const subtotal = it.quantity * it.unit_cost;
      total += subtotal;
      lineItems.push({
        product: it.product_id,
        product_name: product ? product.name : null,
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        subtotal,
      });
    }

    const referenceNo = "PO-" + Date.now();
    const purchase = await Purchase.create({
      reference_no: referenceNo,
      supplier: supplier || null,
      received_by: received_by || null,
      total,
      items: lineItems,
    });

    // Stock in
    for (const it of items) {
      await Product.updateOne({ _id: it.product_id }, { $inc: { stock: it.quantity } });
    }

    return this.findById(purchase._id);
  },
};

export default PurchaseModel;
