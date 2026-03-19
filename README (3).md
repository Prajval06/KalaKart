# 🛒 E-Commerce Platform

A production-grade full-stack e-commerce platform built by a 3-person startup team. Supports product catalog, shopping cart, Stripe checkout, order management, and an admin panel.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Payments | Stripe (PaymentIntents + Webhooks) |
| Validation | Joi |
| Testing | Jest + Supertest + mongodb-memory-server |
| DevOps | Docker + docker-compose + GitHub Actions |
| Monitoring | Sentry |

---

## 👥 Team

| Role | Owns |
|---|---|
| Dev A — Frontend Lead | Next.js storefront, UI components, API integration |
| Dev B — Backend Lead | Node.js API, MongoDB schemas, auth, payments |
| Dev C — DevOps / QA | CI/CD, Docker, admin panel, E2E tests |

---

## 📁 Project Structure

```
ecommerce/
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                # Pages (shop, auth, account)
│   │   ├── components/         # UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand state slices
│   │   ├── lib/                # Axios client, NextAuth config
│   │   ├── types/              # TypeScript types
│   │   └── mocks/              # MSW mock handlers (dev only)
│   ├── .env.local
│   └── next.config.mjs
│
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── app.js              # Express setup
│   │   ├── config/             # Env var config
│   │   ├── routes/v1/          # All API routes
│   │   ├── controllers/        # Thin req/res handlers
│   │   ├── services/           # All business logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── middlewares/        # Auth, validation, error handling
│   │   ├── validators/         # Joi schemas
│   │   ├── utils/              # AppError, asyncHandler, response helpers
│   │   └── scripts/            # Seed script
│   ├── tests/                  # Jest test suite
│   ├── .env
│   └── Dockerfile
│
├── docs/
│   └── api/
│       └── ecommerce.postman.json
│
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas URI
- Stripe account (for payment testing)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ecommerce.git
cd ecommerce
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```
PORT=8000
MONGODB_URL=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-long-random-secret-here
JWT_EXPIRE_MINUTES=30
REFRESH_EXPIRE_DAYS=7
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected
🚀 Server running on port 8000
```

Seed the database with test data:

```bash
npm run seed
```

This creates:
- 2 categories (Electronics, Clothing)
- 3 products (Headphones, Keyboard, T-Shirt)
- 1 admin user → `admin@ecommerce.com` / `admin123456`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Fill in your `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PK=pk_test_xxxx
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### 4. Run with Docker (recommended)

```bash
# From the project root
docker-compose up --build
```

This starts MongoDB, the backend on port 8000, and the frontend on port 3000 together.

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode while developing
npm run test:watch

# With coverage report
npm run test:cover
```

Tests use an in-memory MongoDB — no real database or Stripe account needed.

### Test files

| File | What it tests |
|---|---|
| `auth.test.js` | Register, login, refresh token, protected routes |
| `products.test.js` | Product list, filters, pagination, slug lookup |
| `cart.test.js` | Add/update/remove items, inventory validation, total calculation |
| `orders.test.js` | Order creation, history, access control, admin status update |
| `checkout-flow.test.js` | Full end-to-end: register → cart → order → webhook → verify |
| `contract.test.js` | Every response shape matches the agreed API contract |

All tests must pass before merging any PR.

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api/v1`

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register new customer |
| POST | `/auth/login` | None | Login — returns access + refresh token |
| POST | `/auth/refresh` | Refresh token | Get new access token |

### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/products` | None | Paginated product list with filters |
| GET | `/products/:slug` | None | Single product by slug |
| GET | `/categories` | None | All categories |

Query params for `/products`: `page`, `per_page`, `category`, `search`, `min_price`, `max_price`, `sort`

### Cart

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/cart` | JWT | Get current user's cart |
| POST | `/cart/items` | JWT | Add item to cart |
| PATCH | `/cart/items/:itemId` | JWT | Update item quantity |
| DELETE | `/cart/items/:itemId` | JWT | Remove item from cart |

### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/orders` | JWT | Create order from cart |
| GET | `/orders` | JWT | Get user's order history |
| GET | `/orders/:orderId` | JWT | Get single order |

### Payments

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/payments/intent` | JWT | Create Stripe PaymentIntent |
| POST | `/payments/webhook` | Stripe Signature | Handle Stripe webhook events |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | JWT | Get current user profile |
| PATCH | `/users/me` | JWT | Update profile |
| POST | `/users/me/change-password` | JWT | Change password |

### Admin

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/orders` | Admin JWT | All orders with filters |
| PATCH | `/admin/orders/:orderId/status` | Admin JWT | Update order status |
| POST | `/admin/products` | Admin JWT | Create new product |
| PATCH | `/admin/products/:productId` | Admin JWT | Update product |
| DELETE | `/admin/products/:productId` | Admin JWT | Soft-delete product |

---

## 📐 API Response Format

Every response from the API follows these exact shapes — no exceptions.

**Success:**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 84,
    "total_pages": 5
  }
}
```

> `meta` only appears on paginated list responses.

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human readable description",
    "field": "fieldname"
  }
}
```

> `field` only appears on validation errors.

### Error Code Registry

| Domain | Codes |
|---|---|
| Auth | `EMAIL_ALREADY_EXISTS` `INVALID_CREDENTIALS` `ACCOUNT_DISABLED` `TOKEN_EXPIRED` `TOKEN_INVALID` `INVALID_REFRESH_TOKEN` `UNAUTHORIZED` `FORBIDDEN` |
| Product | `PRODUCT_NOT_FOUND` |
| Cart | `CART_EMPTY` `CART_ITEM_NOT_FOUND` `INSUFFICIENT_INVENTORY` `INVALID_QUANTITY` |
| Order | `ORDER_NOT_FOUND` `INVALID_ORDER_STATUS` `ORDER_ALREADY_FULFILLED` |
| Payment | `PAYMENT_INTENT_FAILED` `WEBHOOK_SIGNATURE_INVALID` |
| General | `VALIDATION_ERROR` `NOT_FOUND` `RATE_LIMIT_EXCEEDED` `INTERNAL_ERROR` |

---

## 🗄️ Database

### Collections

| Collection | Description |
|---|---|
| `users` | Customer and admin accounts |
| `products` | Product catalog |
| `categories` | Product categories |
| `carts` | One cart per user (server-side persistent) |
| `orders` | Order history with item snapshots |
| `sessions` | Refresh token storage with auto-expiry TTL |

### Key Design Decisions

**Money is always stored as integers.**
`₹299.99` is stored as `29999` (paise). Never floats. Frontend divides by 100 for display only.

**Products are snapshotted into cart and order items.**
When a user adds a product to cart, the product's `name` and `price` are copied into the cart item at that moment. Price changes after that don't affect existing carts or past orders.

**Products are never hard deleted.**
Setting `is_active: false` hides a product from the storefront. Orders that already reference it remain intact.

**Order status is a one-way state machine.**
```
pending → paid → shipped → delivered
any status → cancelled  (admin only)
```

**Cart total is always server-calculated.**
The `total_amount` field is a virtual computed from `item.price * item.quantity` for all items. A total sent from the client is never trusted.

---

## 🔐 Authentication

- JWT Bearer tokens for all protected routes
- Access token expires in 30 minutes
- Refresh token expires in 7 days, stored in MongoDB `sessions` collection
- MongoDB TTL index auto-deletes expired sessions — no cron job needed
- Two roles: `customer` and `admin`
- Passwords hashed with bcrypt (12 salt rounds)
- `hashed_password` field has `select: false` — never returned by any query by default

Using the API with auth:
```
Authorization: Bearer <access_token>
```

---

## 💳 Stripe Payments

**Payment flow:**
1. User fills cart and proceeds to checkout
2. Frontend calls `POST /payments/intent` → receives `client_secret`
3. Frontend renders Stripe Elements and user enters card details
4. Stripe processes payment using the `client_secret`
5. Stripe sends `payment_intent.succeeded` event to `POST /payments/webhook`
6. Webhook marks order as `paid`, decrements inventory atomically, clears cart

**Testing Stripe locally:**

Install the Stripe CLI and forward webhook events:
```bash
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
```

Copy the webhook signing secret printed by the CLI into your `.env` as `STRIPE_WEBHOOK_SECRET`.

Test card numbers:
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `8000` | Server port |
| `MONGODB_URL` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRE_MINUTES` | No | `30` | Access token lifetime |
| `REFRESH_EXPIRE_DAYS` | No | `7` | Refresh token lifetime |
| `STRIPE_SECRET_KEY` | Yes | — | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | — | Stripe webhook signing secret |
| `FRONTEND_URL` | Yes | — | Allowed CORS origin |
| `NODE_ENV` | No | `development` | `development` or `production` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL |
| `NEXT_PUBLIC_STRIPE_PK` | Yes | Stripe publishable key (`pk_test_...`) |
| `NEXTAUTH_SECRET` | Yes | NextAuth signing secret |
| `NEXTAUTH_URL` | Yes | Frontend base URL |

---

## 🔄 Git Workflow

### Branch naming

```
feat/cart-validators
fix/order-total-calculation
chore/seed-script
test/checkout-flow
```

### Commit message format

```
feat(cart): add Joi validation to addItem route
fix(orders): correct total_amount server-side calculation
chore(seed): add seed script with categories and products
test(auth): add ACCOUNT_DISABLED test case
docs(api): update Postman collection with payment routes
```

### Branch protection rules

| Branch | Purpose | Rules |
|---|---|---|
| `main` | Production | Protected — 2 approvals + passing CI required |
| `dev` | Integration | Protected — 1 approval + passing CI required |
| `feat/*` | New features | Cut from `dev`, merge back to `dev` via PR |
| `fix/*` | Bug fixes | Cut from `dev` or `main` for hotfixes |

---

## 🚦 CI/CD Pipeline

GitHub Actions runs automatically on every push and pull request:

1. Install dependencies
2. Run linter
3. Run full Jest test suite
4. Build Docker image
5. Deploy to staging — on merge to `dev`
6. Deploy to production — on merge to `main`

A PR cannot merge if any step fails.

---

## 🛡️ Hard Rules

**Never:**
- Store money as `float` — always `integer` (paise/cents)
- Return `_id` or `__v` in any API response
- Accept `user_id` from request body — always use `req.user._id` from JWT
- Return `hashed_password` in any response
- Say "user not found" on failed login — always return `INVALID_CREDENTIALS`
- Trust `total_amount` from the client — always recalculate server-side from DB
- Hard delete products — always soft delete by setting `is_active: false`
- Push directly to `main` or `dev` — always open a PR
- Change an API field name without notifying Dev A first

**Always:**
- Wrap every controller with `asyncHandler` — no raw try/catch blocks
- Throw `AppError.create('CODE')` — never `res.status().json()` directly
- Validate request body with Joi before touching the database
- Snapshot product `name` and `price` into cart and order items at time of action
- Use atomic `$inc` for inventory decrements — never read-then-write
- Make the Stripe webhook handler idempotent — safe to receive the same event twice
- Write or update tests when adding a new feature
- Update the Postman collection when adding or changing endpoints

---

## 📬 Postman Collection

Import `docs/api/ecommerce.postman.json` into Postman.

Set the collection variable `base_url` to match your environment:

| Environment | URL |
|---|---|
| Local | `http://localhost:8000/api/v1` |
| Staging | `https://staging-api.yourproject.com/api/v1` |
| Production | `https://api.yourproject.com/api/v1` |

The login request automatically sets the `access_token` collection variable via a test script. All protected requests use `{{access_token}}` — no manual copy-pasting needed.

---

## 🐛 Common Issues

**Server won't start — "Missing required env var: X"**
You have not filled in all values in your `.env`. The variable name is in the error message — add it.

**Tests timing out — MongoMemoryServer**
Increase `testTimeout` to `60000` in `jest.config.js`.

**`_id` appearing in API responses**
Your Mongoose model's `toJSON` transform is not set up, or you used `.lean()` without manually transforming the result. Check the `toJSON` block in the relevant model.

**Cart total is wrong**
Total is always calculated server-side as a virtual on the Cart model. Check `cart.service.js` — the `total_amount` is `sum of (item.price * item.quantity)`.

**Stripe webhook returning 400 — "No signatures found"**
The raw request body is being parsed by `express.json()` before it reaches the webhook handler. Make sure `express.raw({ type: 'application/json' })` is registered for `/api/v1/payments/webhook` before `express.json()` in `app.js`.

**CORS errors from frontend**
Your `FRONTEND_URL` env var must exactly match the origin the frontend runs on, including the port. No trailing slash. Example: `http://localhost:3000` not `http://localhost:3000/`.

**`fulfillOrder` not idempotent — double-processing**
Check that `order.service.js` returns early if `order.status !== 'pending'` before doing any work. The idempotency check must be the very first thing in that function.

---

## 📋 Pre-Launch Checklist

```
SERVER
  [ ] npm run dev starts cleanly with no errors
  [ ] All environment variables set in production environment
  [ ] CORS restricted to production frontend URL only
  [ ] NODE_ENV set to production

DATABASE
  [ ] MongoDB Atlas production cluster configured
  [ ] All indexes created and verified
  [ ] Automated backups enabled on Atlas
  [ ] Connection string uses a dedicated DB user with limited permissions

TESTS
  [ ] npm test — all tests pass, zero failures, zero skips

STRIPE
  [ ] Live Stripe keys set (sk_live_... not sk_test_...)
  [ ] Webhook endpoint registered in Stripe Dashboard
  [ ] Live webhook secret updated in production env vars
  [ ] One real test transaction completed end-to-end

SECURITY
  [ ] JWT_SECRET is a random string of 32+ characters
  [ ] No secrets in source code or git history
  [ ] Rate limiting active on auth routes
  [ ] Helmet middleware active
  [ ] Error responses in production do not expose stack traces

MONITORING
  [ ] Sentry DSN configured for backend
  [ ] Sentry DSN configured for frontend
  [ ] Health check endpoint returning 200
  [ ] Uptime monitoring configured
  [ ] Slack or email alert set up for production errors
```

---

## 📄 License

MIT
