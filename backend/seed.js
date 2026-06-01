// ============================================================
//  DAB Enterprise Ltd — Single seed file
// ============================================================
// This is the ONE file that holds the demo data and inserts it
// into MongoDB. Run it with:
//
//     npm run seed
//   (or)  node seed.js
//
// Default accounts (password for all: password123):
//   admin@dab.com   -> admin
//   sales@dab.com   -> sales_manager
//   store@dab.com   -> store_keeper
// ============================================================

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./src/config/database.js";
import {
  User,
  Category,
  Product,
  Customer,
  Sale,
  Purchase,
} from "./src/models/schemas.js";

// ------------------------------------------------------------
//  DATA  (edit these arrays to change what gets inserted)
// ------------------------------------------------------------
const password = "password123";

const usersData = [
  { full_name: "DAB Administrator", email: "admin@dab.com", phone: "0780000001", roles: ["admin"] },
  { full_name: "Sarah Sales", email: "sales@dab.com", phone: "0780000002", roles: ["sales_manager"] },
  { full_name: "Steven Store", email: "store@dab.com", phone: "0780000003", roles: ["store_keeper"] },
];

const categoriesData = [
  { key: "electronics", name: "Electronics", description: "Phones, laptops, accessories and gadgets" },
  { key: "office", name: "Office Supplies", description: "Stationery and office consumables" },
  { key: "home", name: "Home Equipment", description: "Appliances and home essentials" },
];

const productsData = [
  { name: "HP Laptop 15", sku: "EL-001", cat: "electronics", price: 850000, cost: 700000, stock: 12, reorder_level: 4, description: "Core i5, 8GB RAM, 512GB SSD", image_url: "/images/cat-electronics.jpg" },
  { name: "Samsung Galaxy A15", sku: "EL-002", cat: "electronics", price: 420000, cost: 350000, stock: 20, reorder_level: 6, description: '6.5" display, 128GB storage', image_url: "/images/cat-electronics.jpg" },
  { name: "Wireless Mouse", sku: "EL-003", cat: "electronics", price: 25000, cost: 15000, stock: 3, reorder_level: 5, description: "USB wireless optical mouse", image_url: "/images/cat-electronics.jpg" },
  { name: "A4 Printing Paper (Ream)", sku: "OF-001", cat: "office", price: 18000, cost: 12000, stock: 50, reorder_level: 10, description: "80gsm white paper, 500 sheets", image_url: "/images/cat-office.jpg" },
  { name: "Ballpoint Pens (Box)", sku: "OF-002", cat: "office", price: 9000, cost: 5000, stock: 40, reorder_level: 8, description: "Box of 50 blue pens", image_url: "/images/cat-office.jpg" },
  { name: "Stapler Heavy Duty", sku: "OF-003", cat: "office", price: 15000, cost: 9000, stock: 2, reorder_level: 4, description: "Metal heavy duty stapler", image_url: "/images/cat-office.jpg" },
  { name: "Microwave Oven", sku: "HM-001", cat: "home", price: 380000, cost: 300000, stock: 8, reorder_level: 3, description: "20L digital microwave", image_url: "/images/cat-home.jpg" },
  { name: "Electric Kettle", sku: "HM-002", cat: "home", price: 65000, cost: 45000, stock: 15, reorder_level: 5, description: "1.7L stainless steel kettle", image_url: "/images/cat-home.jpg" },
];

const customersData = [
  { full_name: "John Mukasa", email: "john@example.com", phone: "0771111111", address: "Kampala" },
  { full_name: "Grace Naluwooza", email: "grace@example.com", phone: "0772222222", address: "Entebbe" },
  { full_name: "Peter Okello", email: "peter@example.com", phone: "0773333333", address: "Jinja" },
];

// ------------------------------------------------------------
//  INSERTION
// ------------------------------------------------------------
async function seed() {
  await connectDB();

  console.log("🧹 Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Sale.deleteMany({}),
    Purchase.deleteMany({}),
  ]);

  // Users
  const password_hash = await bcrypt.hash(password, 10);
  const users = await User.create(usersData.map((u) => ({ ...u, password_hash })));
  const [admin, sales, store] = users;
  console.log("👤 Users seeded.");

  // Categories
  const catDocs = await Category.create(
    categoriesData.map(({ name, description }) => ({ name, description }))
  );
  const catByKey = {};
  categoriesData.forEach((c, i) => (catByKey[c.key] = catDocs[i]._id));
  console.log("🗂️  Categories seeded.");

  // Products
  const products = await Product.create(
    productsData.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: catByKey[p.cat],
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      reorder_level: p.reorder_level,
      description: p.description,
      image_url: p.image_url,
    }))
  );
  console.log("📦 Products seeded.");

  // Customers
  const customers = await Customer.create(customersData);
  console.log("🧑‍🤝‍🧑 Customers seeded.");

  // Sample sale (stock out)
  const sale = await Sale.create({
    invoice_no: "INV-" + Date.now(),
    customer: customers[0]._id,
    cashier: sales._id,
    total: products[0].price * 1 + products[3].price * 2,
    status: "completed",
    items: [
      { product: products[0]._id, product_name: products[0].name, quantity: 1, unit_price: products[0].price, subtotal: products[0].price },
      { product: products[3]._id, product_name: products[3].name, quantity: 2, unit_price: products[3].price, subtotal: products[3].price * 2 },
    ],
  });
  await Product.updateOne({ _id: products[0]._id }, { $inc: { stock: -1 } });
  await Product.updateOne({ _id: products[3]._id }, { $inc: { stock: -2 } });

  // Sample purchase (stock in)
  await Purchase.create({
    reference_no: "PO-" + Date.now(),
    supplier: "TechWorld Suppliers Ltd",
    received_by: store._id,
    total: products[2].cost * 10,
    items: [
      { product: products[2]._id, product_name: products[2].name, quantity: 10, unit_cost: products[2].cost, subtotal: products[2].cost * 10 },
    ],
  });
  await Product.updateOne({ _id: products[2]._id }, { $inc: { stock: 10 } });

  console.log("🧾 Sample sale & purchase seeded:", sale.invoice_no);
  console.log("\n✅ Seeding complete!");
  console.log("   Login with admin@dab.com / password123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
