import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ArrowUp,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: Package,
      title: 'Smart Inventory',
      description: 'Track your food items with expiration alerts and smart categorization',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Food Logging',
      description: 'Monitor consumption patterns and understand your eating habits',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize your food usage with interactive charts and insights',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access guides on nutrition, sustainability, and food storage',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = [
    {
      icon: TrendingDown,
      title: 'Reduce Food Waste',
      stat: 'Up to 40%',
      description: 'Track expiration dates and optimize consumption',
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      icon: DollarSign,
      title: 'Save Money',
      stat: 'Save TK 5,000+',
      description: 'Reduce unnecessary purchases and food spoilage',
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      icon: Leaf,
      title: 'Help the Planet',
      stat: '200kg CO₂',
      description: 'Reduce your environmental impact per year',
      gradient: 'from-green-400 to-emerald-500'
    }
  ];

  const steps = [
    'Create your free account in seconds',
    'Complete your personalized profile',
    'Start tracking your food inventory',
    'Get insights and reduce waste'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF5F4] via-white to-[#F0F0F0] relative">
      {/* Scroll to Top Button - Fixed to bottom right */}
      <button
        onClick={scrollToTop}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
        className={`w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center relative z-10">
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="h-20 sm:h-24 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <img src="/assets/ZeroWaste-Full-Logo.svg" alt="FoodTrack" className="h-full drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-[#FF6B63] to-primary bg-clip-text text-transparent mb-4 animate-slide-up">
              Welcome to FoodTrack
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
              Your intelligent companion for reducing food waste, saving money, and living sustainably
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-400">
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-gray-600">
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Why Choose FoodTrack?
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Join thousands of households making a difference in food waste reduction
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={benefit.title} 
                  className="text-center border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardHeader className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold">{benefit.title}</CardTitle>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent mt-2`}>
                      {benefit.stat}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your food inventory efficiently
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardHeader className="relative z-10 pb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <CardDescription className="text-sm text-gray-600">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-base text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FEF5F4] to-white border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#FF6B63] text-white flex items-center justify-center text-lg font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                <p className="text-base font-medium text-gray-800 flex-1">{step}</p>
                <CheckCircle2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Start Your Journey Today
              <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary via-[#FF6B63] to-primary text-white border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-[#FF6B63]/90"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <CardContent className="p-8 sm:p-12 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                Ready to Make a Difference?
              </h2>
              <p className="text-base sm:text-lg mb-8 text-white/95 max-w-2xl mx-auto">
                Join FoodTrack today and start your journey towards sustainable living and smarter food management
              </p>
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                variant="secondary"
                className="h-12 px-8 text-base font-semibold bg-white text-primary hover:bg-gray-50 hover:scale-105 shadow-lg transition-all duration-300"
              >
                Get Started Now - It's Free!
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-1 text-sm">© 2025 FoodTrack. All rights reserved.</p>
            <p className="text-xs text-gray-500">Making food waste reduction accessible to everyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};
