'use client';

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
      emoji: '📦',
      title: 'Smart Inventory',
      description: 'Track your food items with expiration alerts and smart categorization',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      emoji: '📝',
      title: 'Food Logging',
      description: 'Monitor consumption patterns and understand your eating habits',
      color: 'from-purple-500 to-pink-500'
    },
    {
      emoji: '📊',
      title: 'Analytics Dashboard',
      description: 'Visualize your food usage with interactive charts and insights',
      color: 'from-green-500 to-emerald-500'
    },
    {
      emoji: '📚',
      title: 'Resource Library',
      description: 'Access guides on nutrition, sustainability, and food storage',
      color: 'from-orange-500 to-red-500'
    }
  ];



  const steps = [
    'Create your free account in seconds',
    'Complete your personalized profile',
    'Start tracking your food inventory',
    'Get insights and reduce waste'
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FEF5F4] via-white to-[#F0F0F0] relative">
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
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center relative z-10">
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="h-20 sm:h-24 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <img src="/assets/ZeroWaste-Full-Logo.svg" alt="ZeroWaste" className="h-full drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-linear-to-r from-primary via-[#FF6B63] to-primary bg-clip-text text-transparent mb-4 animate-slide-up">
              Welcome to ZeroWaste
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
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* Features Section */}
      <div className="py-12 sm:py-16 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your food inventory efficiently
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              return (
                <Card 
                  key={feature.title} 
                  className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardHeader className="relative z-10 pb-3">
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{feature.emoji}</span>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
                className="flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-[#FEF5F4] to-white border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-primary to-[#FF6B63] text-white flex items-center justify-center text-lg font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
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
      <div className="py-12 sm:py-16 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border border-gray-200 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-r from-gray-50 to-white opacity-50"></div>
            <CardContent className="p-8 sm:p-12 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
                Ready to Make a Difference?
              </h2>
              <p className="text-base sm:text-lg mb-8 text-gray-800 max-w-2xl mx-auto">
                Join ZeroWaste today and start your journey towards sustainable living and smarter food management
              </p>
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                className="h-12 px-8 text-base font-semibold bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-lg transition-all duration-300"
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
            <p className="mb-1 text-sm">© 2025 ZeroWaste. All rights reserved.</p>
            <p className="text-xs text-gray-500">Making food waste reduction accessible to everyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};
