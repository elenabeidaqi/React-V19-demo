import { createRootRoute, Outlet } from "@tanstack/react-router";
import Navigation from "../components/Navigation";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen p-5">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  ),
});

