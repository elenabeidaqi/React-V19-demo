import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import "./App.css";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import ActionStateExample from "./new-features/ActionStateExample";

const RootLayout = () => (
  <div className="min-h-screen">
    <Navigation />
    <main>
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/useactionstate",
        element: <ActionStateExample />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
