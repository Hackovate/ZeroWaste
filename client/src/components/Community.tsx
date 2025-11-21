'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  AlertTriangle, 
  ThumbsUp,
  Filter,
  Package,
  LayoutGrid,
  List,
  Map as MapIcon,
  Zap,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
});

const CATEGORIES = ['dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil'];
const UNITS = ['kg', 'gm', 'ltr', 'pcs'];
const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 
  'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj'
];
const DIVISIONS = ['Dhaka', 'Chittagang', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Rajshahi': { lat: 24.3636, lng: 88.6241 },
  'Khulna': { lat: 22.8456, lng: 89.5403 },
  'Barisal': { lat: 22.7010, lng: 90.3535 },
  'Rangpur': { lat: 25.7439, lng: 89.2752 },
  'Mymensingh': { lat: 24.7471, lng: 90.4203 },
  'Comilla': { lat: 23.4607, lng: 91.1809 },
  'Gazipur': { lat: 24.0023, lng: 90.4264 },
  'Narayanganj': { lat: 23.6238, lng: 90.5000 }
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

export const Community: React.FC = () => {
  const { 
    currentUser, 
    helpRequests, 
    helpRequestsPagination,
    fetchHelpRequests,
    createHelpRequest, 
    createDonation, 
    reportHelpRequest 
  } = useApp();

  // Seek Help form state
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantityNeeded: '',
    unit: '',
    urgencyLevel: 'medium',
    description: '',
    contactName: currentUser?.name || '',
    contactEmail: currentUser?.email || '',
    contactPhone: '',
    district: currentUser?.location?.district || '',
    division: currentUser?.location?.division || '',
    neededBy: '',
  });

  // Filters and sorting
  const [filters, setFilters] = useState({
    district: 'all',
    category: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [donationAmount, setDonationAmount] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'map'>('cards');
  const [showMatching, setShowMatching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Fetch help requests on mount and when filters change
  useEffect(() => {
    const filterParams = {
      district: filters.district === 'all' ? '' : filters.district,
      category: filters.category === 'all' ? '' : filters.category,
      status: filters.status === 'all' ? '' : filters.status,
      sortBy
    };
    fetchHelpRequests(filterParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.district, filters.category, filters.status, sortBy]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.category || !formData.quantityNeeded || !formData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    await createHelpRequest({
      title: formData.itemName,
      category: formData.category,
      quantity: parseFloat(formData.quantityNeeded),
      unit: formData.unit,
      description: formData.description || undefined,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone || undefined,
      district: formData.district || undefined,
      division: formData.division || undefined,
      neededBy: formData.neededBy ? new Date(formData.neededBy).toISOString() : undefined,
    });

    // Reset form
    setFormData({
      itemName: '',
      category: '',
      quantityNeeded: '',
      unit: '',
      urgencyLevel: 'medium',
      description: '',
      contactName: currentUser?.name || '',
      contactEmail: currentUser?.email || '',
      contactPhone: '',
      district: currentUser?.location?.district || '',
      division: currentUser?.location?.division || '',
      neededBy: '',
    });
  };

  const handleDonate = async (helpRequestId: string) => {
    const amount = donationAmount[helpRequestId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    await createDonation({
      helpRequestId,
      quantity: parseFloat(amount),
      message: '',
    });

    setDonationAmount(prev => ({ ...prev, [helpRequestId]: '' }));
    const filterParams = {
      district: filters.district === 'all' ? '' : filters.district,
      category: filters.category === 'all' ? '' : filters.category,
      status: filters.status === 'all' ? '' : filters.status,
      sortBy
    };
    fetchHelpRequests(filterParams); // Refresh to update donation counts
  };

  const handleReport = async (helpRequestId: string, isFraud: boolean) => {
    await reportHelpRequest(helpRequestId, isFraud ? 'fraud' : 'trusted');
    const filterParams = {
      district: filters.district === 'all' ? '' : filters.district,
      category: filters.category === 'all' ? '' : filters.category,
      status: filters.status === 'all' ? '' : filters.status,
      sortBy
    };
    fetchHelpRequests(filterParams); // Refresh to update counts
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      dairy: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      grain: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
      fruit: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
      vegetable: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
      protein: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
      oil: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-700';
  };

  // Matching algorithm: calculate match score based on user preferences
  const calculateMatchScore = (request: any) => {
    let score = 0;
    
    // Location match (same district gets +30 points)
    if (currentUser?.location?.district === request.district) {
      score += 30;
    }
    
    // Category preference match (+20 points per matching preference)
    if (currentUser?.dietaryPreferences?.includes(request.category)) {
      score += 20;
    }
    
    // Urgency boost (critical: +25, high: +15, medium: +10, low: +5)
    const urgencyPoints = { critical: 25, high: 15, medium: 10, low: 5 };
    score += urgencyPoints[request.urgencyLevel as keyof typeof urgencyPoints] || 0;
    
    // Trust score bonus (+10 if trusted, -15 if suspicious)
    const trustScore = (request.trustedReports || 0) - (request.fraudReports || 0);
    if (trustScore >= 3) score += 10;
    if ((request.fraudReports || 0) >= 2) score -= 15;
    
    // Recency bonus (newer requests get slight preference)
    const daysOld = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 10 - daysOld);
    
    return Math.max(0, score);
  };

  const getMatchedRequests = () => {
    return helpRequests
      .map(req => ({ ...req, matchScore: calculateMatchScore(req) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Community</h2>
        <p className="text-muted-foreground">
          Help others in need or seek assistance from the community
        </p>
      </div>

      <Tabs defaultValue="donate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donate">Donate / Browse Requests</TabsTrigger>
          <TabsTrigger value="seek-help">Seek Help</TabsTrigger>
        </TabsList>

        {/* Donate Tab - Browse Help Requests */}
        <TabsContent value="donate" className="space-y-4">
          {/* View Controls & Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters & View
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="h-8 px-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className="h-8 px-2"
                    >
                      <MapIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Smart Matching Toggle */}
                  <Button
                    variant={showMatching ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMatching(!showMatching)}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {showMatching ? 'Show All' : 'Smart Match'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>District</Label>
                <Select value={filters.district} onValueChange={(value) => setFilters(prev => ({ ...prev, district: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All districts</SelectItem>
                    {DISTRICTS.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="urgent">Most Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Matching Banner */}
          {showMatching && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Smart Matching Active</p>
                    <p className="text-sm text-muted-foreground">
                      Showing top matches based on your location ({currentUser?.location?.district}), dietary preferences, and request urgency.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Requests - Different Views */}
          {(showMatching ? getMatchedRequests() : helpRequests).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No help requests found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Card View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showMatching ? getMatchedRequests() : helpRequests).map(request => {
                    const matchScore = showMatching ? request.matchScore : null;
                    const trustScore = (request.trustedReports || 0) - (request.fraudReports || 0);
                    const isTrusted = trustScore >= 3;
                    const isSuspicious = (request.fraudReports || 0) >= 2;
                
                    return (
                      <Card 
                        key={request.id} 
                        className={`flex flex-col transition-all ${
                          isTrusted ? 'border-green-500 dark:border-green-600 shadow-green-100 dark:shadow-green-900/20' : 
                          isSuspicious ? 'border-red-500 dark:border-red-600 shadow-red-100 dark:shadow-red-900/20' : 
                          'hover:shadow-lg'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg font-bold leading-tight">{request.title}</CardTitle>
                            <div className="flex flex-col gap-1 items-end">
                              {showMatching && matchScore !== null && matchScore > 0 && (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-bold">
                                  {matchScore}% Match
                                </Badge>
                              )}
                              <Badge className={getCategoryColor(request.category)}>
                                {request.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1 pt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{request.district}, {request.division}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-primary">{request.quantity} {request.unit}</span>
                              <span className="text-muted-foreground">needed</span>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 space-y-3 pt-0">
                          {request.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={request.status === 'open' ? 'default' : 'secondary'} className="font-medium">
                              {request.status === 'open' ? '🔓 Open' : request.status === 'fulfilled' ? '✓ Fulfilled' : '✕ Closed'}
                            </Badge>
                          </div>

                          {/* Trusted/Fraud Sign above date */}
                          {(isTrusted || isSuspicious) && (
                            <div className="flex items-center gap-2">
                              {isTrusted && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 w-full justify-center">
                                  <ThumbsUp className="h-3 w-3 mr-1" /> Trusted Request
                                </Badge>
                              )}
                              {isSuspicious && (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 w-full justify-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" /> Potential Fraud
                                </Badge>
                              )}
                            </div>
                          )}

                          {request.neededBy && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800">
                              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                Needed by: {new Date(request.neededBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between gap-2 text-sm pt-2 border-t mt-2">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Heart className="h-4 w-4 fill-current" />
                              <span className="font-medium">{request.donations?.length || 0} Donations</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="font-medium">{request.trustedReports || 0} Trusted</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">{request.fraudReports || 0} Reports</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-2" 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View Details & Donate
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {(showMatching ? getMatchedRequests() : helpRequests).map(request => {
                    const matchScore = showMatching ? request.matchScore : null;
                    const trustScore = (request.trustedReports || 0) - (request.fraudReports || 0);
                    const isTrusted = trustScore >= 3;
                    const isSuspicious = (request.fraudReports || 0) >= 2;
                    
                    return (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Left: Main Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{request.title}</h3>
                                <Badge className={getCategoryColor(request.category)} variant="secondary">
                                  {request.category}
                                </Badge>
                                {showMatching && matchScore !== null && matchScore > 0 && (
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    <Zap className="h-3 w-3 mr-1" />
                                    {matchScore}% Match
                                  </Badge>
                                )}
                                {isTrusted && <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>}
                                {isSuspicious && <Badge className="bg-red-100 text-red-800">⚠ Flagged</Badge>}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {request.district}, {request.division}
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-primary">
                                  <Package className="h-4 w-4" />
                                  {request.quantity} {request.unit}
                                </div>
                                {request.neededBy && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(request.neededBy).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              
                              {request.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                              )}
                            </div>
                            
                            {/* Right: Actions */}
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              {request.status === 'open' && (
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={donationAmount[request.id] || ''}
                                    onChange={(e) => setDonationAmount(prev => ({ ...prev, [request.id]: e.target.value }))}
                                    className="flex-1 h-8 text-sm"
                                  />
                                  <Button onClick={() => handleDonate(request.id)} size="sm" className="h-8">
                                    <Heart className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => handleReport(request.id, false)}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Trust ({request.trustedReports || 0})
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => handleReport(request.id, true)}
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Report ({request.fraudReports || 0})
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Map View */}
              {viewMode === 'map' && (
                <Card className="h-[600px] relative overflow-hidden z-0">
                  <LeafletMap 
                    key={`community-map-${showMatching ? 'matching' : 'all'}`}
                    requests={showMatching ? getMatchedRequests() : helpRequests}
                    onSelectRequest={setSelectedRequest}
                    getCategoryColor={getCategoryColor}
                  />
                </Card>
              )}
            </>
          )}

          {/* Pagination */}
          {helpRequestsPagination && helpRequestsPagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchHelpRequests({ ...filters, sortBy, page: helpRequestsPagination.page - 1 })}
                disabled={helpRequestsPagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {helpRequestsPagination.page} of {helpRequestsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchHelpRequests({ ...filters, sortBy, page: helpRequestsPagination.page + 1 })}
                disabled={helpRequestsPagination.page === helpRequestsPagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Seek Help Tab - Create Help Request */}
        <TabsContent value="seek-help">
          <Card>
            <CardHeader>
              <CardTitle>Request Food Assistance</CardTitle>
              <CardDescription>
                Fill out this form to request food items from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitHelpRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => handleFormChange('itemName', e.target.value)}
                      placeholder="e.g., Rice, Lentils, Milk"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityNeeded">Quantity Needed *</Label>
                    <Input
                      id="quantityNeeded"
                      type="number"
                      step="0.01"
                      value={formData.quantityNeeded}
                      onChange={(e) => handleFormChange('quantityNeeded', e.target.value)}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleFormChange('unit', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select value={formData.urgencyLevel} onValueChange={(value) => handleFormChange('urgencyLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neededBy">Needed By</Label>
                    <Input
                      id="neededBy"
                      type="date"
                      value={formData.neededBy}
                      onChange={(e) => handleFormChange('neededBy', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select value={formData.district} onValueChange={(value) => handleFormChange('district', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map(district => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Select value={formData.division} onValueChange={(value) => handleFormChange('division', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISIONS.map(division => (
                          <SelectItem key={division} value={division}>{division}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Provide additional details about your need..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleFormChange('contactName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleFormChange('contactEmail', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleFormChange('contactPhone', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Help Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="text-xl font-bold">{selectedRequest.title}</DialogTitle>
                  <Badge className={getCategoryColor(selectedRequest.category)}>
                    {selectedRequest.category}
                  </Badge>
                </div>
                <DialogDescription>
                  Posted on {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Location & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{selectedRequest.district}, {selectedRequest.division}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{selectedRequest.quantity} {selectedRequest.unit}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>

                {/* Needed By */}
                {selectedRequest.neededBy && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      Needed by: {new Date(selectedRequest.neededBy).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 border rounded-md p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <a href={`mailto:${selectedRequest.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {selectedRequest.contactEmail}
                    </a>
                  </div>
                  {selectedRequest.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <a href={`tel:${selectedRequest.contactPhone}`} className="text-green-600 dark:text-green-400 hover:underline font-medium">
                        {selectedRequest.contactPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-foreground">{selectedRequest.contactName}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between gap-2 text-sm pt-2 border-t">
                  <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{selectedRequest.donations?.length || 0} Donations</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-semibold">{selectedRequest.trustedReports || 0} Trusted</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">{selectedRequest.fraudReports || 0} Reports</span>
                  </div>
                </div>

                {/* Donate Section */}
                {selectedRequest.status === 'open' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Make a Donation</Label>
                    <div className="flex gap-2 w-full">
                      <Input
                        type="number"
                        placeholder="Amount to donate"
                        value={donationAmount[selectedRequest.id] || ''}
                        onChange={(e) => setDonationAmount(prev => ({ ...prev, [selectedRequest.id]: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button onClick={() => handleDonate(selectedRequest.id)} className="bg-primary hover:bg-primary/90">
                        <Heart className="h-4 w-4 mr-2" />
                        Donate
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className={`flex-1 ${
                    (selectedRequest.trustedReports || 0) > 0 
                      ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900' 
                      : 'hover:border-green-500 hover:text-green-600'
                  }`}
                  onClick={() => handleReport(selectedRequest.id, false)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Mark as Trusted
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex-1 ${
                    (selectedRequest.fraudReports || 0) > 0 
                      ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900' 
                      : 'hover:border-red-500 hover:text-red-600'
                  }`}
                  onClick={() => handleReport(selectedRequest.id, true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Fraud
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

