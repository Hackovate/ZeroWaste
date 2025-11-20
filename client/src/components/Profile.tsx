import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { DIETARY_PREFERENCES } from '../lib/data';
import { User, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    householdSize: currentUser?.householdSize || 1,
    dietaryPreferences: currentUser?.dietaryPreferences || [],
    location: currentUser?.location || { district: '', division: '' },
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      householdSize: currentUser?.householdSize || 1,
      dietaryPreferences: currentUser?.dietaryPreferences || [],
      location: currentUser?.location || { district: '', division: '' },
    });
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

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Profile</h1>
          <p className="text-(--color-700) mt-1">
            Manage your account information
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle>{currentUser.name}</CardTitle>
              <CardDescription>{currentUser.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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

              <div className="space-y-2">
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DIETARY_PREFERENCES.map((pref) => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${pref}`}
                        checked={formData.dietaryPreferences.includes(pref)}
                        onCheckedChange={() => toggleDietaryPreference(pref)}
                      />
                      <label htmlFor={`edit-${pref}`} className="cursor-pointer">
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
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
                  <p className="mt-1">{currentUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1">{currentUser.email}</p>
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
                    {!currentUser.location.district && <p className="text-(--color-700)">Not specified</p>}
                  </div>
                </div>
              </div>

              <div>
                <Label>Dietary Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentUser.dietaryPreferences.length > 0 ? (
                    currentUser.dietaryPreferences.map(pref => (
                      <Badge key={pref} variant="secondary">{pref}</Badge>
                    ))
                  ) : (
                    <p className="text-(--color-700)">No dietary preferences set</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-(--color-300)/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {currentUser.householdSize}
              </p>
              <p className="text-sm text-(--color-700) mt-1">Household Members</p>
            </div>
            <div className="text-center p-4 bg-(--color-300)/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {currentUser.dietaryPreferences.length}
              </p>
              <p className="text-sm text-(--color-700) mt-1">Dietary Preferences</p>
            </div>
            <div className="text-center p-4 bg-(--color-300)/30 rounded-lg">
              <p className="text-sm font-semibold text-primary">
                {currentUser.location.district || currentUser.location.division || 'Not specified'}
              </p>
              <p className="text-sm text-(--color-700) mt-1">Location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};