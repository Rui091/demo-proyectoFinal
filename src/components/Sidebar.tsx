import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Package, ClipboardList, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/devices', icon: Truck, label: 'Devices' },
    { to: '/requests', icon: Package, label: 'Requests' },
    { to: '/audit', icon: ClipboardList, label: 'Audit Log' },
    { to: '/security', icon: Shield, label: 'Security' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">TransportSys</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
