// Mock data for the application

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  expirationEstimate: number; // days
  price: number;
}

export interface InventoryItem extends FoodItem {
  quantity: number;
  unit: 'kg' | 'gm' | 'ltr' | 'pcs';
  dateAdded: string;
  imageUrl?: string;
}

export interface FoodLog {
  id: string;
  itemName: string;
  quantity: number;
  unit: 'kg' | 'gm' | 'ltr' | 'pcs';
  category: string;
  date: string;
  imageUrl?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'youtube' | 'pdf' | 'blog';
  url?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  householdSize: number;
  dietaryPreferences: string[];
  budgetPreference?: 'low' | 'medium' | 'high' | 'premium';
  monthlyBudget?: number;
  location: {
    district: string;
    division: string;
  };
  imageUrl?: string;
  familyMembers?: Array<{
    id: string;
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    healthConditions?: string[];
    imageUrl?: string;
  }>;
  onboardingCompleted?: boolean;
}

export const HEALTH_CONDITIONS = [
  'Allergy',
  'Asthma',
  'High Blood Pressure',
  'Diabetes',
  'Heart Disease',
  'Kidney Disease',
  'Lactose Intolerance',
  'Gluten Intolerance',
  'Other'
];

export const FOOD_DATABASE: FoodItem[] = [
  { id: '1', name: 'Milk', category: 'dairy', expirationEstimate: 7, price: 99 },
  { id: '2', name: 'Cheddar Cheese', category: 'dairy', expirationEstimate: 30, price: 150 },
  { id: '3', name: 'Yogurt', category: 'dairy', expirationEstimate: 14, price: 120 },
  { id: '4', name: 'White Bread', category: 'grain', expirationEstimate: 7, price: 80 },
  { id: '5', name: 'Brown Rice', category: 'grain', expirationEstimate: 365, price: 200 },
  { id: '6', name: 'Pasta', category: 'grain', expirationEstimate: 730, price: 60 },
  { id: '7', name: 'Bananas', category: 'fruit', expirationEstimate: 5, price: 50 },
  { id: '8', name: 'Apples', category: 'fruit', expirationEstimate: 14, price: 120 },
  { id: '9', name: 'Strawberries', category: 'fruit', expirationEstimate: 5, price: 180 },
  { id: '10', name: 'Carrots', category: 'vegetable', expirationEstimate: 21, price: 70 },
  { id: '11', name: 'Broccoli', category: 'vegetable', expirationEstimate: 7, price: 90 },
  { id: '12', name: 'Spinach', category: 'vegetable', expirationEstimate: 7, price: 100 },
  { id: '13', name: 'Chicken Breast', category: 'protein', expirationEstimate: 2, price: 280 },
  { id: '14', name: 'Ground Beef', category: 'protein', expirationEstimate: 2, price: 250 },
  { id: '15', name: 'Eggs', category: 'protein', expirationEstimate: 28, price: 140 },
  { id: '16', name: 'Olive Oil', category: 'oil', expirationEstimate: 365, price: 350 },
  { id: '17', name: 'Butter', category: 'dairy', expirationEstimate: 90, price: 160 },
  { id: '18', name: 'Tomatoes', category: 'vegetable', expirationEstimate: 7, price: 100 },
  { id: '19', name: 'Onions', category: 'vegetable', expirationEstimate: 30, price: 60 },
  { id: '20', name: 'Potatoes', category: 'vegetable', expirationEstimate: 60, price: 150 },
];

export const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'How to Reduce Food Waste at Home',
    description: 'Practical tips for minimizing food waste in your kitchen',
    category: 'sustainability',
    type: 'article',
    url: 'https://example.com/reduce-waste'
  },
  {
    id: '2',
    title: 'Understanding Food Expiration Dates',
    description: 'Learn the difference between sell-by, use-by, and best-by dates',
    category: 'education',
    type: 'article',
    url: 'https://example.com/expiration-dates'
  },
  {
    id: '3',
    title: 'Composting Basics for Beginners',
    description: 'Start your composting journey with this comprehensive guide',
    category: 'sustainability',
    type: 'video',
    url: 'https://example.com/composting'
  },
  {
    id: '4',
    title: 'Meal Planning to Reduce Waste',
    description: 'Strategic meal planning techniques to use all your groceries',
    category: 'nutrition',
    type: 'article',
    url: 'https://example.com/meal-planning'
  },
  {
    id: '5',
    title: 'Proper Food Storage Techniques',
    description: 'Keep your food fresh longer with correct storage methods',
    category: 'education',
    type: 'video',
    url: 'https://example.com/storage'
  },
  {
    id: '6',
    title: 'Dairy Products: Nutrition Guide',
    description: 'Complete nutritional information about dairy products',
    category: 'nutrition',
    type: 'article',
    url: 'https://example.com/dairy-nutrition'
  },
  {
    id: '7',
    title: 'Building a Sustainable Kitchen',
    description: 'Tips for creating an eco-friendly kitchen environment',
    category: 'sustainability',
    type: 'article',
    url: 'https://example.com/sustainable-kitchen'
  },
  {
    id: '8',
    title: 'Grain Storage Best Practices',
    description: 'How to properly store grains for maximum freshness',
    category: 'education',
    type: 'article',
    url: 'https://example.com/grain-storage'
  },
  {
    id: '9',
    title: 'The Benefits of Eating Seasonal Produce',
    description: 'Why seasonal fruits and vegetables are better for you and the planet',
    category: 'nutrition',
    type: 'video',
    url: 'https://example.com/seasonal-produce'
  },
  {
    id: '10',
    title: 'Zero Waste Shopping Guide',
    description: 'How to shop for groceries with minimal packaging waste',
    category: 'sustainability',
    type: 'article',
    url: 'https://example.com/zero-waste'
  },
  {
    id: '11',
    title: 'Protein Storage and Safety',
    description: 'Essential guidelines for storing meat and protein safely',
    category: 'education',
    type: 'video',
    url: 'https://example.com/protein-safety'
  },
  {
    id: '12',
    title: 'Vegetable Nutrition Facts',
    description: 'Comprehensive guide to vegetable nutritional values',
    category: 'nutrition',
    type: 'article',
    url: 'https://example.com/vegetable-nutrition'
  },
  {
    id: '13',
    title: 'Freezing Foods: A Complete Guide',
    description: 'What to freeze and how to freeze it properly',
    category: 'education',
    type: 'article',
    url: 'https://example.com/freezing-guide'
  },
  {
    id: '14',
    title: 'Community Food Sharing Programs',
    description: 'Connect with local food sharing initiatives',
    category: 'sustainability',
    type: 'article',
    url: 'https://example.com/food-sharing'
  },
  {
    id: '15',
    title: 'Balanced Diet Essentials',
    description: 'Understanding macronutrients and micronutrients',
    category: 'nutrition',
    type: 'video',
    url: 'https://example.com/balanced-diet'
  },
  {
    id: '16',
    title: 'Reading Nutrition Labels',
    description: 'How to understand and interpret food labels',
    category: 'education',
    type: 'article',
    url: 'https://example.com/nutrition-labels'
  },
  {
    id: '17',
    title: 'Growing Your Own Herbs',
    description: 'Start a kitchen herb garden to reduce food waste',
    category: 'sustainability',
    type: 'video',
    url: 'https://example.com/herb-garden'
  },
  {
    id: '18',
    title: 'Food Safety Temperature Guide',
    description: 'Critical temperatures for food safety and storage',
    category: 'education',
    type: 'article',
    url: 'https://example.com/temperature-guide'
  },
  {
    id: '19',
    title: 'Plant-Based Protein Sources',
    description: 'Explore sustainable protein alternatives',
    category: 'nutrition',
    type: 'article',
    url: 'https://example.com/plant-protein'
  },
  {
    id: '20',
    title: 'Upcycling Food Scraps',
    description: 'Creative ways to use vegetable scraps and leftovers',
    category: 'sustainability',
    type: 'video',
    url: 'https://example.com/upcycling'
  },
];

export const DIETARY_PREFERENCES = [
  'Everything (Omnivore)',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
];

export const FOOD_CATEGORIES = [
  'dairy',
  'grain',
  'fruit',
  'vegetable',
  'protein',
  'oil',
];

export const UNITS = ['kg', 'gm', 'ltr', 'pcs'] as const;