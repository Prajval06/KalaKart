import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Artisans from "./pages/Artisans";
import ArtisanDetail from "./pages/ArtisanDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Auth from "./pages/Auth";
import AuthSuccess from "./pages/AuthSuccess";
import SellerDashboard from "./pages/SellerDashboard";
import SetupProfile from "./pages/SetupProfile";
import CategoryPage from "./pages/CategoryPage";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";

// Router is created ONCE so the history stack is never reset.
// State is shared via AppContext (context/AppContext.tsx).
export const router = createBrowserRouter([
  {
    // Auth-success is outside Root so it has no navbar/footer — it immediately redirects
    path: "/auth-success",
    element: <AuthSuccess />,
  },
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "artisans", element: <Artisans /> },
      { path: "artisan/:artisanId", element: <ArtisanDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "about", element: <About /> },
      { path: "auth", element: <Auth /> },
      { path: "seller-dashboard", element: <SellerDashboard /> },
      { path: "setup-profile", element: <SetupProfile /> },
      { path: "search", element: <SearchResults /> },
      { path: "category/:categoryName", element: <CategoryPage /> },
      { path: "checkout", element: <Checkout /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);