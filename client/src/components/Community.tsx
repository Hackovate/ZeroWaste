import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Globe, Users, MessageSquare, Calendar } from 'lucide-react';

export const Community: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1>Community</h1>
        <p className="text-muted-foreground mt-1">
          Connect with local and online communities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Local Community</CardTitle>
                <CardDescription>Connect with neighbors</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join local food sharing groups and community initiatives
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Online Groups</CardTitle>
                <CardDescription>Virtual communities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Participate in online forums and discussion groups
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Events</CardTitle>
                <CardDescription>Community events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find and join local food waste reduction events
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Community features are being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on building a vibrant community platform where you can:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>Share food with neighbors</li>
            <li>Join local sustainability groups</li>
            <li>Participate in community challenges</li>
            <li>Connect with like-minded individuals</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

