# 🛒 E-Commerce Backend API

A production-grade REST API for an e-commerce platform built with **Node.js**, **Express**, **MongoDB** (Mongoose), **JWT authentication**, and **Stripe payments**.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Authentication](#-authentication)
- [Database Models](#-database-models)
- [Response Format](#-response-format)
- [Error Codes](#-error-codes)
- [Business Logic Rules](#-business-logic-rules)
- [Running Tests](#-running-tests)
- [Docker Setup](#-docker-setup)
- [Git Workflow](#-git-workflow)
- [Hard Rules](#-hard-rules)
- [Team Context](#-team-context)
- [Build Phases](#-build-phases)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |
| Payments | Stripe |
| Rate Limiting | express-rate-limit |
| Testing | Jest + Supertest + mongodb-memory-server |
| Security | Helmet, CORS |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js                   # Entry point — DB connect + server start
│   ├── app.js                      # Express setup — middleware + routes
│   ├── config/
│   │   └── config.js               # All env vars — crashes on startup if any missing
│   ├── routes/
│   │   └── v1/
│   │       ├── index.js            # Combines all routers
│   │       ├── auth.routes.js
│   │       ├── product.routes.js
│   │       ├── cart.routes.js
│   │       ├── order.routes.js
│   │       ├── payment.routes.js
│   │       ├── user.routes.js
│   │       └── admin.routes.js
│   ├── controllers/                # Thin — only handles req/res
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   └── payment.controller.js
│   ├── services/                   # All business logic lives here
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── cart.service.js
│   │   ├── order.service.js
│   │   └── payment.service.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   ├── Category.model.js
│   │   ├── Cart.model.js
│   │   ├── Order.model.js
│   │   └── Session.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification → sets req.user
│   │   ├── admin.middleware.js     # Role check (admin only)
│   │   ├── validate.middleware.js  # Joi schema validation
│   │   └── error.middleware.js     # Global error handler
│   └── utils/
│       ├── AppError.js             # Custom error class + error code registry
│       ├── asyncHandler.js         # Wraps async controllers — no try/catch needed
│       └── response.js             # Standardized success/error response helpers
├── tests/
│   ├── setup.js                    # In-memory MongoDB setup for all tests
│   ├── helpers.js                  # Reusable test utilities (registerUser, createProduct)
│   ├── auth.test.js
│   ├── products.test.js
│   ├── cart.test.js
│   ├── orders.test.js
│   ├── checkout-flow.test.js       # Full end-to-end journey test
│   └── contract.test.js            # API response shape verification
├── .env                            # Never commit this
├── .env.example                    # Always commit this
├── package.json
├── jest.config.js
└── Dockerfile
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas URI
- Stripe account (test keys are fine for development)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Copy env example and fill in your values
cp .env.example .env

# Start the development server
npm run dev
```

Server starts at `http://localhost:8000`

Verify it's running:

```bash
curl http://localhost:8000/health
# Expected: { "status": "ok" }
```

### Scripts

```bash
npm run dev        # Start with nodemon (auto-restarts on file save)
npm start          # Start production server
npm test           # Run all tests
npm run test:watch # Watch mode — re-runs tests on save
npm run test:cover # Run tests with coverage report
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in all values. The server **crashes on startup** if any required variable is missing — this is intentional so you catch missing config immediately.

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE_MINUTES=30
REFRESH_EXPIRE_DAYS=7
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | 8000 | Server port |
| `MONGODB_URL` | ✅ Yes | — | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | — | Secret for signing JWT tokens |
| `JWT_EXPIRE_MINUTES` | No | 30 | Access token expiry in minutes |
| `REFRESH_EXPIRE_DAYS` | No | 7 | Refresh token expiry in days |
| `STRIPE_SECRET_KEY` | ✅ Yes | — | Stripe secret key (`sk_test_` for dev) |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | — | Stripe webhook signing secret |
| `FRONTEND_URL` | No | localhost:3000 | Allowed CORS origin |
| `NODE_ENV` | No | development | `development` or `production` |

> ⚠️ **Never commit your `.env` file.** Only `.env.example` is committed to git.

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a new customer |
| `POST` | `/auth/login` | None | Login — returns access + refresh token |
| `POST` | `/auth/refresh` | None | Get new access token using refresh token |

### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | None | Paginated product list with filters |
| `GET` | `/products/:slug` | None | Single product by slug |
| `GET` | `/categories` | None | All active categories |

**Query params for `GET /products`:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page (max 100) |
| `category` | string | — | Filter by category slug |
| `search` | string | — | Full-text search on name + description |
| `min_price` | integer | — | Minimum price in paise/cents |
| `max_price` | integer | — | Maximum price in paise/cents |
| `sort` | string | `newest` | `price_asc`, `price_desc`, `newest` |

### Cart

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/cart` | JWT | Get current user's cart |
| `POST` | `/cart/items` | JWT | Add item to cart |
| `PATCH` | `/cart/items/:itemId` | JWT | Update item quantity |
| `DELETE` | `/cart/items/:itemId` | JWT | Remove item from cart |

### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | JWT | Create order from cart |
| `GET` | `/orders` | JWT | Get current user's order history |
| `GET` | `/orders/:orderId` | JWT | Get single order detail |

### Payments

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/intent` | JWT | Create Stripe PaymentIntent |
| `POST` | `/payments/webhook` | Stripe-Signature | Handle Stripe webhook events |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | JWT | Get current user's profile |
| `PATCH` | `/users/me` | JWT | Update profile |
| `POST` | `/users/me/change-password` | JWT | Change password |

### Admin

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/orders` | Admin JWT | All orders (paginated, filterable by status) |
| `PATCH` | `/admin/orders/:orderId/status` | Admin JWT | Update order status |

---

## 🔐 Authentication

This API uses **JWT Bearer tokens**.

### Flow

1. Register or login → receive `access_token` + `refresh_token`
2. Include the access token in every protected request header:
   ```
   Authorization: Bearer <access_token>
   ```
3. When the access token expires (30 min), use the refresh token to get a new one:
   ```
   POST /api/v1/auth/refresh
   Body: { "refresh_token": "..." }
   ```

### JWT Payload

```json
{
  "sub": "user_id_string",
  "role": "customer",
  "iat": 1700000000,
  "exp": 1700001800
}
```

### Token Reference

| Token | Expiry | Storage |
|---|---|---|
| Access Token | 30 minutes | Client memory / localStorage |
| Refresh Token | 7 days | MongoDB `sessions` collection (auto-deleted via TTL index) |

### User Roles

| Role | Access |
|---|---|
| `customer` | All `/cart`, `/orders`, `/users/me` routes |
| `admin` | All customer routes + all `/admin/*` routes |

---

## 🗄️ Database Models

### User

| Field | Type | Notes |
|---|---|---|
| `email` | String | Unique, lowercase, indexed |
| `hashed_password` | String | `select: false` — never returned in queries |
| `full_name` | String | |
| `role` | Enum | `"customer"` or `"admin"` |
| `is_active` | Boolean | Default: `true` |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose |

### Product

| Field | Type | Notes |
|---|---|---|
| `name` | String | |
| `slug` | String | Unique, URL-friendly, indexed |
| `description` | String | Text-indexed for search |
| `price` | Number | **Integer only — paise/cents** |
| `compare_price` | Number | Optional, for sale display |
| `images` | [String] | Array of image URLs |
| `category_id` | ObjectId | Ref: Category |
| `tags` | [String] | |
| `inventory_count` | Number | Min: 0 |
| `is_active` | Boolean | Default: `true` |

**Indexes:** `slug` (unique), `(category_id, is_active)`, `(is_active, createdAt)`, `(name, description)` text

### Cart

| Field | Type | Notes |
|---|---|---|
| `user_id` | ObjectId | Unique — one cart per user |
| `items` | [CartItem] | Embedded array |
| `items.product_id` | ObjectId | |
| `items.name` | String | Snapshot at time of adding |
| `items.price` | Number | Snapshot at time of adding (integer) |
| `items.quantity` | Number | Min: 1 |
| `items.image_url` | String | |
| `total_amount` | Virtual | `sum(price × qty)` — calculated, never stored |

### Order

| Field | Type | Notes |
|---|---|---|
| `user_id` | ObjectId | Ref: User |
| `items` | [OrderItem] | Snapshot of cart at order time |
| `status` | Enum | `pending → paid → shipped → delivered` (or `cancelled`) |
| `shipping_address` | Object | Embedded: full_name, line1, line2, city, state, postal_code, country |
| `total_amount` | Number | Integer |
| `stripe_payment_intent_id` | String | |
| `notes` | String | Max 500 chars |

**Order Status Machine:**

```
pending ──► paid ──► shipped ──► delivered
   │          │          │            │
   └──────────┴──────────┴────────────┴──► cancelled  (admin only)
```

### Session

| Field | Type | Notes |
|---|---|---|
| `user_id` | ObjectId | Ref: User |
| `refresh_token` | String | |
| `expires_at` | Date | TTL index — MongoDB auto-deletes expired sessions |

---

## 📦 Response Format

**Every single response follows one of these two shapes. No exceptions.**

### Success Response

```json
{
  "success": true,
  "data": {
    // actual payload
  },
  "meta": {
    // only on paginated list responses
    "page": 1,
    "per_page": 20,
    "total": 84,
    "total_pages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human readable description",
    "field": "email"
  }
}
```

> `field` is optional — only present on validation errors to indicate which field failed.

### Field Naming Conventions

| Location | Convention | Example |
|---|---|---|
| All JSON fields | `snake_case` | `created_at`, `total_amount`, `is_active` |
| MongoDB `_id` | Always mapped to `id` | `"id": "64b123..."` |
| Timestamps | ISO 8601 UTC string | `"2024-01-15T10:30:00Z"` |
| Money fields | Integer (paise/cents) | `99900` = ₹999.00 |
| `_id`, `__v` | Never in responses | Stripped in `toJSON` transform |

---

## ❌ Error Codes

All error codes and their HTTP status codes are registered in `src/utils/AppError.js`.

### Auth

| Code | Status | Trigger |
|---|---|---|
| `EMAIL_ALREADY_EXISTS` | 409 | Register with duplicate email |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password on login |
| `ACCOUNT_DISABLED` | 403 | Login on an inactive account |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_INVALID` | 401 | Token is malformed or tampered |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token not found or expired in DB |
| `UNAUTHORIZED` | 401 | Request missing a valid token |
| `FORBIDDEN` | 403 | Authenticated user lacks permission |

### Product

| Code | Status | Trigger |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | Product doesn't exist or `is_active: false` |

### Cart

| Code | Status | Trigger |
|---|---|---|
| `CART_EMPTY` | 400 | Checkout attempted with no items |
| `CART_ITEM_NOT_FOUND` | 404 | Item ID not in this user's cart |
| `INSUFFICIENT_INVENTORY` | 400 | Requested qty exceeds `inventory_count` |
| `INVALID_QUANTITY` | 400 | Quantity less than 1 |

### Order

| Code | Status | Trigger |
|---|---|---|
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist or belongs to another user |
| `INVALID_ORDER_STATUS` | 400 | Status transition not allowed by state machine |
| `ORDER_ALREADY_FULFILLED` | 400 | Webhook received twice for same payment intent |

### Payment

| Code | Status | Trigger |
|---|---|---|
| `PAYMENT_INTENT_FAILED` | 400 | Stripe API error |
| `WEBHOOK_SIGNATURE_INVALID` | 400 | Stripe signature verification failed |

### General

| Code | Status | Trigger |
|---|---|---|
| `NOT_FOUND` | 404 | Route doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## ⚡ Business Logic Rules

### Money

- All prices stored and returned as **integers** (paise or cents)
- `99900` = ₹999.00 — division by 100 for display is the **frontend's responsibility**
- `float` is never used for money anywhere in the codebase

### Cart

- One cart per user enforced by unique index on `user_id`
- Adding an item **snapshots** `name`, `price`, `image_url` from the product — price changes to the product do **not** affect existing carts
- Adding the same product again **increments quantity** — no duplicate items
- `total_amount` is a **virtual field**: `sum(item.price × item.quantity)` — never stored, never trusted from the client
- Every quantity change re-validates against current `inventory_count`

### Orders and Inventory

- Inventory is **NOT decremented** when an order is created (`status: pending`)
- Inventory is decremented **only after** Stripe webhook confirms `payment_intent.succeeded`
- Decrement uses **atomic `$inc`** with filter `{ inventory_count: { $gte: quantity } }` — prevents overselling
- `fulfillOrder()` is **idempotent** — calling it twice for the same `payment_intent_id` is a no-op
- Users can only see **their own orders** — `user_id` is always taken from the JWT, never from query params

### Security

- `user_id` is **always taken from `req.user._id`** (set by JWT middleware) — never from `req.body`
- Login always returns `INVALID_CREDENTIALS` whether the email doesn't exist or the password is wrong — never reveals user existence
- `hashed_password` has `select: false` in Mongoose schema — never returned from any query by default
- Stripe webhook verifies the signature before any processing — returns 400 on invalid signature
- Always responds HTTP 200 to Stripe regardless of internal processing result — Stripe retries on non-2xx

### Stripe Webhook Setup

Raw request body must be preserved for Stripe signature verification. In `app.js` this is handled by placing the raw body parser **before** `express.json()`:

```js
// Must come BEFORE express.json()
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
```

---

## ✅ Running Tests

Tests use an **in-memory MongoDB** instance via `mongodb-memory-server`. No real database connection is needed.

```bash
# Run all tests once
npm test

# Run a single test file
npx jest tests/auth.test.js

# Watch mode — re-runs on file save
npm run test:watch

# Generate coverage report
npm run test:cover
```

### Test Suite Overview

| File | Coverage |
|---|---|
| `auth.test.js` | Register, login, token refresh, protected route access |
| `products.test.js` | List, filters, pagination, slug lookup, inactive product hiding |
| `cart.test.js` | Add item, quantity update, remove, inventory guard, server-side total |
| `orders.test.js` | Order creation, user isolation, admin status update, access control |
| `checkout-flow.test.js` | Full journey: register → add to cart → create order → simulate webhook → verify inventory decremented + cart cleared + idempotency |
| `contract.test.js` | Every response has correct shape, no `_id`, no password, prices are integers |

### Expected Output

```
 PASS  tests/auth.test.js
 PASS  tests/products.test.js
 PASS  tests/cart.test.js
 PASS  tests/orders.test.js
 PASS  tests/checkout-flow.test.js
 PASS  tests/contract.test.js

Test Suites: 6 passed, 6 passed
Tests:       31 passed, 31 passed
Time:        ~8s
```

---

## 🐳 Docker Setup

### Local Development

```bash
# Start full stack (frontend + backend + MongoDB)
docker-compose up

# Start only backend + MongoDB
docker-compose up backend mongo

# Rebuild after adding/removing npm packages
docker-compose up --build
```

### `docker-compose.yml` (backend + MongoDB)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      MONGODB_URL: mongodb://mongo:27017/ecommerce
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      FRONTEND_URL: http://localhost:3000
    depends_on: [mongo]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

volumes:
  mongo_data: {}
```

> Secrets are passed via your `.env` file using `${VARIABLE}` syntax. Never hardcode them in `docker-compose.yml`.

---

## 🌿 Git Workflow

| Branch | Purpose | Rule |
|---|---|---|
| `main` | Production — always deployable | Protected. Requires 2 approvals + CI pass |
| `dev` | Integration branch | Protected. Requires 1 approval + CI pass |
| `feat/name` | Feature branches | Cut from `dev`, merge back to `dev` |
| `fix/name` | Bug fixes | Cut from `dev`, or from `main` for hotfixes |
| `chore/name` | Config, deps, docs | Same as `feat` branches |

### Commit Message Convention

```
feat(cart):     add server-side inventory validation on quantity update
fix(auth):      handle expired refresh token gracefully with correct error code
chore(deps):    upgrade stripe to v14
test(orders):   add end-to-end checkout flow test with idempotency check
docs:           update README with Docker setup instructions
refactor(products): extract search logic to product.service.js
```

---

## 📏 Hard Rules

### Never Do This

| Rule | Why |
|---|---|
| Store money as `float` | `0.1 + 0.2 = 0.30000000000000004` — always use integers |
| Return `_id` in responses | Frontend contract requires `id` only |
| Accept `user_id` from `req.body` | Always use `req.user._id` from JWT middleware |
| Return `hashed_password` | Sensitive — `select: false` on schema handles this |
| Say "user not found" on login | Leaks user existence — always `INVALID_CREDENTIALS` |
| Trust `total_amount` from client | Always recalculate from DB cart server-side |
| Use `res.json()` directly in controllers | Always use `response.success()` or `response.error()` helpers |
| Write `try/catch` in every controller | Use the `asyncHandler` wrapper instead |
| Forget `express.raw()` before `express.json()` for webhook | Stripe needs raw bytes for signature verification |
| Push directly to `main` or `dev` | Always go through a PR |
| Change API field names without notifying Dev A | Silent changes break the frontend |

### Always Do This

| Rule | Why |
|---|---|
| Wrap every async controller in `asyncHandler` | Errors auto-forwarded to global error middleware |
| Throw `AppError.create('CODE')` | Consistent error shape, never raw `res.status().json()` |
| Snapshot product name + price into cart/order items | Protects against price changes after add |
| Use atomic `$inc` for inventory decrements | Prevents overselling under concurrent requests |
| Make `fulfillOrder()` idempotent | Stripe can fire webhooks more than once |
| Update Postman collection before Dev A builds UI | Contract must be agreed before coding starts |
| Link every PR to a GitHub issue | Traceability — no mystery merges |

---

## 👥 Team Context

This backend is part of a 3-developer team building the same platform:

| Dev | Role | What they own |
|---|---|---|
| **Dev A** | Frontend Lead | Next.js storefront — consumes this API |
| **Dev B** | Backend Lead (you) | This Node.js API |
| **Dev C** | DevOps / Full-Stack | CI/CD, admin panel, QA |

**API Contract Rule:** Any change to a field name, response shape, or error code must be raised as a PR and approved by Dev A before the change is implemented. Silent changes break the frontend.

**Parallel Development:** Dev A builds against MSW (Mock Service Worker) mocks during the week. On Thursday, mocks are swapped for the real API. This means the contract must be published (Postman collection committed) before Dev A starts the UI for any feature.

---

## 📅 Build Phases

| Week | Focus | Backend Deliverable |
|---|---|---|
| 1 | Project scaffold, utilities, error handling | Server runs, `/health` passes, all core files in place |
| 2 | Auth endpoints, product catalog, categories | Auth working, Postman collection v1 committed to repo |
| 3 | Cart service with inventory validation | Full cart flow on staging, server-side total verified |
| 4 | Stripe payments, webhooks, order creation | End-to-end payment in Stripe test mode, idempotent webhook |
| 5 | Order history, user profile, admin endpoints | All planned endpoints complete and documented |
| 6 | Integration week — fix Dev A's reported mismatches | Zero contract mismatches, OpenAPI/Postman updated |
| 7 | Rate limiting, index optimization, response caching | Load test passing, slow queries fixed |
| 8 | Production deploy, live Stripe keys, security audit | Live in production, zero Sentry errors for 1 hour post-launch |

---

## 📬 Postman Collection

The Postman collection is committed at `/docs/api/ecommerce.postman.json`.

Import it and set these **Collection Variables**:

| Variable | Value |
|---|---|
| `base_url` | `http://localhost:8000/api/v1` |
| `access_token` | Auto-set after login via Postman test script |

The login request automatically sets `{{access_token}}` from the response body — all subsequent authenticated requests pick it up automatically without manual copy-paste.
