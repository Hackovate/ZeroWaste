'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[InstallPrompt] App is already installed (standalone mode)');
      setIsInstalled(true);
      return;
    }

    // Check if already installed via localStorage
    const installDismissed = localStorage.getItem('pwa-install-dismissed');
    if (installDismissed) {
      const dismissedTime = parseInt(installDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        console.log('[InstallPrompt] Install prompt was dismissed recently, not showing');
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[InstallPrompt] beforeinstallprompt event fired');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowPrompt(true);
      setCanInstall(true);
    };

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('[InstallPrompt] Service worker is ready');
      });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was just installed
    window.addEventListener('appinstalled', () => {
      console.log('[InstallPrompt] App was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    });

    // For testing: Check if we can show the prompt after a delay
    // This helps debug if the event isn't firing
    const checkTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        console.log('[InstallPrompt] No beforeinstallprompt event after 3 seconds');
        console.log('[InstallPrompt] Service Worker registered:', 'serviceWorker' in navigator);
        console.log('[InstallPrompt] Manifest check:', document.querySelector('link[rel="manifest"]')?.getAttribute('href'));
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(checkTimer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[InstallPrompt] No deferred prompt available');
      // Don't show alert, just dismiss the prompt if we don't have install capability
      setShowPrompt(false);
      return;
    }

    try {
      console.log('[InstallPrompt] Showing install prompt');
      // Show the install prompt - this triggers the native browser install dialog
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[InstallPrompt] User accepted the install prompt');
        setShowPrompt(false);
        setIsInstalled(true);
        localStorage.removeItem('pwa-install-dismissed');
      } else {
        console.log('[InstallPrompt] User dismissed the install prompt');
        // Store dismissal time
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('[InstallPrompt] Error showing install prompt:', error);
      // If prompt fails, just dismiss our custom prompt
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Only show prompt if we have the actual install capability
  // Don't show in test mode without deferredPrompt since the button won't work
  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed z-50 w-72" style={{ bottom: '1rem', right: '1rem', position: 'fixed' }}>
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold leading-tight">Install ZeroWaste</CardTitle>
              <CardDescription className="mt-0.5 text-xs leading-tight">
                Install our app for a better experience and quick access
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 -mt-0.5 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 text-xs h-8"
              size="sm"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Install App
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3"
              onClick={handleDismiss}
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

