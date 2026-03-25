# 🏺 KalaKart
# 🏺 KalaKart

> **"Where Every Craft Tells a Story"**

## 📖 About
KalaKart is a full-stack handmade art marketplace dedicated to connecting local Indian artisans with customers. It provides a platform for artisans to showcase and sell their unique creations, bridging the gap between traditional craftsmanship and modern e-commerce.

## ✨ Features
### Backend (100% Completed)
- 🔐 **JWT Authentication**: Register, Login, Refresh Token flow securely implemented.
- 🌱 **Database Seeding**: 70 real artisan products seeded across 7 diverse categories.
- 🛠️ **Comprehensive APIs**: Auth, Products, Categories, Cart, Orders, Payment endpoints fully functional.
- 👥 **Role-based Access Control**: Dedicated roles and boundaries for Customer, Artisan, and Admin.
- 🛡️ **Security & Reliability**: Global error handling, CORS, and robust security headers configured (Helmet, Morgan).

### Frontend (70% Completed)
- 📱 **Beautiful, Responsive UI**: Crafted with React and Tailwind CSS for optimal user experience across devices.
- 🛍️ **Dynamic Shop Page**: Fully connected to real MongoDB data.
- 🏷️ **Functional Filtering**: 7 category filters working seamlessly.
- 🪝 **Custom React Hooks**: Clean logic abstraction using `useProducts`, `useCategories`, and `useProduct`.
- 🔌 **API Service Layer**: Centralized backend communication in `api.ts`.
- 🛒 **Core Pages Built**: Auth, Cart, Wishlist, Checkout, and detailed Product pages.

## 📚 7 Product Categories
Pottery • Clothing • Home Decor • Textile and Fabrics • Jewellery • Art and Paintings • Crafts and Weaving

## 🛠 Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, bcryptjs
- **Payment:** Stripe
- **Dev Tools:** Nodemon, dotenv, Morgan, Helmet

## 📂 Folder Structure
```text
KalaKart/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── Routes/v1/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── data/
│   │   └── kalakart_artisan_products.json
│   └── seed.js
└── Frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        └── utils/
            └── api.ts
```

## 🔌 API Endpoints
| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate & login user |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT authentication token |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/v1/products` | Fetch, create, update, or remove products |
| `GET` | `/api/v1/categories` | Retrieve all product categories |
| `GET`/`POST`/`DELETE` | `/api/v1/cart` | View, add to, or clear user shopping cart |
| `GET`/`POST`/`PUT` | `/api/v1/orders` | View, place, or update an order |
| `POST` | `/api/v1/payment/create-intent`| Create Stripe payment intent for checkout |
| `POST` | `/api/v1/payment/webhook` | Webhook for Stripe payment events |

## 🚀 Getting Started

Follow these step-by-step instructions to get a local copy of KalaKart up and running.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/KalaKart.git
cd KalaKart
```

### 2. Install dependencies
Open two terminal windows/tabs to setup both frontend and backend.
```bash
# Terminal 1 (Backend)
cd backend
npm install

# Terminal 2 (Frontend)
cd Frontend
npm install
```

### 3. Create `.env` files
Create a `.env` file in the **backend** directory and configure your environment variables (see table below).
Create another `.env` file in the **Frontend** directory.

### 4. Seed the database
Seed the MongoDB database with the initial 70 artisan products.
```bash
# Inside the backend directory
npm run seed
# or
node seed.js
```

### 5. Start the backend server
```bash
# Inside the backend directory
npm run dev
```

### 6. Start the frontend application
```bash
# Inside the Frontend directory
npm run dev
```

## ⚙️ Environment Variables

### Backend `.env`
| Variable | Description |
| :--- | :--- |
| `PORT` | The port your backend runs on (e.g., 5000) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_REFRESH_SECRET` | Secret key for refresh token |
| `STRIPE_SECRET_KEY` | Secret key from your Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET`| Secret key for Stripe webhooks |

### Frontend `.env`
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The URL where your backend is running (e.g., http://localhost:5000) |
| `VITE_STRIPE_PUBLIC_KEY` | Public key from your Stripe Dashboard |

## 📡 Sample API Requests

### User Login (`POST /api/v1/auth/login`)
```json
// Request Body
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "Jane User",
    "role": "Customer"
  }
}
```

### Fetch Products (`GET /api/v1/products`)
```json
// Response
{
  "success": true,
  "count": 70,
  "data": [
    {
      "_id": "64b12c8a9f1a2b3c4d5e6f7g",
      "name": "Hand-painted Blue Pottery Vase",
      "category": "Pottery",
      "price": 1200,
      "artisan": "Jaipur Crafts Co.",
      "stock": 15
    }
  ]
}
```

---

Built with love to empower local Indian artisans 🏺
