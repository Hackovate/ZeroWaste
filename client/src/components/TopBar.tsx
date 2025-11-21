import React from 'react';
import { useApp } from '../lib/AppContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, Home, FileText, Package, BookOpen, LayoutDashboard, Settings, LogOut } from 'lucide-react';

interface TopBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, logout } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'resources', label: 'Resources', icon: BookOpen },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50 h-16">
      <div className="h-full flex items-center justify-between" style={{ padding: '0', paddingRight: '1rem' }}>
        {/* Left: Logo */}
        <div className="flex items-center h-full pl-3">
          <div 
            className="cursor-pointer select-none h-12" 
            onClick={() => onNavigate('dashboard')}
          >
            <img src="/assets/ZeroWaste-Full-Logo.svg" alt="ZeroWaste" className="h-full" />
          </div>
        </div>

        {/* Right: Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-(--color-300) hover:border-primary transition-colors">
                <AvatarFallback className="bg-primary text-white">
                  {currentUser && getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p>{currentUser?.name}</p>
                <p className="text-xs text-(--color-700)">
                  {currentUser?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-primary">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};