import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FOOD_DATABASE, FoodItem, UNITS } from '../lib/data';
import { Plus, Trash2, Edit2, Package, Search, Settings, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, categories, addCategory, deleteCategory, uploadInventoryImage } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFoodDbDialogOpen, setIsFoodDbDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [foodDbSearch, setFoodDbSearch] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expirationEstimate: 7,
    price: 0,
    quantity: 1,
    unit: 'pcs' as 'kg' | 'gm' | 'ltr' | 'pcs',
    imageUrl: '' as string | undefined,
  });

  const handleAddFromDatabase = (foodItem: FoodItem) => {
    addInventoryItem({
      ...foodItem,
      quantity: 1,
      unit: 'pcs',
    });
    setIsFoodDbDialogOpen(false);
    toast.success(`${foodItem.name} added to inventory!`);
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadInventoryImage(imageFile);
    }
    
    addInventoryItem({
      ...formData,
      imageUrl: imageUrl || undefined,
    });
    
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
    setIsAddDialogOpen(false);
    toast.success('Item added to inventory!');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadInventoryImage(imageFile);
      }
      
      updateInventoryItem(selectedItem.id, {
        ...formData,
        imageUrl,
      });
      
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      setImageFile(null);
      setImagePreview('');
      toast.success('Item updated successfully!');
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

  const handleDelete = (id: string, name: string) => {
    deleteInventoryItem(id);
    toast.success(`${name} removed from inventory!`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      toast.success('Category added successfully!');
    }
  };

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
    toast.success('Category deleted!');
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredFoodDb = FOOD_DATABASE.filter(item =>
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
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  Add or remove food categories
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="capitalize">{category}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                  Select items from our preloaded database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--color-700) w-4 h-4" />
                  <Input
                    placeholder="Search food items..."
                    value={foodDbSearch}
                    onChange={(e) => setFoodDbSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid gap-2">
                  {filteredFoodDb.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-(--color-300)/50 transition-colors">
                      <div>
                        <p>{item.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
                          <span className="text-xs text-(--color-700)">
                            {item.expirationEstimate} days shelf life
                          </span>
                          <span className="text-xs text-(--color-700)">
                            TK {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddFromDatabase(item)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Item Manually</DialogTitle>
                <DialogDescription>
                  Add a custom item to your inventory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddManual} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Organic Milk"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
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
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Shelf Life (days)</Label>
                    <Input
                      id="expiration"
                      type="number"
                      min="1"
                      value={formData.expirationEstimate}
                      onChange={(e) => setFormData({ ...formData, expirationEstimate: parseInt(e.target.value) })}
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
                  <Button type="submit" className="flex-1">Add Item</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>{filteredInventory.length} of {inventory.length} items</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--color-700) w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map(item => {
                const expirationInfo = getExpirationStatus(item);
                const daysInInventory = getDaysInInventory(item.dateAdded);
                
                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate" title={item.name}>{item.name}</CardTitle>
                          <CardDescription className="capitalize">{item.category}</CardDescription>
                        </div>
                        <Badge variant={expirationInfo.color as any} className="flex-shrink-0">
                          {expirationInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    {item.imageUrl && (
                      <div className="px-6 pb-3">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                          <ImageWithFallback
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-(--color-700)">Quantity</p>
                          <p>{item.quantity} {item.unit || 'pcs'}</p>
                        </div>
                        <div>
                          <p className="text-(--color-700)">Price</p>
                          <p>TK {item.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-(--color-700)">Days in Stock</p>
                          <p>{daysInInventory}</p>
                        </div>
                        <div>
                          <p className="text-(--color-700)">Shelf Life</p>
                          <p>{item.expirationEstimate} days</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(item)} className="flex-1">
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(item.id, item.name)} className="flex-1">
                          <Trash2 className="w-3 h-3 mr-1 text-destructive" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-(--color-300) mx-auto mb-4" />
              <h3>No items in inventory</h3>
              <p className="text-(--color-700) mt-2 mb-4">
                {searchQuery ? 'No items match your search' : 'Start adding items to your inventory'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsFoodDbDialogOpen(true)} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Database
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manual
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
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
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
