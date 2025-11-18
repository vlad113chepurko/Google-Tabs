import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import { useTabsStore } from "./store/useTabsStore";
import { tabsData } from "./components/tabs/TabsData";

function Root() {
  const navigate = useNavigate();
  const activeTabId = useTabsStore((s) => s.activeTabId);

  useEffect(() => {
    if (!activeTabId) return;
    const state = (useTabsStore as any).getState();
    const tab = state.tabs.find(
      (t: any) => String(t.id) === String(activeTabId)
    );
    if (!tab) return;
    if (typeof tab.url === "string") {
      const target = tab.url.startsWith("/") ? tab.url : `/${tab.url}`;
      if (target !== window.location.pathname) {
        navigate(target, { replace: false });
      }
    }
  }, [activeTabId, navigate]);

  return <Outlet />;
}

const childRoutes = [
  { index: true, element: <App /> },
  ...tabsData.map((t) => {
    const path =
      typeof t.url === "string"
        ? t.url.startsWith("/")
          ? t.url.slice(1)
          : t.url
        : `${t.id}`;
    return {
      path,
      element: <App />,
    };
  }),
  { path: "*", element: <div>404 Not Found</div> },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: childRoutes,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
