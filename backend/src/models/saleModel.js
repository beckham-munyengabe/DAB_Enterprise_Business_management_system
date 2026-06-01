import { Sale, Product, Customer, User } from "./schemas.js";

function toSale(doc, extra = {}) {
  if (!doc) return null;
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(s._id),
    invoice_no: s.invoice_no,
    customer_id: s.customer ? String(s.customer) : null,
    cashier_id: s.cashier ? String(s.cashier) : null,
    total: Number(s.total) || 0,
    status: s.status,
    created_at: s.created_at,
    items: (s.items || []).map((it) => ({
      product_id: it.product ? String(it.product) : null,
      product_name: it.product_name ?? null,
      quantity: it.quantity,
      unit_price: it.unit_price,
      subtotal: it.subtotal,
    })),
    ...extra,
  };
}

const SaleModel = {
  async findAll() {
    const docs = await Sale.find()
      .populate("customer", "full_name")
      .populate("cashier", "full_name")
      .sort({ created_at: -1 });
    return docs.map((d) => {
      const s = d.toObject();
      return toSale(d, {
        customer_name: s.customer ? s.customer.full_name : null,
        cashier_name: s.cashier ? s.cashier.full_name : null,
      });
    });
  },

  async findById(id) {
    const doc = await Sale.findById(id).populate("customer", "full_name");
    if (!doc) return null;
    const s = doc.toObject();
    return toSale(doc, {
      customer_name: s.customer ? s.customer.full_name : null,
    });
  },

  // Records a sale + items and decrements stock (stock out).
  async create({ customer_id, cashier_id, items }) {
    let total = 0;
    const lineItems = [];

    for (const it of items) {
      const product = await Product.findById(it.product_id);
      const subtotal = it.quantity * it.unit_price;
      total += subtotal;
      lineItems.push({
        product: it.product_id,
        product_name: product ? product.name : null,
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal,
      });
    }

    const invoiceNo = "INV-" + Date.now();
    const sale = await Sale.create({
      invoice_no: invoiceNo,
      customer: customer_id || null,
      cashier: cashier_id || null,
      total,
      status: "completed",
      items: lineItems,
    });

    // Stock out
    for (const it of items) {
      await Product.updateOne({ _id: it.product_id }, { $inc: { stock: -it.quantity } });
    }

    return this.findById(sale._id);
  },
};

export default SaleModel;
