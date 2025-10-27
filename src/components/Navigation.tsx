import { Link, useLocation } from "react-router";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white p-4 rounded-b-xl fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto flex gap-6">
        <Link
          to="/"
          className={`px-4 py-2 rounded-md transition-colors ${
            isActive("/") ? "bg-blue-800" : "hover:bg-blue-700"
          }`}
        >
          Home
        </Link>
        <Link
          to="/useactionstate"
          className={`px-4 py-2 rounded-md transition-colors ${
            isActive("/useactionstate") ? "bg-blue-800" : "hover:bg-blue-700"
          }`}
        >
          useActionState Example
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;

