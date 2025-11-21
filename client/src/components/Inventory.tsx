import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';
import { FoodItem, UNITS } from '../lib/data';
import { Plus, Trash2, Edit2, Package, Search, Settings, X, Upload, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingSpinner } from './ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from './ui/utils';

const INVENTORY_PER_PAGE = 10;

export const Inventory: React.FC = () => {
  const { 
    inventory, 
    inventoryPagination,
    foodDatabase,
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    categories, 
    uploadInventoryImage,
    fetchInventory,
    currentUser
  } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFoodDbDialogOpen, setIsFoodDbDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [foodDbSearch, setFoodDbSearch] = useState('');
  const [matchedFoodItem, setMatchedFoodItem] = useState<FoodItem | null>(null);
  const [itemNameSearchOpen, setItemNameSearchOpen] = useState(false);
  const [itemNameSearchQuery, setItemNameSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editing: false,
    deleting: {} as Record<string, boolean>,
    addingFromDb: {} as Record<string, boolean>,
    uploadingImage: false,
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expirationEstimate: 7,
    price: 0,
    quantity: 1,
    unit: 'pcs' as 'kg' | 'gm' | 'ltr' | 'pcs',
    imageUrl: '' as string | undefined,
  });

  // Fetch inventory when page or filters change
  useEffect(() => {
    fetchInventory(currentPage, INVENTORY_PER_PAGE);
  }, [currentPage, fetchInventory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery]);

  // Filter food database items based on search query - case-insensitive, starts with match
  const filteredFoodDatabaseItems = React.useMemo(() => {
    if (!itemNameSearchQuery) return foodDatabase;
    const query = itemNameSearchQuery.toLowerCase();
    return foodDatabase.filter(item => 
      item.name.toLowerCase().startsWith(query) ||
      item.name.toLowerCase().includes(query)
    );
  }, [foodDatabase, itemNameSearchQuery]);

  // Handle food database item selection
  const handleFoodDatabaseItemSelect = (foodItem: FoodItem) => {
    setMatchedFoodItem(foodItem);
    setFormData(prev => ({
      ...prev,
      name: foodItem.name,
      category: foodItem.category,
      expirationEstimate: foodItem.expirationEstimate,
      imageUrl: foodItem.imageUrl || undefined, // Auto-fill image from food database
    }));
    // Set image preview (use food database image or empty.png fallback)
    setImagePreview(foodItem.imageUrl || '/assets/food_database/empty.png');
    setImageFile(null); // Clear any uploaded file to use food database image
    setItemNameSearchOpen(false);
    setItemNameSearchQuery('');
  };

  // Handle manual name input (when user types directly)
  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    setItemNameSearchQuery(name);
    // Check for exact match
    const matched = foodDatabase.find(
      item => item.name.toLowerCase() === name.toLowerCase()
    );
    if (matched) {
      setMatchedFoodItem(matched);
      setFormData(prev => ({
        ...prev,
        name: matched.name,
        category: matched.category,
        expirationEstimate: matched.expirationEstimate,
        imageUrl: matched.imageUrl || undefined, // Auto-fill image from food database
      }));
      // Set image preview (use food database image or empty.png fallback)
      setImagePreview(matched.imageUrl || '/assets/food_database/empty.png');
      setImageFile(null); // Clear any uploaded file to use food database image
    } else {
      setMatchedFoodItem(null);
    }
  };

  const handleAddFromDatabase = async (foodItem: FoodItem) => {
    setLoadingStates(prev => ({ ...prev, addingFromDb: { ...prev.addingFromDb, [foodItem.id]: true } }));
    try {
      // Open add dialog with pre-filled data from food database
      setFormData({
        name: foodItem.name,
        category: foodItem.category,
        expirationEstimate: foodItem.expirationEstimate,
        price: 0, // User must set price
        quantity: 1, // Default quantity
        unit: 'pcs', // Default unit
        imageUrl: foodItem.imageUrl || undefined, // Auto-fill image from food database
      });
      setMatchedFoodItem(foodItem);
      // Set image preview (use food database image or empty.png fallback)
      setImagePreview(foodItem.imageUrl || '/assets/food_database/empty.png');
      setImageFile(null); // Clear any uploaded file to use food database image
      setIsFoodDbDialogOpen(false);
      setIsAddDialogOpen(true);
    } finally {
      setLoadingStates(prev => ({ ...prev, addingFromDb: { ...prev.addingFromDb, [foodItem.id]: false } }));
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, adding: true, uploadingImage: !!imageFile }));
    
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadInventoryImage(imageFile);
      }
      
      // Use uploaded image if available, otherwise use food database image
      const finalImageUrl = imageUrl || formData.imageUrl || undefined;
      
      await addInventoryItem({
        ...formData,
        imageUrl: finalImageUrl,
      });
      
      // Refresh inventory to get updated pagination
      await fetchInventory(currentPage, INVENTORY_PER_PAGE);
      
      setFormData({
        name: '',
        category: '',
        expirationEstimate: 7,
        price: 0,
        quantity: 1,
        unit: 'pcs',
        imageUrl: '',
      });
      setImageFile(null);
      setImagePreview('');
      setMatchedFoodItem(null);
      setIsAddDialogOpen(false);
      toast.success('Item added to inventory!');
    } finally {
      setLoadingStates(prev => ({ ...prev, adding: false, uploadingImage: false }));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setLoadingStates(prev => ({ ...prev, editing: true, uploadingImage: !!imageFile }));
      
      try {
        let imageUrl = formData.imageUrl;
        if (imageFile) {
          imageUrl = await uploadInventoryImage(imageFile);
        }
        
        await updateInventoryItem(selectedItem.id, {
          ...formData,
          imageUrl,
        });
        
        // Refresh inventory to get updated data
        await fetchInventory(currentPage, INVENTORY_PER_PAGE);
        
        setIsEditDialogOpen(false);
        setSelectedItem(null);
        setImageFile(null);
        setImagePreview('');
        toast.success('Item updated successfully!');
      } finally {
        setLoadingStates(prev => ({ ...prev, editing: false, uploadingImage: false }));
      }
    }
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      expirationEstimate: item.expirationEstimate,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      imageUrl: item.imageUrl || '',
    });
    setImagePreview(item.imageUrl || '');
    setImageFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    setLoadingStates(prev => ({ ...prev, deleting: { ...prev.deleting, [id]: true } }));
    try {
      await deleteInventoryItem(id);
      // Refresh inventory to get updated pagination
      await fetchInventory(currentPage, INVENTORY_PER_PAGE);
      toast.success(`${name} removed from inventory!`);
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: { ...prev.deleting, [id]: false } }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Clear food database image when user uploads their own
      setFormData(prev => ({ ...prev, imageUrl: undefined }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Category management is now admin-only and handled in AdminDashboard
  // This component only displays categories for filtering

  // Client-side filtering for search and category (since pagination is server-side)
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!inventoryPagination || inventoryPagination.totalPages <= 1) return null;

    const { page, totalPages, hasNextPage, hasPreviousPage } = inventoryPagination;
    const pages: (number | string)[] = [];
    
    // Generate page numbers
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current range, ellipsis, last page
      pages.push(1);
      if (page > 3) pages.push('ellipsis-start');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasPreviousPage) handlePageChange(page - 1);
              }}
              className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pages.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(p as number);
                  }}
                  isActive={page === p}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasNextPage) handlePageChange(page + 1);
              }}
              className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const filteredFoodDb = foodDatabase.filter(item =>
    item.name.toLowerCase().includes(foodDbSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(foodDbSearch.toLowerCase())
  );

  const getDaysInInventory = (dateAdded: string) => {
    return Math.floor((Date.now() - new Date(dateAdded).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpirationStatus = (item: any) => {
    const daysInInventory = getDaysInInventory(item.dateAdded);
    const percentageUsed = (daysInInventory / item.expirationEstimate) * 100;
    
    if (percentageUsed >= 80) return { status: 'danger', label: 'Expires Soon', color: 'destructive' };
    if (percentageUsed >= 50) return { status: 'warning', label: 'Use Soon', color: 'default' };
    return { status: 'good', label: 'Fresh', color: 'secondary' };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-(--color-700) mt-1">
            Track and manage your food stock
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFoodDbDialogOpen} onOpenChange={setIsFoodDbDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Browse Database
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Food Database</DialogTitle>
                <DialogDescription>
                  Select items from our preloaded database. You'll set price and quantity when adding.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-700)] w-4 h-4" />
                  <Input
                    placeholder="Search food items..."
                    value={foodDbSearch}
                    onChange={(e) => setFoodDbSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid gap-2">
                  {filteredFoodDb.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-[var(--color-300)]/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-16 h-16 rounded-md overflow-hidden border shrink-0">
                          <ImageWithFallback
                            src={item.imageUrl || '/assets/food_database/empty.png'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/assets/food_database/empty.png"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
                            <span className="text-xs text-[var(--color-700)]">
                              {item.expirationEstimate} days shelf life
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddFromDatabase(item)}
                        disabled={loadingStates.addingFromDb[item.id]}
                      >
                        {loadingStates.addingFromDb[item.id] ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-1" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              // Reset form when dialog closes
              setFormData({
                name: '',
                category: '',
                expirationEstimate: 7,
                price: 0,
                quantity: 1,
                unit: 'pcs',
                imageUrl: '',
              });
              setMatchedFoodItem(null);
              setImageFile(null);
              setImagePreview('');
              setItemNameSearchQuery('');
              setItemNameSearchOpen(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Item</DialogTitle>
                <DialogDescription>
                  {matchedFoodItem 
                    ? `Matched with ${matchedFoodItem.name} from database. You can edit all fields.`
                    : 'Add a new item to your inventory'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddManual} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Type to search food items..."
                      value={formData.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleNameChange(value);
                        setItemNameSearchQuery(value);
                        setItemNameSearchOpen(value.length > 0 && filteredFoodDatabaseItems.length > 0);
                      }}
                      onFocus={() => {
                        if (formData.name && filteredFoodDatabaseItems.length > 0) {
                          setItemNameSearchOpen(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay closing to allow click on dropdown items
                        setTimeout(() => {
                          const activeElement = document.activeElement;
                          // Check if focus moved to dropdown or stayed in input
                          if (activeElement && activeElement.closest('.absolute')) {
                            return; // Don't close if clicking dropdown
                          }
                          setItemNameSearchOpen(false);
                        }, 200);
                      }}
                      required
                    />
                    {itemNameSearchOpen && filteredFoodDatabaseItems.length > 0 && (
                      <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-[300px] overflow-auto">
                        <div className="p-1">
                          {filteredFoodDatabaseItems.slice(0, 10).map((item) => (
                            <div
                              key={item.id}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                handleFoodDatabaseItemSelect(item);
                                setItemNameSearchOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                matchedFoodItem?.id === item.id && "bg-gray-100 dark:bg-gray-700"
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  matchedFoodItem?.id === item.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="w-10 h-10 rounded-md overflow-hidden border shrink-0">
                                <ImageWithFallback
                                  src={item.imageUrl || '/assets/food_database/empty.png'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  fallbackSrc="/assets/food_database/empty.png"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                                  <span className="capitalize">{item.category}</span>
                                  <span>•</span>
                                  <span>{item.expirationEstimate} days shelf life</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {itemNameSearchOpen && filteredFoodDatabaseItems.length === 0 && itemNameSearchQuery && (
                      <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                        No items found. "{itemNameSearchQuery}" will be added as a new item.
                      </div>
                    )}
                  </div>
                  {matchedFoodItem && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-1">
                      <Search className="w-3 h-3" />
                      Matched: {matchedFoodItem.name} (auto-filled category & shelf life - you can edit)
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.quantity || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, quantity: value === '' ? 0 : parseFloat(value) || 0 });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (TK)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, price: value === '' ? 0 : parseFloat(value) || 0 });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Shelf Life (days)</Label>
                    <Input
                      id="expiration"
                      type="number"
                      min="1"
                      value={formData.expirationEstimate || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, expirationEstimate: value === '' ? 7 : parseInt(value) || 7 });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Item Image (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border">
                      <ImageWithFallback
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loadingStates.adding || loadingStates.uploadingImage}
                  >
                    {loadingStates.adding || loadingStates.uploadingImage ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {loadingStates.uploadingImage ? 'Uploading...' : 'Adding...'}
                      </>
                    ) : (
                      'Add Item'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)} 
                    className="flex-1"
                    disabled={loadingStates.adding || loadingStates.uploadingImage}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Title Section */}
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Current Inventory</CardTitle>
                <CardDescription className="mt-1">
                  {inventoryPagination 
                    ? `Showing ${inventory.length} of ${inventoryPagination.total} items (Page ${inventoryPagination.page} of ${inventoryPagination.totalPages})`
                    : `${inventory.length} items`}
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInventory.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Days in Stock</TableHead>
                      <TableHead>Shelf Life</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map(item => {
                      const expirationInfo = getExpirationStatus(item);
                      const daysInInventory = getDaysInInventory(item.dateAdded);
                      
                      return (
                        <TableRow 
                          key={item.id} 
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => openEditDialog(item)}
                        >
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                              <ImageWithFallback
                                src={item.imageUrl || '/assets/food_database/empty.png'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                fallbackSrc="/assets/food_database/empty.png"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.quantity} {item.unit || 'pcs'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">TK {item.price ? item.price.toFixed(2) : '0.00'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{daysInInventory} days</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{item.expirationEstimate} days</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={expirationInfo.color as any} className="capitalize">
                              {expirationInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => openEditDialog(item)}
                                disabled={loadingStates.deleting[item.id]}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDelete(item.id, item.name)}
                                disabled={loadingStates.deleting[item.id]}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                {loadingStates.deleting[item.id] ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                {renderPagination()}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-(--color-300) mx-auto mb-4" />
              <h3>No items in inventory</h3>
              <p className="text-(--color-700) mt-2 mb-4">
                {searchQuery ? 'No items match your search' : 'Start adding items to your inventory'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setIsFoodDbDialogOpen(true)}>
                    <Search className="w-4 h-4 mr-2" />
                    Browse Database
                  </Button>
                  <Button onClick={() => {
                    setFormData({
                      name: '',
                      category: '',
                      expirationEstimate: 7,
                      price: 0,
                      quantity: 1,
                      unit: 'pcs',
                      imageUrl: '',
                    });
                    setMatchedFoodItem(null);
                    setIsAddDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update item details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, quantity: value === '' ? 0 : parseFloat(value) || 0 });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (TK)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, price: value === '' ? 0 : parseFloat(value) || 0 });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Item Image (Optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border">
                  <ImageWithFallback
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loadingStates.editing || loadingStates.uploadingImage}
              >
                {loadingStates.editing || loadingStates.uploadingImage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {loadingStates.uploadingImage ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)} 
                className="flex-1"
                disabled={loadingStates.editing || loadingStates.uploadingImage}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
