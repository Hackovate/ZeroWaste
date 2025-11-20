import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DIETARY_PREFERENCES } from '../lib/data';
import { toast } from 'sonner';
import { ChefHat } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    location: {
      district: '',
      division: '',
    },
    householdSize: 1,
    dietaryPreferences: [] as string[],
  });

  const handleContinue = async () => {
    if (step === 1) {
      if (!onboardingData.location.district || !onboardingData.location.division) {
        toast.error('Please enter your district and division');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Complete onboarding
      await updateProfile({
        ...onboardingData,
        onboardingCompleted: true,
      });
      toast.success('Welcome to FoodTrack! 🎉');
    }
  };

  const handleSkip = async () => {
    await updateProfile({
      location: onboardingData.location.district 
        ? onboardingData.location 
        : { district: 'Not specified', division: 'Not specified' },
      householdSize: onboardingData.householdSize,
      dietaryPreferences: onboardingData.dietaryPreferences.length > 0 
        ? onboardingData.dietaryPreferences 
        : ['Everything (Omnivore)'],
      onboardingCompleted: true,
    });
    toast.success('Welcome to FoodTrack! 🎉');
  };

  const toggleDietaryPreference = (pref: string) => {
    setOnboardingData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#FEF5F4] via-white to-[#F0F0F0] p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-primary">Welcome to FoodTrack!</CardTitle>
          <CardDescription>
            Let's personalize your experience. This will only take a moment.
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-(--color-primary)' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-(--color-primary)' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 3 ? 'bg-(--color-primary)' : 'bg-gray-200'}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-center">Where are you located?</h3>
                <div className="space-y-2">
                  <Label htmlFor="location-district">District</Label>
                  <Input
                    id="location-district"
                    placeholder="e.g., Dhaka"
                    value={onboardingData.location.district}
                    onChange={(e) => setOnboardingData({ ...onboardingData, location: { ...onboardingData.location, district: e.target.value } })}
                    className="text-center"
                  />
                  <Label htmlFor="location-division">Division</Label>
                  <Input
                    id="location-division"
                    placeholder="e.g., Dhaka"
                    value={onboardingData.location.division}
                    onChange={(e) => setOnboardingData({ ...onboardingData, location: { ...onboardingData.location, division: e.target.value } })}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    This helps us provide location-specific recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-center">How many people are in your household?</h3>
                <div className="space-y-2">
                  <Label htmlFor="household-size">Household Size</Label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, householdSize: size })}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          onboardingData.householdSize === size
                            ? 'border-(--color-primary) bg-(--color-primary) text-white'
                            : 'border-gray-300 hover:border-(--color-primary)'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {onboardingData.householdSize > 8 && (
                    <div className="mt-4">
                      <Input
                        id="household-size"
                        type="number"
                        min="1"
                        value={onboardingData.householdSize}
                        onChange={(e) => setOnboardingData({ ...onboardingData, householdSize: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setOnboardingData({ ...onboardingData, householdSize: 9 })}
                    className="w-full text-sm text-(--color-primary) hover:underline mt-2"
                  >
                    More than 8
                  </button>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    This helps us calculate portion sizes and waste reduction goals
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-center">Any dietary preferences?</h3>
                <div className="space-y-2">
                  <Label>Select all that apply (optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DIETARY_PREFERENCES.map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => toggleDietaryPreference(pref)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          onboardingData.dietaryPreferences.includes(pref)
                            ? 'border-(--color-primary) bg-[#FEF5F4] text-(--color-primary)'
                            : 'border-gray-200 hover:border-(--color-primary) hover:bg-gray-50'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    We'll use this to provide personalized food recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleContinue}
              className="flex-1"
            >
              {step === 3 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};