import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Edit2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Category {
  id: string;
  name: string;
}

interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  expirationEstimate: number;
  imageUrl?: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    categories,
    foodDatabase,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createFoodDatabaseItem,
    updateFoodDatabaseItem,
    deleteFoodDatabaseItem,
    fetchFoodDatabase,
  } = useApp();

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [foodDatabaseList, setFoodDatabaseList] = useState<FoodDatabaseItem[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingFood, setEditingFood] = useState<FoodDatabaseItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    category: '',
    expirationEstimate: 7,
  });

  // Fetch categories and food database on mount
  useEffect(() => {
    loadCategories();
    loadFoodDatabase();
  }, []);

  const loadCategories = async () => {
    try {
      await fetchCategories(); // Use AppContext's fetchCategories
      // Categories are already set in AppContext, no need to set local state
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadFoodDatabase = async () => {
    await fetchFoodDatabase();
    // Convert foodDatabase (FoodItem[]) to FoodDatabaseItem[]
    if (foodDatabase && Array.isArray(foodDatabase)) {
      setFoodDatabaseList(foodDatabase.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        expirationEstimate: item.expirationEstimate,
        imageUrl: item.imageUrl,
      })));
    }
  };

  // Update categoriesList when categories changes
  useEffect(() => {
    if (categories && Array.isArray(categories)) {
      // Convert string[] to Category[] format for the table
      setCategoriesList(categories.map(name => ({ id: name, name })));
    }
  }, [categories]);

  // Update foodDatabaseList when foodDatabase changes
  useEffect(() => {
    if (foodDatabase && Array.isArray(foodDatabase)) {
      setFoodDatabaseList(foodDatabase.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        expirationEstimate: item.expirationEstimate,
        imageUrl: item.imageUrl,
      })));
    }
  }, [foodDatabase]);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await createCategory(categoryName.trim());
      setCategoryName('');
      setIsCategoryDialogOpen(false);
      await loadCategories();
    } catch (error) {
      // Error already handled in createCategory
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await updateCategory(editingCategory.id, categoryName.trim());
      setEditingCategory(null);
      setCategoryName('');
      setIsCategoryDialogOpen(false);
      await loadCategories();
    } catch (error) {
      // Error already handled in updateCategory
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (error) {
      // Error already handled in deleteCategory
    }
  };

  const handleCreateFoodItem = async () => {
    if (!foodFormData.name.trim() || !foodFormData.category.trim()) {
      toast.error('Name and category are required');
      return;
    }
    if (foodFormData.expirationEstimate <= 0) {
      toast.error('Expiration estimate must be greater than 0');
      return;
    }
    try {
      await createFoodDatabaseItem(foodFormData);
      setFoodFormData({ name: '', category: '', expirationEstimate: 7 });
      setIsFoodDialogOpen(false);
      await loadFoodDatabase();
    } catch (error) {
      // Error already handled in createFoodDatabaseItem
    }
  };

  const handleUpdateFoodItem = async () => {
    if (!editingFood || !foodFormData.name.trim() || !foodFormData.category.trim()) {
      toast.error('Name and category are required');
      return;
    }
    if (foodFormData.expirationEstimate <= 0) {
      toast.error('Expiration estimate must be greater than 0');
      return;
    }
    try {
      await updateFoodDatabaseItem(editingFood.id, foodFormData);
      setEditingFood(null);
      setFoodFormData({ name: '', category: '', expirationEstimate: 7 });
      setIsFoodDialogOpen(false);
      await loadFoodDatabase();
    } catch (error) {
      // Error already handled in updateFoodDatabaseItem
    }
  };

  const handleDeleteFoodItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await deleteFoodDatabaseItem(id);
      await loadFoodDatabase();
    } catch (error) {
      // Error already handled in deleteFoodDatabaseItem
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsCategoryDialogOpen(true);
  };

  const openEditFood = (food: FoodDatabaseItem) => {
    setEditingFood(food);
    setFoodFormData({
      name: food.name,
      category: food.category,
      expirationEstimate: food.expirationEstimate,
    });
    setIsFoodDialogOpen(true);
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsCategoryDialogOpen(true);
  };

  const openCreateFood = () => {
    setEditingFood(null);
    setFoodFormData({ name: '', category: '', expirationEstimate: 7 });
    setIsFoodDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage categories and food database</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="food-database">Food Database</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage food categories</CardDescription>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateCategory}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Edit Category' : 'Create Category'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory
                          ? 'Update the category name'
                          : 'Add a new food category'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="e.g., dairy, grain, fruit"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              editingCategory ? handleUpdateCategory() : handleCreateCategory();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCategoryDialogOpen(false);
                            setEditingCategory(null);
                            setCategoryName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                        >
                          {editingCategory ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-full">Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoriesList.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium capitalize">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditCategory(category)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="food-database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Food Database</CardTitle>
                  <CardDescription>Manage global food items</CardDescription>
                </div>
                <Dialog open={isFoodDialogOpen} onOpenChange={setIsFoodDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateFood}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Food Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingFood ? 'Edit Food Item' : 'Create Food Item'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingFood
                          ? 'Update the food item details'
                          : 'Add a new food item to the database'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="food-name">Name</Label>
                        <Input
                          id="food-name"
                          value={foodFormData.name}
                          onChange={(e) =>
                            setFoodFormData({ ...foodFormData, name: e.target.value })
                          }
                          placeholder="e.g., Milk, Bread"
                        />
                      </div>
                      <div>
                        <Label htmlFor="food-category">Category</Label>
                        <Input
                          id="food-category"
                          value={foodFormData.category}
                          onChange={(e) =>
                            setFoodFormData({ ...foodFormData, category: e.target.value })
                          }
                          placeholder="e.g., dairy, grain"
                          list="categories-list"
                        />
                        <datalist id="categories-list">
                          {categories.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <Label htmlFor="food-expiration">Expiration Estimate (days)</Label>
                        <Input
                          id="food-expiration"
                          type="number"
                          min="1"
                          value={foodFormData.expirationEstimate}
                          onChange={(e) =>
                            setFoodFormData({
                              ...foodFormData,
                              expirationEstimate: parseInt(e.target.value) || 7,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsFoodDialogOpen(false);
                            setEditingFood(null);
                            setFoodFormData({ name: '', category: '', expirationEstimate: 7 });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingFood ? handleUpdateFoodItem : handleCreateFoodItem}
                        >
                          {editingFood ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expiration (days)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodDatabaseList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No food items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    foodDatabaseList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden border shrink-0">
                            <ImageWithFallback
                              src={item.imageUrl || '/assets/food_database/empty.png'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              fallbackSrc="/assets/food_database/empty.png"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>{item.expirationEstimate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditFood(item)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFoodItem(item.id, item.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

