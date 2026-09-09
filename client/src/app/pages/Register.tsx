import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield } from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState<"ADMIN" | "AUDITOR">("AUDITOR");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // await register(name, email, password, role);
      // navigate(role === "ADMIN" ? "/admin/dashboard" : "/auditor/dashboard");
      await register(name, email, password);
      navigate('/auditor/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-[#DEDEDE]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#EB8C00] rounded-lg flex items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#333333]">Create Account</h1>
          <p className="text-sm text-gray-600 mt-2">
            Register for Audit Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] transition-all"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "AUDITOR")}
              className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] transition-all"
            >
              <option value="AUDITOR">Auditor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div> */}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#EB8C00] hover:bg-[#D04A02] disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#EB8C00] hover:text-[#D04A02] font-medium"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
