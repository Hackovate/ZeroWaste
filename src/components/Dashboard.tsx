import React from 'react';
import { useApp } from '../lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RESOURCES, FOOD_CATEGORIES } from '../lib/data';
import { Package, FileText, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, inventory, foodLogs } = useApp();

  // Get recent logs (last 5)
  const recentLogs = [...foodLogs].reverse().slice(0, 5);

  // Calculate inventory stats
  const totalItems = inventory.length;
  const categoryBreakdown = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get resource recommendations based on inventory and logs
  const getRecommendations = () => {
    const categories = new Set([
      ...inventory.map(i => i.category),
      ...foodLogs.map(l => l.category)
    ]);
    
    const recommendations = RESOURCES.filter(resource => {
      if (categories.has('dairy') && resource.category === 'nutrition' && resource.title.includes('Dairy')) {
        return true;
      }
      if (categories.has('vegetable') && resource.title.includes('Vegetable')) {
        return true;
      }
      if (categories.has('protein') && resource.title.includes('Protein')) {
        return true;
      }
      if (categories.has('grain') && resource.title.includes('Grain')) {
        return true;
      }
      return resource.category === 'sustainability';
    }).slice(0, 4);

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Check for items expiring soon (added more than 5 days ago for perishables)
  const expiringItems = inventory.filter(item => {
    const daysInInventory = Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / (1000 * 60 * 60 * 24));
    return item.expirationEstimate <= 7 && daysInInventory >= Math.floor(item.expirationEstimate * 0.7);
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1>Welcome back, {currentUser?.name}!</h1>
        <p className="text-[var(--color-700)] mt-1">
          Here's your food management overview
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalItems}</div>
            <p className="text-xs text-[var(--color-700)] mt-1">
              Across {Object.keys(categoryBreakdown).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Food Logs</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{foodLogs.length}</div>
            <p className="text-xs text-[var(--color-700)] mt-1">
              Total consumption records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{RESOURCES.length}</div>
            <p className="text-xs text-[var(--color-700)] mt-1">
              Available guides & articles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Items Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span>{item.name}</span>
                  <Badge variant="destructive">{item.expirationEstimate} days shelf life</Badge>
                </div>
              ))}
            </div>
            <Button onClick={() => onNavigate('inventory')} variant="outline" className="mt-4 w-full">
              View Inventory
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Your current food stock by category</CardDescription>
          </CardHeader>
          <CardContent>
            {totalItems > 0 ? (
              <div className="space-y-4">
                {/* Visual category breakdown with circles */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(categoryBreakdown).map(([category, count]) => {
                    const percentage = Math.round((count / totalItems) * 100);
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="#E5E5E5"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="var(--color-primary)"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${percentage * 1.256} ${125.6 - percentage * 1.256}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary">
                            {percentage}%
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm capitalize truncate">{category}</p>
                          <p className="text-xs text-[var(--color-700)]">{count} items</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={() => onNavigate('inventory')} variant="outline" className="w-full">
                  Manage Inventory
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-[var(--color-300)] mx-auto mb-4" />
                <p className="text-[var(--color-700)] mb-4">No items in inventory yet</p>
                <Button onClick={() => onNavigate('inventory')}>
                  Add Your First Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Food Logs</CardTitle>
            <CardDescription>Your latest consumption records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div>
                      <p>{log.itemName}</p>
                      <p className="text-sm text-[var(--color-700)]">
                        Quantity: {log.quantity} • {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{log.category}</Badge>
                  </div>
                ))}
                <Button onClick={() => onNavigate('logs')} variant="outline" className="w-full mt-4">
                  View All Logs
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-[var(--color-300)] mx-auto mb-4" />
                <p className="text-[var(--color-700)] mb-4">No food logs yet</p>
                <Button onClick={() => onNavigate('logs')}>
                  Create Your First Log
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommended Resources
          </CardTitle>
          <CardDescription>
            Based on your inventory and consumption patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map(resource => {
              const relatedCategories = [...new Set([
                ...inventory.map(i => i.category),
                ...foodLogs.map(l => l.category)
              ])];
              
              let reason = 'Sustainability tip';
              if (resource.title.includes('Dairy') && relatedCategories.includes('dairy')) {
                reason = 'Related to your dairy items';
              } else if (resource.title.includes('Vegetable') && relatedCategories.includes('vegetable')) {
                reason = 'Related to your vegetables';
              } else if (resource.title.includes('Protein') && relatedCategories.includes('protein')) {
                reason = 'Related to your protein items';
              } else if (resource.title.includes('Grain') && relatedCategories.includes('grain')) {
                reason = 'Related to your grains';
              }

              return (
                <div key={resource.id} className="p-4 border rounded-lg hover:bg-[var(--color-300)]/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4>{resource.title}</h4>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-700)] mb-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary">{reason}</span>
                    <Badge className="capitalize">{resource.category}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={() => onNavigate('resources')} variant="outline" className="w-full mt-4">
            Explore All Resources
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};