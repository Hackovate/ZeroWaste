'use client';

import React from 'react';
import { Home, FileText, Package, BookOpen, Globe, Camera, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useApp } from '@/lib/AppContext';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const baseNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'logs', label: 'Food Logs', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'scanning', label: 'Food Scanner', icon: Camera },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'community', label: 'Community', icon: Globe },
];

const adminNavItem = { id: 'admin', label: 'Admin', icon: Shield };

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  
  // Include admin nav item if user is admin
  const navItems = isAdmin 
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  return (
    <aside
      className={cn(
        'flex flex-col h-[calc(100vh-4rem)] bg-white border-r shadow-sm transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Sidebar Header with Toggle */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b bg-gray-50'
      )}>
        {isCollapsed ? (
          <div className="flex items-center gap-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/assets/ZeroWaste-icon.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 hover:bg-white"
            >
              <ChevronRight className="h-6 w-6 font-bold" strokeWidth={3} />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/assets/ZeroWaste-icon.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-gray-900">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6 font-bold" strokeWidth={3} />
            </Button>
          </>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-gray-100 group relative',
                isActive && 'bg-primary text-white hover:bg-primary/90 shadow-sm',
                !isActive && 'text-gray-700',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 shrink-0',
                isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
              )} />
              {!isCollapsed && (
                <span className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-white' : 'text-gray-900'
                )}>
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t bg-gray-50">
        {!isCollapsed ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-900">ZeroWaste</p>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </aside>
  );
};
