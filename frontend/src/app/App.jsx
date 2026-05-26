import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
      Chargement...
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} fallbackElement={<RouteFallback />} />
    </AppProvider>
  );
}
