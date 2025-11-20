'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, FoodLog, InventoryItem, Resource } from './data';
import { api } from './apiClient';
import { toast } from 'sonner';

interface ResourcesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  foodLogs: FoodLog[];
  inventory: InventoryItem[];
  resources: Resource[];
  resourcesPagination: ResourcesPagination | null;
  categories: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  uploadInventoryImage: (file: File) => Promise<string>;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  fetchInventory: () => Promise<void>;
  fetchFoodLogs: () => Promise<void>;
  fetchResources: (page?: number, limit?: number, category?: string) => Promise<void>;
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesPagination, setResourcesPagination] = useState<ResourcesPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    'dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil'
  ]);

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setInventory(data.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  // Fetch food logs from backend
  const fetchFoodLogs = async () => {
    try {
      const { data } = await api.get('/food-logs');
      setFoodLogs(data.data);
    } catch (error) {
      console.error('Failed to fetch food logs:', error);
    }
  };

  // Fetch resources from backend with pagination
  const fetchResources = useCallback(async (page: number = 1, limit: number = 9, category?: string) => {
    try {
      console.log('Fetching resources from API...', { page, limit, category });
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      const { data } = await api.get(`/resources?${params.toString()}`);
      console.log('Resources fetched:', data);
      if (data && data.data) {
        setResources(data.data);
        if (data.pagination) {
          setResourcesPagination(data.pagination);
        }
        console.log(`Successfully loaded ${data.data.length} resources`);
      } else {
        console.warn('Resources data structure unexpected:', data);
        setResources([]);
        setResourcesPagination(null);
      }
    } catch (error: any) {
      // Handle network errors gracefully (backend might not be running)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Backend server is not available. Resources will not be loaded.');
        setResources([]);
        setResourcesPagination(null);
        return;
      }
      // Log other errors for debugging
      console.error('Failed to fetch resources:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      setResources([]);
      setResourcesPagination(null);
    }
  }, []);

  // Load user from localStorage on mount and validate with backend
  useEffect(() => {
    const validateUser = async () => {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (savedUser && token) {
        try {
          // Validate token with backend
          const { data } = await api.get('/auth/me');
          const user: User = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            householdSize: data.data.householdSize,
            dietaryPreferences: data.data.dietaryPreferences || [],
            budgetPreference: data.data.budgetPreference,
            monthlyBudget: data.data.monthlyBudget,
            location: {
              district: data.data.district || '',
              division: data.data.division || ''
            },
            imageUrl: data.data.imageUrl,
            familyMembers: data.data.familyMembers?.map((fm: any) => ({
              id: fm.id,
              name: fm.name,
              age: fm.age,
              gender: fm.gender,
              healthConditions: fm.healthConditions || [],
              imageUrl: fm.imageUrl
            })) || [],
            onboardingCompleted: data.data.onboardingCompleted
          };
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Fetch user's data from backend
          await fetchInventory();
          await fetchFoodLogs();
          await fetchResources();
        } catch (error) {
          // Token is invalid, clear everything
          console.log('Invalid token, clearing localStorage');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }
    };
    
    validateUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      
      const user: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        householdSize: data.data.user.householdSize,
        dietaryPreferences: data.data.user.dietaryPreferences,
        location: {
          district: data.data.user.district || '',
          division: data.data.user.division || ''
        },
        onboardingCompleted: data.data.user.onboardingCompleted
      };
      
      setCurrentUser(user);
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Fetch user's data
      await fetchInventory();
      await fetchFoodLogs();
      await fetchResources();
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'>, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', {
        email: userData.email,
        password,
        name: userData.name,
        householdSize: userData.householdSize,
        dietaryPreferences: userData.dietaryPreferences,
        district: userData.location.district,
        division: userData.location.division
      });
      
      const user: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        householdSize: data.data.user.householdSize,
        dietaryPreferences: data.data.user.dietaryPreferences,
        location: {
          district: data.data.user.district || '',
          division: data.data.user.division || ''
        },
        onboardingCompleted: data.data.user.onboardingCompleted
      };
      
      setCurrentUser(user);
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setInventory([]);
    setFoodLogs([]);
    setResources([]);
    setResourcesPagination(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    
    try {
      const { data } = await api.patch('/auth/me', {
        name: updates.name,
        householdSize: updates.householdSize,
        dietaryPreferences: updates.dietaryPreferences,
        budgetPreference: updates.budgetPreference,
        monthlyBudget: updates.monthlyBudget,
        district: updates.location?.district,
        division: updates.location?.division,
        imageUrl: updates.imageUrl,
        familyMembers: updates.familyMembers,
        onboardingCompleted: updates.onboardingCompleted
      });
      
      const updatedUser: User = {
        ...currentUser,
        name: data.data.name || currentUser.name,
        email: data.data.email || currentUser.email,
        householdSize: data.data.householdSize || currentUser.householdSize,
        dietaryPreferences: data.data.dietaryPreferences || currentUser.dietaryPreferences || [],
        budgetPreference: data.data.budgetPreference || currentUser.budgetPreference,
        monthlyBudget: data.data.monthlyBudget !== undefined ? data.data.monthlyBudget : currentUser.monthlyBudget,
        location: {
          district: data.data.district || currentUser.location.district || '',
          division: data.data.division || currentUser.location.division || ''
        },
        imageUrl: data.data.imageUrl || currentUser.imageUrl,
        familyMembers: data.data.familyMembers?.map((fm: any) => ({
          id: fm.id,
          name: fm.name,
          age: fm.age,
          gender: fm.gender,
          healthConditions: fm.healthConditions || [],
          imageUrl: fm.imageUrl
        })) || currentUser.familyMembers || [],
        onboardingCompleted: data.data.onboardingCompleted !== undefined ? data.data.onboardingCompleted : currentUser.onboardingCompleted
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      // If backend doesn't support new fields, update locally
      const updatedUser: User = {
        ...currentUser,
        ...updates,
        location: updates.location || currentUser.location
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully (local only)');
    }
  };

  const addFoodLog = async (log: Omit<FoodLog, 'id'>): Promise<void> => {
    try {
      const { data } = await api.post('/food-logs', {
        itemName: log.itemName,
        quantity: log.quantity,
        unit: log.unit,
        category: log.category,
        date: log.date,
        imageUrl: log.imageUrl
      });
      
      setFoodLogs([data.data, ...foodLogs]);
      toast.success('Food log added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add food log');
    }
  };

  const deleteFoodLog = async (id: string): Promise<void> => {
    try {
      await api.delete(`/food-logs/${id}`);
      setFoodLogs(foodLogs.filter(log => log.id !== id));
      toast.success('Food log deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete food log');
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'dateAdded'>): Promise<void> => {
    try {
      const { data } = await api.post('/inventory', item);
      setInventory([data.data, ...inventory]);
      toast.success('Item added to inventory');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add inventory item');
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
    try {
      const { data } = await api.patch(`/inventory/${id}`, updates);
      setInventory(inventory.map(item => item.id === id ? data.data : item));
      toast.success('Inventory item updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update inventory item');
    }
  };

  const deleteInventoryItem = async (id: string): Promise<void> => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
      toast.success('Inventory item deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete inventory item');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post('/food-logs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return data.data.imageUrl; // ImageKit returns full URL
    } catch (error: any) {
      toast.error('Failed to upload image');
      // Fallback to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const uploadInventoryImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post('/inventory/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return data.data.imageUrl; // ImageKit returns full URL
    } catch (error: any) {
      toast.error('Failed to upload image');
      // Fallback to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  // Fetch resources on mount (resources are public, no auth needed)
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        foodLogs,
        inventory,
        resources,
        resourcesPagination,
        categories,
        loading,
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
        uploadInventoryImage,
        addCategory,
        deleteCategory,
        fetchInventory,
        fetchFoodLogs,
        fetchResources,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};