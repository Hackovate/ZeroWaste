'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FoodLog, InventoryItem, Resource } from './data';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  foodLogs: FoodLog[];
  inventory: InventoryItem[];
  categories: string[];
  login: (email: string, password: string) => boolean;
  register: (user: Omit<User, 'id'>, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => void;
  deleteFoodLog: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  uploadImage: (file: File) => Promise<string>;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Fruits', 'Vegetables', 'Grains', 'Protein', 'Dairy', 'Snacks', 'Beverages', 'Other'
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedCurrentUser = localStorage.getItem('currentUser');
    const savedFoodLogs = localStorage.getItem('foodLogs');
    const savedInventory = localStorage.getItem('inventory');
    const savedCategories = localStorage.getItem('categories');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
    if (savedFoodLogs) setFoodLogs(JSON.parse(savedFoodLogs));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('foodLogs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>, password: string): boolean => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const addFoodLog = (log: Omit<FoodLog, 'id'>) => {
    const newLog: FoodLog = {
      ...log,
      id: Date.now().toString(),
    };
    setFoodLogs([...foodLogs, newLog]);
  };

  const deleteFoodLog = (id: string) => {
    setFoodLogs(foodLogs.filter(log => log.id !== id));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Mock image upload - in real app would upload to server
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        foodLogs,
        inventory,
        categories,
        login,
        register,
        logout,
        updateProfile,
        addFoodLog,
        deleteFoodLog,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        uploadImage,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};