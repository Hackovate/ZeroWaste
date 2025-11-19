import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  ChefHat, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  BarChart3,
  Package,
  FileText,
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Package,
      title: 'Smart Inventory',
      description: 'Track your food items with expiration alerts and smart categorization'
    },
    {
      icon: FileText,
      title: 'Food Logging',
      description: 'Monitor consumption patterns and understand your eating habits'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize your food usage with interactive charts and insights'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access guides on nutrition, sustainability, and food storage'
    }
  ];

  const benefits = [
    {
      icon: TrendingDown,
      title: 'Reduce Food Waste',
      stat: 'Up to 40%',
      description: 'Track expiration dates and optimize consumption'
    },
    {
      icon: DollarSign,
      title: 'Save Money',
      stat: 'Save TK 5,000+',
      description: 'Reduce unnecessary purchases and food spoilage'
    },
    {
      icon: Leaf,
      title: 'Help the Planet',
      stat: '200kg CO₂',
      description: 'Reduce your environmental impact per year'
    }
  ];

  const steps = [
    'Create your free account in seconds',
    'Complete your personalized profile',
    'Start tracking your food inventory',
    'Get insights and reduce waste'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF5F4] via-white to-[#F0F0F0]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[var(--color-primary)] mb-6">
              Welcome to FoodTrack
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--color-700)] max-w-3xl mx-auto mb-8">
              Your intelligent companion for reducing food waste, saving money, and living sustainably
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={onGetStarted} size="lg" className="h-14 px-8 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-[var(--color-700)]">
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">Why Choose FoodTrack?</h2>
            <p className="text-lg text-[var(--color-700)] max-w-2xl mx-auto">
              Join thousands of households making a difference in food waste reduction
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center border-2 hover:border-[var(--color-primary)] transition-colors">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#FEF5F4] flex items-center justify-center">
                        <Icon className="w-8 h-8 text-[var(--color-primary)]" />
                      </div>
                    </div>
                    <CardTitle>{benefit.title}</CardTitle>
                    <div className="text-3xl text-[var(--color-primary)] mt-2">
                      {benefit.stat}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[var(--color-700)]">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">Powerful Features</h2>
            <p className="text-lg text-[var(--color-700)] max-w-2xl mx-auto">
              Everything you need to manage your food inventory efficiently
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">How It Works</h2>
            <p className="text-lg text-[var(--color-700)]">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-[#FEF5F4] hover:bg-[#FEF5F4]/80 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg">
                  {index + 1}
                </div>
                <p className="text-lg">{step}</p>
                <CheckCircle2 className="ml-auto w-6 h-6 text-[var(--color-primary)]" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button onClick={onGetStarted} size="lg" className="h-12 px-8">
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[#FF6B63] text-white border-0 shadow-xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl mb-4 text-white">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                Join FoodTrack today and start your journey towards sustainable living and smarter food management
              </p>
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                variant="secondary"
                className="h-14 px-8 text-lg bg-white text-[var(--color-primary)] hover:bg-gray-100"
              >
                Get Started Now - It's Free!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[var(--color-700)]">
            <p className="mb-2">© 2025 FoodTrack. All rights reserved.</p>
            <p className="text-sm">Making food waste reduction accessible to everyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};
