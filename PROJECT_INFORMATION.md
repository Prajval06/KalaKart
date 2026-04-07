# KalaKart Project Information

## Overview

KalaKart is a full-stack artisan marketplace project built to connect customers with Indian artisans through an e-commerce experience. The codebase combines a React frontend, a Node.js/Express backend, MongoDB models and services, and Python AI services for recommendation, sentiment, and forecasting features.

This document is a short implementation map: what has been built, what each feature does, and where it is implemented.

## Architecture At A Glance

| Layer | Purpose | Main Location |
|---|---|---|
| Frontend | User interface, routing, cart/wishlist/checkout flows, artisan profile views | [Frontend/src](Frontend/src) |
| Backend | REST API, auth, products, cart, orders, users, payments | [backend/src](backend/src) |
| AI Services | Sentiment analysis, recommendations, forecasting | [AI/app](AI/app) |
| Infrastructure | Docker compose, seed scripts, environment setup, docs | [docker-compose.yml](docker-compose.yml), [backend/README.md](backend/README.md), [README.md](README.md) |

## Implemented Features

### 1. Application Shell And Routing

The frontend is organised around a central router and shared layout. Pages are mounted through a root layout so navigation, headers, and shared UI stay consistent.

Where:
- [Frontend/src/routes.tsx](Frontend/src/routes.tsx)
- [Frontend/src/Root.tsx](Frontend/src/Root.tsx)
- [Frontend/src/App.tsx](Frontend/src/App.tsx)

### 2. Authentication

Users can sign up, log in, sign in with Google, and stay authenticated with JWT tokens stored in local storage. The auth flow also supports redirecting users back to checkout after login.

What it does:
- Creates customer or seller accounts.
- Logs users in with email/password.
- Handles Google OAuth callback success.
- Stores the token and user profile in local storage.
- Keeps the cart checkout flow intact after login.

Where:
- [Frontend/src/pages/Auth.tsx](Frontend/src/pages/Auth.tsx)
- [Frontend/src/pages/AuthSuccess.tsx](Frontend/src/pages/AuthSuccess.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/controller/user.controller.js](backend/src/controller/user.controller.js)
- [backend/src/services/auth.service.js](backend/src/services/auth.service.js)
- [backend/src/models/user.model.js](backend/src/models/user.model.js)

### 3. Product Catalog

The product catalog pulls real backend data and also merges static and local artisan products in the frontend context. Product details can be opened from the shop, home page, search, wishlist, cart, and artisan pages.

What it does:
- Lists products in the shop.
- Opens individual product pages.
- Supports related-product suggestions.
- Falls back to local product data when legacy IDs or static catalog entries are used.

Where:
- [Frontend/src/pages/Shop.tsx](Frontend/src/pages/Shop.tsx)
- [Frontend/src/pages/ProductDetail.tsx](Frontend/src/pages/ProductDetail.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/controller/product.controller.js](backend/src/controller/product.controller.js)
- [backend/src/services/product.service.js](backend/src/services/product.service.js)
- [backend/src/models/product.model.js](backend/src/models/product.model.js)

Image handling for product cards and detail views now uses a shared fallback component so broken remote URLs automatically fall back to the local placeholder image instead of rendering corrupted tiles.

### 4. Cart System

The cart supports both guest users and logged-in users. If a guest starts checkout, the selected cart items are preserved through login and then restored afterward so the user can continue checkout without losing the cart.

What it does:
- Adds products to the cart.
- Updates quantity.
- Removes items.
- Persists guest cart activity.
- Merges guest cart items after login.
- Syncs cart state with the backend for logged-in users.

Where:
- [Frontend/src/pages/Cart.tsx](Frontend/src/pages/Cart.tsx)
- [Frontend/src/pages/Checkout.tsx](Frontend/src/pages/Checkout.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/controller/cart.controller.js](backend/src/controller/cart.controller.js)
- [backend/src/services/Cart.service.js](backend/src/services/Cart.service.js)
- [backend/src/models/cart.model.js](backend/src/models/cart.model.js)

### 5. Wishlist System

Users can save products to their wishlist and remove them later. Wishlist items are visible in the wishlist page and can be added straight to cart from there.

What it does:
- Toggles wishlist state.
- Stores wishlist items for guest or logged-in users.
- Syncs wishlist with backend for authenticated users.

Where:
- [Frontend/src/pages/Wishlist.tsx](Frontend/src/pages/Wishlist.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/controller/user.controller.js](backend/src/controller/user.controller.js)
- [backend/src/models/user.model.js](backend/src/models/user.model.js)

### 6. Checkout Flow

The checkout flow walks the user through address, payment, and success states. It carries the cart forward into order placement and stores a completed order in the user’s order history.

What it does:
- Collects delivery address.
- Validates payment step inputs.
- Saves address if requested.
- Places the order.
- Clears the cart after a successful purchase.

Where:
- [Frontend/src/pages/Checkout.tsx](Frontend/src/pages/Checkout.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)

### 7. Artisan Profiles And Artisan Detail Pages

The project has a public artisan directory and individual artisan pages. Each artisan page shows the artisan profile and the products linked to that artisan.

What it does:
- Shows artisan cards in a directory.
- Opens artisan detail pages.
- Displays artisan metadata such as location, craft, and years of experience.
- Lists products made by that artisan.

Where:
- [Frontend/src/pages/Artisans.tsx](Frontend/src/pages/Artisans.tsx)
- [Frontend/src/pages/ArtisanDetail.tsx](Frontend/src/pages/ArtisanDetail.tsx)
- [Frontend/src/pages/Home.tsx](Frontend/src/pages/Home.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/controller/user.controller.js](backend/src/controller/user.controller.js)

### 8. Search And Discovery

The header search box can search across products and artisans. Search results are displayed in a dedicated page, and the header also provides inline suggestions.

What it does:
- Suggests products and artisans as the user types.
- Opens product and artisan pages from search results.
- Supports a separate search results page.

Where:
- [Frontend/src/components/Header.tsx](Frontend/src/components/Header.tsx)
- [Frontend/src/pages/SearchResults.tsx](Frontend/src/pages/SearchResults.tsx)

### 9. Pricing Breakdown And Billing Rules

The project uses a custom billing rule set for product detail, cart, and checkout pages. The current rule is:

- Platform fee: 10% of product price.
- Artisan earnings: 90% of product price.
- Delivery charge: 3% of product price.

What it does:
- Shows a consistent bill breakdown in product detail, cart, and checkout.
- Removes the old predefined transport logic.
- Keeps totals aligned across screens.

Where:
- [Frontend/src/pages/ProductDetail.tsx](Frontend/src/pages/ProductDetail.tsx)
- [Frontend/src/pages/Cart.tsx](Frontend/src/pages/Cart.tsx)
- [Frontend/src/pages/Checkout.tsx](Frontend/src/pages/Checkout.tsx)
- [Frontend/src/utils/shipping.ts](Frontend/src/utils/shipping.ts)

### 10. Backend API Structure

The backend follows a controller-service-model pattern. Controllers stay thin, services hold the business logic, and models define the database schemas.

What it does:
- Exposes product, user, cart, order, payment, and auth APIs.
- Uses standard response helpers for consistent API payloads.
- Applies validation and error middleware.

Where:
- [backend/src/app.js](backend/src/app.js)
- [backend/src/server.js](backend/src/server.js)
- [backend/src/Routes/v1](backend/src/Routes/v1)
- [backend/src/controller](backend/src/controller)
- [backend/src/services](backend/src/services)
- [backend/src/models](backend/src/models)
- [backend/src/middlewares](backend/src/middlewares)
- [backend/src/utils](backend/src/utils)

### 11. Order History

Completed orders are stored and shown in the cart page orders drawer. Each order displays the items, order total, and order status.

Where:
- [Frontend/src/pages/Cart.tsx](Frontend/src/pages/Cart.tsx)
- [Frontend/src/context/AppContext.tsx](Frontend/src/context/AppContext.tsx)
- [backend/src/models/order.model.js](backend/src/models/order.model.js)
- [backend/src/controller/order.controller.js](backend/src/controller/order.controller.js)

### 12. AI Services

The project includes Python services for intelligent features. These are structured as separate API services that can be containerised and tested independently.

What it does:
- Sentiment analysis.
- Product recommendations.
- Forecasting support.

Where:
- [AI/app/main.py](AI/app/main.py)
- [AI/app/routers/sentiment.py](AI/app/routers/sentiment.py)
- [AI/app/routers/recommendations.py](AI/app/routers/recommendations.py)
- [AI/app/routers/forecast.py](AI/app/routers/forecast.py)
- [AI/app/services/sentiment_service.py](AI/app/services/sentiment_service.py)
- [AI/app/services/recommendation_service.py](AI/app/services/recommendation_service.py)
- [AI/app/services/forecast_service.py](AI/app/services/forecast_service.py)

### 13. Seeding And Sample Data

The project contains product seed data and artisan seed helpers to populate the database quickly for development and demos.

Where:
- [backend/seed.js](backend/seed.js)
- [backend/src/scripts/seed.js](backend/src/scripts/seed.js)
- [backend/src/scripts/artisans.seed.js](backend/src/scripts/artisans.seed.js)
- [backend/data/kalakart_artisan_products.json](backend/data/kalakart_artisan_products.json)

### 14. Docker And Dev Setup

The project supports containerised local development and multi-service orchestration.

Where:
- [docker-compose.yml](docker-compose.yml)
- [backend/Dockerfile](backend/Dockerfile)
- [AI/Dockerfile](AI/Dockerfile)
- [Frontend/vite.config.ts](Frontend/vite.config.ts)

## Current Data Flow Summary

1. The frontend loads product and artisan data through the shared app context.
2. The product pages resolve data from the backend first.
3. If a product is a legacy static entry, the frontend can fall back to local catalog data.
4. Cart and wishlist actions are stored locally for guests and synchronized when the user logs in.
5. Checkout uses the current pricing rules and persists order history after purchase.

## Notes On The Current State

- The project has a working backend starter and a structured frontend UI.
- Several flows now use merged local and backend data to keep guest and logged-in experiences consistent.
- The frontend build currently passes.

## Short Conclusion

KalaKart already has the main e-commerce and artisan marketplace features implemented: authentication, catalog browsing, product detail, cart, wishlist, checkout, artisan pages, backend APIs, and AI service scaffolding. The remaining work is mostly refinement, polish, and integration hardening.