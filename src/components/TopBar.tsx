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
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetTitle>Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-2 mt-8">
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
              </div>
            </SheetContent>
          </Sheet>

          <h1 
            className="text-primary cursor-pointer select-none" 
            onClick={() => onNavigate('dashboard')}
          >
            FoodTrack
          </h1>
        </div>

        {/* Right: Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-[var(--color-300)] hover:border-primary transition-colors">
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
                <p className="text-xs text-[var(--color-700)]">
                  {currentUser?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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