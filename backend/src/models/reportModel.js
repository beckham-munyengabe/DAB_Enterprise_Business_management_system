import { Sale, Product, Customer } from "./schemas.js";

// Read-only aggregation queries used by the reports controller.
const ReportModel = {
  async dashboard() {
    const [salesAgg] = await Sale.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } } },
    ]);
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const lowStock = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$reorder_level"] },
    });
    const [stockValueAgg] = await Product.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ["$stock", "$cost"] } } } },
    ]);

    return {
      total_sales: salesAgg?.count || 0,
      total_revenue: Number(salesAgg?.revenue) || 0,
      total_products: totalProducts,
      total_customers: totalCustomers,
      low_stock_items: lowStock,
      stock_value: Number(stockValueAgg?.value) || 0,
    };
  },

  async dailyRevenue(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await Sale.aggregate([
      { $match: { created_at: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ day: r._id, revenue: Number(r.revenue) || 0 }));
  },

  async monthlyRevenue() {
    const rows = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);
    return rows.map((r) => ({ month: r._id, revenue: Number(r.revenue) || 0 }));
  },

  async topCustomers(limit = 5) {
    const rows = await Sale.aggregate([
      { $match: { customer: { $ne: null } } },
      {
        $group: {
          _id: "$customer",
          orders: { $sum: 1 },
          spent: { $sum: "$total" },
        },
      },
      { $sort: { spent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
    ]);
    return rows.map((r) => ({
      id: String(r._id),
      full_name: r.customer.full_name,
      orders: r.orders,
      spent: Number(r.spent) || 0,
    }));
  },

  async stockReport() {
    const docs = await Product.find().populate("category", "name").sort({ stock: 1 });
    return docs.map((d) => {
      const p = d.toObject();
      return {
        id: String(p._id),
        name: p.name,
        sku: p.sku ?? null,
        stock: Number(p.stock) || 0,
        reorder_level: Number(p.reorder_level) || 0,
        cost: Number(p.cost) || 0,
        price: Number(p.price) || 0,
        stock_value: (Number(p.stock) || 0) * (Number(p.cost) || 0),
        category_name: p.category ? p.category.name : null,
      };
    });
  },
};

export default ReportModel;
