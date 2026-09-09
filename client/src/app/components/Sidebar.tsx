import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardList, User, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path: string) => location.pathname === path;

 const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/audits', label: 'Audits', icon: ClipboardList },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  // { path: '/admin/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings }
];

 const auditorMenu = [
  { path: '/auditor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/auditor/my-audits', label: 'My Audits', icon: ClipboardList },
  { path: '/auditor/findings', label: 'Findings', icon: FileText },
  // { path: '/auditor/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings }
];

  const menu = currentUser?.role === 'ADMIN' ? adminMenu : auditorMenu;

  return (
    <div className="w-64 h-screen bg-black text-white fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Audit Management</h1>
        <p className="text-sm text-gray-400 mt-1">{currentUser?.role} Portal</p>
      </div>

      <nav className="flex-1 p-4">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-[#EB8C00] text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-[#EB8C00] flex items-center justify-center text-white font-semibold">
            {currentUser?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
