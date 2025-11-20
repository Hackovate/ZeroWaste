import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { UNITS } from '../lib/data';
import { Plus, Trash2, FileText, Upload, ImageIcon, Check, ChevronsUpDown, Package } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from './ui/loading';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';

export const FoodLogs: React.FC = () => {
  const { foodLogs, addFoodLog, deleteFoodLog, uploadImage, categories, inventory, fetchInventory } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    unit: 'pcs' as 'kg' | 'gm' | 'ltr' | 'pcs',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterExpiration, setFilterExpiration] = useState<string>('all');
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    deleting: {} as Record<string, boolean>,
    uploadingImage: false,
  });

  // Filter inventory items based on search query - case-insensitive, starts with match
  const filteredInventoryItems = useMemo(() => {
    if (!itemSearchQuery) return inventory.filter(item => item.quantity > 0);
    const query = itemSearchQuery.toLowerCase();
    return inventory.filter(item => 
      item.quantity > 0 && item.name.toLowerCase().startsWith(query)
    );
  }, [inventory, itemSearchQuery]);

  const handleInventoryItemSelect = (item: any) => {
    setSelectedInventoryItem(item);
    setFormData({
      ...formData,
      itemName: item.name,
      category: item.category,
      unit: item.unit || 'pcs',
      quantity: Math.min(formData.quantity, item.quantity), // Don't exceed available quantity
    });
    // Auto-fill image from inventory item
    if (item.imageUrl) {
      setImagePreview(item.imageUrl);
      setImageFile(null); // Clear any uploaded file
    }
    setItemSearchOpen(false);
    setItemSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, adding: true, uploadingImage: !!imageFile }));
    
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Use inventory item's image if selected, otherwise use uploaded image
      const finalImageUrl = selectedInventoryItem?.imageUrl || imageUrl || undefined;

      await addFoodLog({
        ...formData,
        quantity: Number(formData.quantity),
        imageUrl: finalImageUrl,
      });

      // Refresh inventory to show updated quantities
      await fetchInventory();

      setFormData({
        itemName: '',
        quantity: 1,
        unit: 'pcs',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setImageFile(null);
      setImagePreview('');
      setSelectedInventoryItem(null);
      setItemSearchQuery('');
      setFormData({
        itemName: '',
        quantity: 1,
        unit: 'pcs',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsDialogOpen(false);
      toast.success('Food log added successfully!');
    } finally {
      setLoadingStates(prev => ({ ...prev, adding: false, uploadingImage: false }));
    }
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

  const handleDelete = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, deleting: { ...prev.deleting, [id]: true } }));
    try {
      await deleteFoodLog(id);
      // Refresh inventory to show restored quantities
      await fetchInventory();
      toast.success('Food log deleted successfully!');
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: { ...prev.deleting, [id]: false } }));
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffInMs = now.getTime() - logDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return logDate.toLocaleDateString();
  };

  // Calculate expiration status for a food log
  const getExpirationStatus = (log: any) => {
    // Find matching inventory item by name
    const matchingItem = inventory.find(item => 
      item.name.toLowerCase() === log.itemName.toLowerCase()
    );

    if (!matchingItem) return 'unknown';

    const logDate = new Date(log.date);
    const dateAdded = new Date(matchingItem.dateAdded);
    const expirationDate = new Date(dateAdded);
    expirationDate.setDate(expirationDate.getDate() + matchingItem.expirationEstimate);

    const daysUntilExpiration = Math.floor((expirationDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 2) return 'expiring-soon';
    return 'fresh';
  };

  const filteredLogs = useMemo(() => {
    let filtered = foodLogs;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    // Filter by expiration status
    if (filterExpiration !== 'all') {
      filtered = filtered.filter(log => getExpirationStatus(log) === filterExpiration);
    }

    return filtered;
  }, [foodLogs, filterCategory, filterExpiration, inventory]);

  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Food Logs</h1>
          <p className="text-(--color-700) mt-1">
            Track your daily food consumption
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Food Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Food Log</DialogTitle>
              <DialogDescription>
                Record your food consumption
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Popover open={itemSearchOpen} onOpenChange={setItemSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={itemSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.itemName || "Search inventory items..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search inventory..." 
                        value={itemSearchQuery}
                        onValueChange={setItemSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No inventory items found.</CommandEmpty>
                        <CommandGroup>
                          {filteredInventoryItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.name}
                              onSelect={() => handleInventoryItemSelect(item)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.itemName === item.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                {item.imageUrl && (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.quantity} {item.unit} available • {item.category}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedInventoryItem && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                  </p>
                )}
                {!selectedInventoryItem && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Please select an item from your inventory
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
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={!!selectedInventoryItem}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedInventoryItem && (
                    <p className="text-xs text-muted-foreground">
                      Category comes from inventory item
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              {selectedInventoryItem && selectedInventoryItem.imageUrl && (
                <div className="space-y-2">
                  <Label>Image</Label>
                  <div className="mt-2">
                    <img 
                      src={selectedInventoryItem.imageUrl} 
                      alt={selectedInventoryItem.name} 
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Image from inventory item
                  </p>
                </div>
              )}
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
                    'Add Log'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Consumption History</CardTitle>
              <CardDescription>All your food consumption records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterExpiration} onValueChange={setFilterExpiration}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="fresh">Fresh</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <div className="space-y-2">
              {sortedLogs.map(log => {
                const expirationStatus = getExpirationStatus(log);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
                      {log.imageUrl ? (
                        <ImageWithFallback
                          src={log.imageUrl}
                          alt={log.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base leading-tight truncate">
                            {log.itemName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize text-xs">
                              {log.category}
                            </Badge>
                            {expirationStatus !== 'unknown' && (
                              <Badge 
                                variant={
                                  expirationStatus === 'expired' ? 'destructive' :
                                  expirationStatus === 'expiring-soon' ? 'default' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {expirationStatus === 'expired' ? 'Expired' :
                                 expirationStatus === 'expiring-soon' ? 'Expiring Soon' :
                                 'Fresh'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(log.id)}
                          disabled={loadingStates.deleting[log.id]}
                        >
                          {loadingStates.deleting[log.id] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {log.quantity} {log.unit || 'pcs'}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(log.date)}</span>
                        <span>•</span>
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No food logs found</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {filterCategory !== 'all' || filterExpiration !== 'all' 
                  ? 'No logs match the selected filters' 
                  : 'Start tracking your food consumption'}
              </p>
              {(filterCategory === 'all' && filterExpiration === 'all') && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food Log
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
