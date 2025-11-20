'use client';

import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { TopBar } from '@/components/TopBar';
import { AppSidebar } from '@/components/AppSidebar';
import { LandingPage } from '@/components/LandingPage';
import { Login } from '@/components/Login';
import { Onboarding } from '@/components/Onboarding';
import { ComponentLoadingFallback } from '@/components/ui/loading';
import { InstallPrompt } from '@/components/InstallPrompt';
import { registerServiceWorker } from '@/lib/registerServiceWorker';

// Lazy load components for better performance
const Dashboard = lazy(() => 
    import('@/components/Dashboard').then(module => ({ default: module.Dashboard }))
);
const Profile = lazy(() => 
    import('@/components/Profile').then(module => ({ default: module.Profile }))
);
const FoodLogs = lazy(() => 
    import('@/components/FoodLogs').then(module => ({ default: module.FoodLogs }))
);
const Inventory = lazy(() => 
    import('@/components/Inventory').then(module => ({ default: module.Inventory }))
);
const Resources = lazy(() => 
    import('@/components/Resources').then(module => ({ default: module.Resources }))
);
const Community = lazy(() => 
    import('@/components/Community').then(module => ({ default: module.Community }))
);
const FoodScanning = lazy(() => 
    import('@/components/FoodScanning').then(module => ({ default: module.FoodScanning }))
);

export default function Home() {
    const { currentUser } = useApp();
    const [currentView, setCurrentView] = useState('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    // Register service worker for PWA
    useEffect(() => {
        registerServiceWorker();
    }, []);

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
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Dashboard onNavigate={setCurrentView} />
                    </Suspense>
                );
            case 'profile':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Profile />
                    </Suspense>
                );
            case 'logs':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <FoodLogs />
                    </Suspense>
                );
            case 'inventory':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Inventory />
                    </Suspense>
                );
            case 'resources':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Resources />
                    </Suspense>
                );
            case 'scanning':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <FoodScanning />
                    </Suspense>
                );
            case 'community':
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Community />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<ComponentLoadingFallback />}>
                        <Dashboard onNavigate={setCurrentView} />
                    </Suspense>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <TopBar currentView={currentView} onNavigate={setCurrentView} />
            <div className="flex flex-1">
                <AppSidebar
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <main className="flex-1 pt-0">
                    {renderView()}
                </main>
            </div>
            <InstallPrompt />
        </div>
    );
}
