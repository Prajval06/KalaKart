import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { ToastContainerFromContext } from "./components/ToastContainer";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainerFromContext />
    </AppProvider>
  );
}
