import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Artisans from "./pages/Artisans";
import ArtisanDetail from "./pages/ArtisanDetail";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// This will be passed via loader context
export const createRouter = (cartItems: any[], onAddToCart: any, onUpdateQuantity: any, onRemoveItem: any) => {
  return createBrowserRouter([
    {
      path: "/",
      element: <Root cartItems={cartItems} />,
      children: [
        { index: true, element: <Home /> },
        { path: "shop", element: <Shop /> },
        { 
          path: "product/:id", 
          element: <ProductDetail onAddToCart={onAddToCart} /> 
        },
        { path: "artisans", element: <Artisans /> },
        { path: "artisan/:id", element: <ArtisanDetail /> },
        { 
          path: "cart", 
          element: <Cart cartItems={cartItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} /> 
        },
        { path: "about", element: <About /> },
        { path: "auth", element: <Auth /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);
};