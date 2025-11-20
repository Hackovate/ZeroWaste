import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DIETARY_PREFERENCES, HEALTH_CONDITIONS } from '../lib/data';
import { User, Edit2, Save, X, Plus, Trash2, Users, DollarSign, Utensils, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingSpinner } from './ui/loading';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile, uploadInventoryImage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    householdSize: currentUser?.householdSize || 1,
    dietaryPreferences: currentUser?.dietaryPreferences || [],
    budgetPreference: currentUser?.budgetPreference || 'medium' as 'low' | 'medium' | 'high' | 'premium',
    monthlyBudget: currentUser?.monthlyBudget || 0,
    location: currentUser?.location || { district: '', division: '' },
    imageUrl: currentUser?.imageUrl || '',
    familyMembers: currentUser?.familyMembers || [],
  });
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string>('');
  const [memberImageFiles, setMemberImageFiles] = useState<Record<string, File>>({});
  const [memberImagePreviews, setMemberImagePreviews] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  // Update formData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        householdSize: currentUser.householdSize || 1,
        dietaryPreferences: currentUser.dietaryPreferences || [],
        budgetPreference: currentUser.budgetPreference || 'medium',
        monthlyBudget: currentUser.monthlyBudget || 0,
        location: currentUser.location || { district: '', division: '' },
        imageUrl: currentUser.imageUrl || '',
        familyMembers: currentUser.familyMembers || [],
      });
      setUserImagePreview(currentUser.imageUrl || '');
      const previews: Record<string, string> = {};
      currentUser.familyMembers?.forEach(member => {
        if (member.imageUrl) {
          previews[member.id] = member.imageUrl;
        }
      });
      setMemberImagePreviews(previews);
    }
  }, [currentUser]);

  const handleUserImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload image
      setUploadingImages(prev => ({ ...prev, 'user': true }));
      try {
        const imageUrl = await uploadInventoryImage(file);
        setFormData(prev => ({ ...prev, imageUrl }));
        setUserImageFile(null);
        toast.success('Profile image uploaded successfully!');
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setUploadingImages(prev => ({ ...prev, 'user': false }));
      }
    }
  };

  const handleMemberImageChange = async (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMemberImageFiles(prev => ({ ...prev, [memberId]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemberImagePreviews(prev => ({ ...prev, [memberId]: reader.result as string }));
      };
      reader.readAsDataURL(file);
      
      // Upload image
      setUploadingImages(prev => ({ ...prev, [memberId]: true }));
      try {
        const imageUrl = await uploadInventoryImage(file);
        updateFamilyMember(memberId, { imageUrl });
        setMemberImageFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[memberId];
          return newFiles;
        });
        toast.success('Member image uploaded successfully!');
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setUploadingImages(prev => {
          const newState = { ...prev };
          delete newState[memberId];
          return newState;
        });
      }
    }
  };

  const handleSave = async () => {
    // Validate family members before saving
    const invalidMembers = formData.familyMembers.filter(m => !m.name || m.name.trim() === '');
    if (invalidMembers.length > 0) {
      toast.error('Please provide a name for all family members before saving.');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setUserImageFile(null);
      setMemberImageFiles({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      householdSize: currentUser?.householdSize || 1,
      dietaryPreferences: currentUser?.dietaryPreferences || [],
      budgetPreference: currentUser?.budgetPreference || 'medium',
      monthlyBudget: currentUser?.monthlyBudget || 0,
      location: currentUser?.location || { district: '', division: '' },
      imageUrl: currentUser?.imageUrl || '',
      familyMembers: currentUser?.familyMembers || [],
    });
    setUserImageFile(null);
    setUserImagePreview(currentUser?.imageUrl || '');
    setMemberImageFiles({});
    const previews: Record<string, string> = {};
    currentUser?.familyMembers?.forEach(member => {
      if (member.imageUrl) {
        previews[member.id] = member.imageUrl;
      }
    });
    setMemberImagePreviews(previews);
    setIsEditing(false);
  };

  const toggleDietaryPreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref]
    }));
  };

  const addFamilyMember = () => {
    // Auto-enable edit mode if not already enabled
    if (!isEditing) {
      setIsEditing(true);
    }
    
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { 
          id: Date.now().toString(), 
          name: '', 
          age: undefined, 
          gender: undefined,
          healthConditions: [] 
        }
      ]
    }));
  };

  const removeFamilyMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== id)
    }));
  };

  const updateFamilyMember = (id: string, updates: Partial<typeof formData.familyMembers[0]>) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const toggleHealthCondition = (memberId: string, condition: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => {
        if (m.id === memberId) {
          const conditions = m.healthConditions || [];
          return {
            ...m,
            healthConditions: conditions.includes(condition)
              ? conditions.filter(c => c !== condition)
              : [...conditions, condition]
          };
        }
        return m;
      })
    }));
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              {isEditing ? (
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                    {userImagePreview ? (
                      <ImageWithFallback
                        src={userImagePreview}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <label
                    htmlFor="user-image-upload"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {uploadingImages['user'] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                  </label>
                  <Input
                    id="user-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUserImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                  {currentUser.imageUrl ? (
                    <ImageWithFallback
                      src={currentUser.imageUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
              )}
            </div>
            <div>
              <CardTitle>{currentUser.name}</CardTitle>
              <CardDescription>{currentUser.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="family">
                <Users className="w-4 h-4 mr-2" />
                Family Members
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="household-size">Household Size</Label>
                      <Input
                        id="household-size"
                        type="number"
                        min="1"
                        value={formData.householdSize}
                        onChange={(e) => setFormData({ ...formData, householdSize: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="district" className="text-sm">District</Label>
                        <Input
                          id="district"
                          placeholder="District"
                          value={formData.location.district}
                          onChange={(e) => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="division" className="text-sm">Division</Label>
                        <Input
                          id="division"
                          placeholder="Division"
                          value={formData.location.division}
                          onChange={(e) => setFormData({ ...formData, location: { ...formData.location, division: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Budget */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <Label className="text-lg font-semibold">Monthly Budget</Label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="budget-preference">Budget Level</Label>
                        <Select
                          value={formData.budgetPreference}
                          onValueChange={(value: 'low' | 'medium' | 'high' | 'premium') => 
                            setFormData({ ...formData, budgetPreference: value })
                          }
                        >
                          <SelectTrigger id="budget-preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Budget</SelectItem>
                            <SelectItem value="medium">Medium Budget</SelectItem>
                            <SelectItem value="high">High Budget</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthly-budget">Monthly Budget Amount (TK)</Label>
                        <Input
                          id="monthly-budget"
                          type="number"
                          min="0"
                          step="100"
                          value={formData.monthlyBudget > 0 ? formData.monthlyBudget : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, monthlyBudget: value === '' ? 0 : parseFloat(value) || 0 });
                          }}
                          placeholder="Enter monthly budget"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dietary Needs */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      <Label className="text-lg font-semibold">Dietary Needs</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {DIETARY_PREFERENCES.map((pref) => (
                        <div key={pref} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${pref}`}
                            checked={formData.dietaryPreferences.includes(pref)}
                            onCheckedChange={() => toggleDietaryPreference(pref)}
                          />
                          <label htmlFor={`edit-${pref}`} className="cursor-pointer text-sm">
                            {pref}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <p className="mt-1 font-medium">{currentUser.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="mt-1 font-medium">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Household Size</Label>
                      <p className="mt-1">{currentUser.householdSize} {currentUser.householdSize === 1 ? 'person' : 'people'}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="mt-1 text-sm">
                        {currentUser.location.district && <p>{currentUser.location.district}, {currentUser.location.division}</p>}
                        {!currentUser.location.district && <p className="text-muted-foreground">Not specified</p>}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Budget Display */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <Label className="text-lg font-semibold">Monthly Budget</Label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Budget Level</Label>
                        <p className="mt-1">
                          <Badge variant="outline" className="capitalize">
                            {currentUser.budgetPreference || 'Not set'}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <Label>Monthly Budget Amount</Label>
                        <p className="mt-1 font-medium">
                          {currentUser.monthlyBudget ? `TK ${currentUser.monthlyBudget.toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dietary Needs Display */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      <Label className="text-lg font-semibold">Dietary Needs</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.dietaryPreferences.length > 0 ? (
                        currentUser.dietaryPreferences.map(pref => (
                          <Badge key={pref} variant="secondary">{pref}</Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No dietary preferences set</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Family Members Tab */}
            <TabsContent value="family" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Family Members</h3>
                  <p className="text-sm text-muted-foreground">Manage your household members and their health information</p>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" onClick={addFamilyMember}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <Button size="sm" onClick={addFamilyMember}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {formData.familyMembers.length > 0 ? (
                <div className="space-y-3">
                  {formData.familyMembers.map((member, index) => (
                    <Card key={member.id} className="border">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">
                            {isEditing ? `Member ${index + 1}` : (member.name || `Member ${index + 1}`)}
                          </CardTitle>
                          {isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFamilyMember(member.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 px-4 pb-3">
                        {isEditing ? (
                          <>
                            <div className="flex items-center gap-3 pb-2 border-b">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                  {memberImagePreviews[member.id] ? (
                                    <ImageWithFallback
                                      src={memberImagePreviews[member.id]}
                                      alt={member.name || 'Member'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-muted-foreground" />
                                  )}
                                </div>
                                <label
                                  htmlFor={`member-image-${member.id}`}
                                  className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                  {uploadingImages[member.id] ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <Upload className="w-3 h-3" />
                                  )}
                                </label>
                                <Input
                                  id={`member-image-${member.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMemberImageChange(member.id, e)}
                                  className="hidden"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Profile Photo</p>
                                <p className="text-xs text-muted-foreground">Click icon to upload</p>
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor={`member-name-${member.id}`} className="text-xs">Name *</Label>
                                <Input
                                  id={`member-name-${member.id}`}
                                  placeholder="Enter name"
                                  value={member.name}
                                  onChange={(e) => updateFamilyMember(member.id, { name: e.target.value })}
                                  required
                                  className={`h-9 text-sm ${member.name === '' ? 'border-destructive' : ''}`}
                                />
                                {member.name === '' && (
                                  <p className="text-xs text-destructive">Name is required</p>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`member-age-${member.id}`} className="text-xs">Age</Label>
                                <Input
                                  id={`member-age-${member.id}`}
                                  type="number"
                                  min="0"
                                  max="120"
                                  placeholder="Enter age"
                                  value={member.age || ''}
                                  onChange={(e) => updateFamilyMember(member.id, { age: parseInt(e.target.value) || undefined })}
                                  className="h-9 text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor={`member-gender-${member.id}`} className="text-xs">Gender</Label>
                              <Select
                                value={member.gender || ''}
                                onValueChange={(value: 'male' | 'female' | 'other' | 'prefer-not-to-say') =>
                                  updateFamilyMember(member.id, { gender: value })
                                }
                              >
                                <SelectTrigger id={`member-gender-${member.id}`} className="h-9 text-sm">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 border-t pt-3">
                              <Label className="text-xs font-semibold">Health Conditions</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {HEALTH_CONDITIONS.map((condition) => (
                                  <div key={condition} className="flex items-center space-x-1.5">
                                    <Checkbox
                                      id={`${member.id}-${condition}`}
                                      checked={member.healthConditions?.includes(condition) || false}
                                      onCheckedChange={() => toggleHealthCondition(member.id, condition)}
                                      className="h-4 w-4"
                                    />
                                    <label 
                                      htmlFor={`${member.id}-${condition}`} 
                                      className="text-xs cursor-pointer leading-tight"
                                    >
                                      {condition}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 pb-2 border-b">
                              <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                {member.imageUrl ? (
                                  <ImageWithFallback
                                    src={member.imageUrl}
                                    alt={member.name || 'Member'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{member.name || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Name</Label>
                                <p className="mt-0.5 text-sm font-medium">{member.name || 'Not specified'}</p>
                              </div>
                              {member.age && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Age</Label>
                                  <p className="mt-0.5 text-sm font-medium">{member.age} years</p>
                                </div>
                              )}
                              {member.gender && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Gender</Label>
                                  <p className="mt-0.5">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {member.gender.replace('-', ' ')}
                                    </Badge>
                                  </p>
                                </div>
                              )}
                            </div>
                            {member.healthConditions && member.healthConditions.length > 0 && (
                              <div className="space-y-1.5 border-t pt-2">
                                <Label className="text-xs text-muted-foreground">Health Conditions</Label>
                                <div className="flex flex-wrap gap-1.5">
                                  {member.healthConditions.map(condition => (
                                    <Badge key={condition} variant="destructive" className="text-xs py-0">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No family members added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add family members to track their health information and dietary needs
                  </p>
                  <Button onClick={addFamilyMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Member
                  </Button>
                  {isEditing && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Fill in the member details and click "Save Changes" to save
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
