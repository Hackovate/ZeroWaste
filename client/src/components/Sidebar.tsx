import React from 'react';
import { Home, FileText, Package, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white h-[calc(100vh-64px)] fixed left-0 top-16 z-40">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                currentView === item.id
                  ? 'bg-primary text-white'
                  : 'text-[var(--color-700)] hover:bg-[var(--color-300)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
