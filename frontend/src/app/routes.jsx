import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./componant/MainLayout";

const lazyComponent = (importer, exportName) => async () => {
  const module = await importer();
  return {
    Component: module[exportName],
  };
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        lazy: lazyComponent(() => import("./componant/Dashboard"), "Dashboard"),
      },
      {
        path: "search",
        lazy: lazyComponent(() => import("./componant/OfferSearch"), "OfferSearch"),
      },
      {
        path: "offer/:id",
        lazy: lazyComponent(() => import("./componant/OfferDetail"), "OfferDetail"),
      },
      {
        path: "settings",
        lazy: lazyComponent(() => import("./componant/Settings"), "Settings"),
      },
      {
        path: "candidatures",
        lazy: lazyComponent(() => import("./componant/Candidatures"), "Candidatures"),
      },
      {
        path: "applications",
        lazy: lazyComponent(() => import("./componant/Applications"), "Applications"),
      },
      {
        path: "ai-assistant",
        lazy: lazyComponent(() => import("./componant/AIAssistant"), "AIAssistant"),
      },
      {
        path: "recruiter",
        lazy: lazyComponent(
          () => import("./componant/RecruiterDashboard"),
          "RecruiterDashboard"
        ),
      },
      {
        path: "jobs",
        lazy: lazyComponent(
          () => import("./componant/RecruiterJobsPage"),
          "RecruiterJobsPage"
        ),
      },
      {
        path: "admin",
        lazy: lazyComponent(() => import("./componant/AdminDashboard"), "AdminDashboard"),
      },
      {
        path: "moderation",
        lazy: lazyComponent(
          () => import("./componant/AdminModeration"),
          "AdminModeration"
        ),
      },
      {
        path: "users",
        lazy: lazyComponent(() => import("./componant/AdminUsers"), "AdminUsers"),
      },
      {
        path: "support",
        lazy: lazyComponent(() => import("./componant/AdminSupport"), "AdminSupport"),
      },
      {
        path: "admin-settings",
        lazy: lazyComponent(() => import("./componant/AdminSettings"), "AdminSettings"),
      },
      {
        path: "*",
        lazy: lazyComponent(() => import("./componant/NotFound"), "NotFound"),
      },
    ],
  },
  {
    path: "/login",
    lazy: lazyComponent(() => import("./componant/Login"), "Login"),
  },
  {
    path: "/register",
    lazy: lazyComponent(() => import("./componant/Register"), "Register"),
  },
  {
    path: "/forgot-password",
    lazy: lazyComponent(
      () => import("./componant/ForgotPassword"),
      "ForgotPassword"
    ),
  },
  {
    path: "/privacy",
    lazy: lazyComponent(() => import("./componant/Privacy"), "Privacy"),
  },
  {
    path: "/terms",
    lazy: lazyComponent(() => import("./componant/Terms"), "Terms"),
  },
]);
