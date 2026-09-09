import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#EB8C00]">404</h1>
          <p className="text-3xl font-bold text-[#333333] mt-4">
            Page Not Found
          </p>
          <p className="text-gray-600 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-[#EB8C00] hover:bg-[#D04A02] text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
        >
          <Home size={20} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
