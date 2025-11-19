'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { TopBar } from '@/components/TopBar';
import { LandingPage } from '@/components/LandingPage';
import { Login } from '@/components/Login';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { Profile } from '@/components/Profile';
import { FoodLogs } from '@/components/FoodLogs';
import { Inventory } from '@/components/Inventory';
import { Resources } from '@/components/Resources';

export default function Home() {
    const { currentUser } = useApp();
    const [currentView, setCurrentView] = useState('dashboard');
    const [showLogin, setShowLogin] = useState(false);

    if (!currentUser) {
        if (!showLogin) {
            return <LandingPage onGetStarted={() => setShowLogin(true)} />;
        }
        return <Login onBackToHome={() => setShowLogin(false)} />;
    }

    // Show onboarding if user hasn't completed it
    if (!currentUser.onboardingCompleted) {
        return <Onboarding />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard onNavigate={setCurrentView} />;
            case 'profile':
                return <Profile />;
            case 'logs':
                return <FoodLogs />;
            case 'inventory':
                return <Inventory />;
            case 'resources':
                return <Resources />;
            default:
                return <Dashboard onNavigate={setCurrentView} />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopBar currentView={currentView} onNavigate={setCurrentView} />
            <main className="pt-0">
                {renderView()}
            </main>
        </div>
    );
}
