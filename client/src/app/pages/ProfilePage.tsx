import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { userService, UserProfile } from "../services/userService";
import { Mail, Shield, User as UserIcon, Loader2 } from "lucide-react";

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userService
      .getProfile()
      .then(setProfile)
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Profile" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Profile" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error || "Profile not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16">
      <Header title="Profile" />

      <div className="p-8">
        <div className="max-w-3xl">
          <div className="bg-[#F8F8F8] rounded-lg p-8 border border-[#DEDEDE] shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-[#EB8C00] flex items-center justify-center text-white text-3xl font-bold">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#333333]">
                  {profile.name}
                </h3>
                <p className="text-gray-600 mt-1">{profile.role}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-[#DEDEDE]">
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="text-[#EB8C00]" size={20} />
                  <h4 className="font-semibold text-[#333333]">Full Name</h4>
                </div>
                <p className="text-gray-700 ml-8">{profile.name}</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-[#DEDEDE]">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="text-[#EB8C00]" size={20} />
                  <h4 className="font-semibold text-[#333333]">
                    Email Address
                  </h4>
                </div>
                <p className="text-gray-700 ml-8">{profile.email}</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-[#DEDEDE]">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-[#EB8C00]" size={20} />
                  <h4 className="font-semibold text-[#333333]">Role</h4>
                </div>
                <p className="text-gray-700 ml-8">{profile.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
