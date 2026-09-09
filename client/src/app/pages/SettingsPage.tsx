import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  User,
  Shield,
  CheckCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Bell,
  FileText,
  AlertCircle,
  UserCheck,
  ClipboardList,
  Save,
  Key,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userService } from '../services/userService';

export default function SettingsPage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Profile state
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    notify_audits: true,
    notify_findings: true,
    notify_reports: true,
    notify_registrations: true,
  });
  const [notifSubmitting, setNotifSubmitting] = useState(false);
  const [notifMessage, setNotifMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getProfile()
      .then((u) => {
        if (u) {
          setProfile({
            name: u.name,
            email: u.email,
          });
          setNotifications({
            notify_audits: u.notify_audits ?? true,
            notify_findings: u.notify_findings ?? true,
            notify_reports: u.notify_reports ?? true,
            notify_registrations: u.notify_registrations ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      setProfileSubmitting(true);
      const res = await userService.updateProfile({
        name: profile.name,
        email: profile.email,
      });

      if (currentUser) {
        updateCurrentUser({
          ...currentUser,
          name: res.user.name,
          email: res.user.email,
        });
      }

      setProfileMessage({ type: 'success', text: 'Profile information updated successfully!' });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwords.currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setPasswordSubmitting(true);
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Please check your current password.',
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updated);
    setNotifMessage(null);

    try {
      setNotifSubmitting(true);
      await userService.updateNotificationPreferences(updated);
      setNotifMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
    } catch (err: any) {
      // Rollback toggle state on error
      setNotifications(notifications);
      setNotifMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update notification preferences.',
      });
    } finally {
      setNotifSubmitting(false);
    }
  };

  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifMessage(null);

    try {
      setNotifSubmitting(true);
      await userService.updateNotificationPreferences(notifications);
      setNotifMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (err: any) {
      setNotifMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update notification preferences.',
      });
    } finally {
      setNotifSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-64 pt-16">
      <Header title="Account Settings" />

      <div className="p-8 max-w-4xl space-y-8">
        {/* Profile Settings Card */}
        <div className="bg-white rounded-2xl border border-[#DEDEDE] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#EB8C00]">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">
                Update your account details and display name.
              </p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`p-4 mb-6 rounded-xl border flex items-center gap-3 ${
                profileMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{profileMessage.text}</span>
            </div>
          )}

          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-[#EB8C00]" size={28} />
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border border-[#DEDEDE] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-900 text-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full border border-[#DEDEDE] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-900 text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} className="text-[#EB8C00]" />
                  <span>Account Role: </span>
                  <span className="font-semibold text-gray-900">{isAdmin ? 'Administrator' : 'Auditor'}</span>
                </div>

                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="px-6 py-2.5 bg-[#EB8C00] hover:bg-[#D04A02] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {profileSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{profileSubmitting ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-[#DEDEDE] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Key size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">
                Ensure your account is using a strong, secure password.
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`p-4 mb-6 rounded-xl border flex items-center gap-3 ${
                passwordMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full border border-[#DEDEDE] rounded-lg pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-900 text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-[#DEDEDE] rounded-lg pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-900 text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full border border-[#DEDEDE] rounded-lg pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-900 text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {passwordSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                <span>{passwordSubmitting ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences Card */}
        <div className="bg-white rounded-2xl border border-[#DEDEDE] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bell size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">
                Choose which types of notifications you want to receive in your feed.
              </p>
            </div>
          </div>

          {notifMessage && (
            <div
              className={`p-4 mb-6 rounded-xl border flex items-center gap-3 ${
                notifMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {notifMessage.type === 'success' ? (
                <CheckCircle size={18} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{notifMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleNotifSave} className="space-y-5">
            <div className="divide-y divide-gray-100">
              {/* Audit Notifications */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-[#EB8C00] mt-0.5">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Audit Assignments & Deadlines</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Receive alerts when assigned to an audit, status updates, or when due dates are approaching.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.notify_audits}
                  onClick={() => handleNotificationToggle('notify_audits')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EB8C00] focus:ring-offset-2 ${
                    notifications.notify_audits ? 'bg-[#EB8C00]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.notify_audits ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Finding Notifications */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 mt-0.5">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Findings & Action Items</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Get notified when new audit findings are reported or when finding statuses change.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.notify_findings}
                  onClick={() => handleNotificationToggle('notify_findings')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EB8C00] focus:ring-offset-2 ${
                    notifications.notify_findings ? 'bg-[#EB8C00]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.notify_findings ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Report Notifications */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Audit Reports</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Notifications when official audit reports are generated, updated, or finalized.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.notify_reports}
                  onClick={() => handleNotificationToggle('notify_reports')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EB8C00] focus:ring-offset-2 ${
                    notifications.notify_reports ? 'bg-[#EB8C00]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.notify_reports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auditor Registration Notifications (Admin Only) */}
              {isAdmin && (
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">New Auditor Registrations</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Receive immediate notifications whenever a new auditor account registers in the system.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.notify_registrations}
                    onClick={() => handleNotificationToggle('notify_registrations')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EB8C00] focus:ring-offset-2 ${
                      notifications.notify_registrations ? 'bg-[#EB8C00]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.notify_registrations ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={notifSubmitting}
                className="px-6 py-2.5 bg-[#EB8C00] hover:bg-[#D04A02] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {notifSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{notifSubmitting ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Appearance Card */}
        <div className="bg-white rounded-2xl border border-[#DEDEDE] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
                <p className="text-sm text-gray-500">Switch between light and dark mode. Your choice is saved on this device.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#EB8C00] focus:ring-offset-2 ${theme === 'dark' ? 'bg-[#EB8C00]' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Administrative Note / Info Card */}
        {isAdmin && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <Shield className="text-amber-600 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Administrative Account
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  You have full administrative privileges to manage audit scope, auditor assignments, and generate official audit reports across departments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
