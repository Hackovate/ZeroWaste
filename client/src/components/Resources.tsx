import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RESOURCES } from '../lib/data';
import { BookOpen, Search, ExternalLink, Video, FileText } from 'lucide-react';

export const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const categories = [...new Set(RESOURCES.map(r => r.category))];
  const types = [...new Set(RESOURCES.map(r => r.type))];

  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const resourcesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredResources.filter(r => r.category === category);
    return acc;
  }, {} as Record<string, typeof RESOURCES>);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1>Resources</h1>
        <p className="text-[var(--color-700)] mt-1">
          Sustainability tips, nutrition guides, and educational content
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-700)] w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat} ({resourcesByCategory[cat]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredResources.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map(resource => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {resource.description}
                        </CardDescription>
                      </div>
                      {resource.type === 'video' ? (
                        <Video className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className="capitalize">{resource.category}</Badge>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-[var(--color-300)] mx-auto mb-4" />
              <h3>No resources found</h3>
              <p className="text-[var(--color-700)] mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            {resourcesByCategory[category]?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resourcesByCategory[category].map(resource => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {resource.description}
                          </CardDescription>
                        </div>
                        {resource.type === 'video' ? (
                          <Video className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-[var(--color-300)] mx-auto mb-4" />
                <h3>No {category} resources found</h3>
                <p className="text-[var(--color-700)] mt-2">
                  Try adjusting your search
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Resource Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {RESOURCES.length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Total Resources</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {RESOURCES.filter(r => r.type === 'article').length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Articles</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {RESOURCES.filter(r => r.type === 'video').length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Videos</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {categories.length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
