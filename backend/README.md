# DAB Enterprise Ltd — Backend API (MVC + MongoDB/Mongoose)

A REST API for the DAB Enterprise management system, built with **Node.js + Express**
following the **MVC** pattern and using **MongoDB** with **Mongoose** as the ODM.

## Architecture (MVC)

```
backend/
├── src/
│   ├── config/        # database connection (Mongoose)
│   ├── models/        # (M) Mongoose schemas + data-access wrappers
│   ├── controllers/   # (C) request handling / business logic
│   ├── routes/        # route → controller wiring
│   ├── middleware/    # auth (JWT), error handling
│   ├── utils/         # helpers (JWT token generator)
│   ├── scripts/       # db:check, db:seed
│   ├── app.js         # express app + middleware
│   └── server.js      # entry point (connects DB, starts server)
└── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your env file:
   ```bash
   cp .env.example .env
   ```
   Then set `MONGO_URI` (local example: `mongodb://127.0.0.1:27017/dab_enterprise`)
   and a strong `JWT_SECRET`.

3. (Optional) Verify the database connection:
   ```bash
   npm run db:check
   ```

4. Seed initial demo data (categories, products, customers, users, sample sale/purchase):
   ```bash
   npm run db:seed
   ```

5. Start the API:
   ```bash
   npm run dev      # with nodemon
   # or
   npm start
   ```

The API runs at `http://localhost:8080`.

## Seed accounts (password for all: `password123`)

| Email            | Role          |
|------------------|---------------|
| admin@dab.com    | admin         |
| sales@dab.com    | sales_manager |
| store@dab.com    | store_keeper  |

> Note: When registering through the API, the **first** account created
> automatically becomes an **admin**.

## Main Endpoints

All protected routes expect an `Authorization: Bearer <token>` header.

| Method | Endpoint                         | Access                       |
|--------|----------------------------------|------------------------------|
| POST   | `/api/auth/register`             | public                       |
| POST   | `/api/auth/login`                | public                       |
| GET    | `/api/auth/me`                   | authenticated                |
| GET/POST/PUT/DELETE | `/api/categories`   | admin (writes)               |
| GET/POST/PUT/DELETE | `/api/products`     | admin / store_keeper (writes)|
| GET/POST/PUT/DELETE | `/api/customers`    | authenticated                |
| GET/POST | `/api/sales`                   | admin / sales_manager (create)|
| GET/POST | `/api/purchases`               | admin / store_keeper (create)|
| GET    | `/api/employees`                 | admin                        |
| GET    | `/api/reports/dashboard`         | authenticated                |
| GET    | `/api/reports/daily-revenue`     | authenticated                |
| GET    | `/api/reports/monthly-revenue`   | authenticated                |
| GET    | `/api/reports/top-customers`     | authenticated                |
| GET    | `/api/reports/stock`             | authenticated                |

## Notes

- Stock is automatically **decremented** on a sale and **incremented** on a purchase.
- Roles are stored as an array on each user document (`admin`, `sales_manager`, `store_keeper`).
- Product images in the seed reference `/images/*.jpg` — copy the files from the
  `images/` folder of the package into your frontend's public/static folder if you
  want them served.
