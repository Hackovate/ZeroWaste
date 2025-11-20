import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';
import { useApp } from '../lib/AppContext';
import { BookOpen, Search, ExternalLink, Video, FileText, Youtube, File, Rss } from 'lucide-react';

const RESOURCES_PER_PAGE = 9;
const CATEGORIES = ['waste reduction', 'meal planning', 'nutrition tips', 'budget meal tips', 'recipes'];

export const Resources: React.FC = () => {
  const { resources, resourcesPagination, loading, fetchResources } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch resources when page or category changes
  useEffect(() => {
    const category = activeTab !== 'all' ? activeTab : categoryFilter !== 'all' ? categoryFilter : undefined;
    fetchResources(currentPage, RESOURCES_PER_PAGE, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab, categoryFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, categoryFilter]);

  const types = [...new Set(resources.map(r => r.type))];

  // Client-side filtering for search and type (since these are quick filters)
  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!resourcesPagination || resourcesPagination.totalPages <= 1) return null;

    const { page, totalPages, hasNextPage, hasPreviousPage } = resourcesPagination;
    const pages: (number | string)[] = [];
    
    // Generate page numbers
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current range, ellipsis, last page
      pages.push(1);
      if (page > 3) pages.push('ellipsis-start');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasPreviousPage) handlePageChange(page - 1);
              }}
              className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pages.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            const pageNum = p as number;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasNextPage) handlePageChange(page + 1);
              }}
              className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1>Resources</h1>
        <p className="text-[var(--color-700)] mt-1">
          Waste reduction tips, nutrition guides, budget meal ideas, meal planning strategies, and recipes
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
                {CATEGORIES.map(cat => (
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All {resourcesPagination ? `(${resourcesPagination.total})` : ''}</TabsTrigger>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-[var(--color-300)] mx-auto mb-4 animate-pulse" />
              <h3>Loading resources...</h3>
            </div>
          ) : filteredResources.length > 0 ? (
            <>
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
                      {resource.type === 'video' || resource.type === 'youtube' ? (
                        resource.type === 'youtube' ? (
                          <Youtube className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Video className="w-5 h-5 text-primary flex-shrink-0" />
                        )
                      ) : resource.type === 'pdf' ? (
                        <File className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : resource.type === 'blog' ? (
                        <Rss className="w-5 h-5 text-primary flex-shrink-0" />
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
              {renderPagination()}
            </>
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

        {CATEGORIES.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            {filteredResources.length > 0 ? (
              <>
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
                        {resource.type === 'video' || resource.type === 'youtube' ? (
                          resource.type === 'youtube' ? (
                            <Youtube className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <Video className="w-5 h-5 text-primary flex-shrink-0" />
                          )
                        ) : resource.type === 'pdf' ? (
                          <File className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : resource.type === 'blog' ? (
                          <Rss className="w-5 h-5 text-primary flex-shrink-0" />
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
                {renderPagination()}
              </>
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
                {resourcesPagination?.total || resources.length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Total Resources</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {resources.filter(r => r.type === 'article').length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Articles</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {resources.filter(r => r.type === 'video' || r.type === 'youtube').length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Videos</p>
            </div>
            <div className="text-center p-4 bg-[var(--color-300)]/30 rounded-lg">
              <p className="text-2xl font-semibold text-primary">
                {CATEGORIES.length}
              </p>
              <p className="text-sm text-[var(--color-700)] mt-1">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
