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

const CATEGORIES = ['dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil'];
const UNITS = ['kg', 'gm', 'ltr', 'pcs'];
const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 
  'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj'
];
const DIVISIONS = ['Dhaka', 'Chittagang', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];

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
                        {isTrusted && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300">
                            ✓ Verified
                          </Badge>
                        )}
                        {isSuspicious && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300">
                            ⚠ Flagged
                          </Badge>
                        )}
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

                    {request.neededBy && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800">
                        <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          Needed by: {new Date(request.neededBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t space-y-2 bg-slate-50 dark:bg-slate-900/30 -mx-6 px-6 py-3 mt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <a href={`mailto:${request.contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          {request.contactEmail}
                        </a>
                      </div>
                      {request.contactPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <a href={`tel:${request.contactPhone}`} className="text-green-600 dark:text-green-400 hover:underline font-medium">
                            {request.contactPhone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-foreground">{request.contactName}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between gap-2 text-sm pt-2 border-t">
                      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{request.donations?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-semibold">{request.trustedReports || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-semibold">{request.fraudReports || 0}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-2 bg-slate-50 dark:bg-slate-900/20">
                    {request.status === 'open' && (
                      <div className="flex gap-2 w-full">
                        <Input
                          type="number"
                          placeholder="Amount to donate"
                          value={donationAmount[request.id] || ''}
                          onChange={(e) => setDonationAmount(prev => ({ ...prev, [request.id]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button onClick={() => handleDonate(request.id)} size="sm" className="bg-primary hover:bg-primary/90">
                          <Heart className="h-3 w-3 mr-1" />
                          Donate
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex-1 ${
                          (request.trustedReports || 0) > 0 
                            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900' 
                            : 'hover:border-green-500 hover:text-green-600'
                        }`}
                        onClick={() => handleReport(request.id, false)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Trusted
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex-1 ${
                          (request.fraudReports || 0) > 0 
                            ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900' 
                            : 'hover:border-red-500 hover:text-red-600'
                        }`}
                        onClick={() => handleReport(request.id, true)}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Report Fraud
                      </Button>
                    </div>
                  </CardFooter>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Map Placeholder */}
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="grid grid-cols-8 h-full">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div key={i} className="border border-slate-300 dark:border-slate-600"></div>
                            ))}
                          </div>
                        </div>
                        <div className="relative z-10 text-center space-y-3">
                          <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                          <div>
                            <p className="font-semibold text-lg">Interactive Map View</p>
                            <p className="text-sm text-muted-foreground">Map visualization showing help requests by location</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Note: Full map integration requires Google Maps or Mapbox API
                            </p>
                          </div>
                        </div>
                        
                        {/* Location Pins Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          {(showMatching ? getMatchedRequests() : helpRequests).slice(0, 8).map((req, idx) => (
                            <div 
                              key={req.id}
                              className="absolute"
                              style={{
                                left: `${15 + (idx % 4) * 20}%`,
                                top: `${20 + Math.floor(idx / 4) * 40}%`
                              }}
                            >
                              <div className="relative pointer-events-auto cursor-pointer group">
                                <Navigation className="h-6 w-6 text-red-500 drop-shadow-lg transform -rotate-45" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 text-xs whitespace-nowrap border">
                                    <p className="font-bold">{req.title}</p>
                                    <p className="text-muted-foreground">{req.district}</p>
                                    <p className="text-primary font-semibold">{req.quantity} {req.unit}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Map Legend */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(showMatching ? getMatchedRequests() : helpRequests).slice(0, 8).map(request => (
                          <Card key={request.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-3 space-y-1">
                              <p className="font-bold text-sm truncate">{request.title}</p>
                              <p className="text-xs text-muted-foreground">{request.district}</p>
                              <div className="flex items-center justify-between">
                                <Badge className={getCategoryColor(request.category)} className="text-xs">
                                  {request.category}
                                </Badge>
                                <span className="text-xs font-semibold">{request.quantity} {request.unit}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Pagination */}
          {helpRequestsPagination && helpRequestsPagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchHelpRequests({ ...filters, sortBy, page: helpRequestsPagination.currentPage - 1 })}
                disabled={helpRequestsPagination.currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {helpRequestsPagination.currentPage} of {helpRequestsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchHelpRequests({ ...filters, sortBy, page: helpRequestsPagination.currentPage + 1 })}
                disabled={helpRequestsPagination.currentPage === helpRequestsPagination.totalPages}
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
    </div>
  );
};

