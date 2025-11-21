import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "@/styles/globals.css";
import "@/index.css";
import { AppProvider } from "@/lib/AppContext";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#F55951",
};

export const metadata: Metadata = {
    title: "ZeroWaste - Food Waste Management",
    description: "Track food inventory, log consumption, and reduce food waste",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "ZeroWaste",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/assets/ZeroWaste-icon.svg" type="image/svg+xml" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/assets/ZeroWaste-icon.svg" />
                <meta name="theme-color" content="#F55951" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="ZeroWaste" />
            </head>
            <body suppressHydrationWarning>
                <AppProvider>
                    {children}
                    <Toaster />
                </AppProvider>
            </body>
        </html>
    );
}
