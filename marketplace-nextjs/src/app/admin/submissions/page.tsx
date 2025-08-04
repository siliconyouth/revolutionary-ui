'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Code2,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Submission {
  id: string;
  name: string;
  description: string;
  submitterName: string;
  submitterEmail: string;
  category: { name: string };
  frameworks: string[];
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'published';
  submissionDate: string;
  hasTypescript: boolean;
  hasTests: boolean;
  codeQualityScore?: number;
  documentationScore?: number;
  designScore?: number;
}

const STATUS_COLORS = {
  draft: 'gray',
  submitted: 'blue',
  in_review: 'yellow',
  approved: 'green',
  rejected: 'red',
  published: 'purple'
};

const STATUS_ICONS = {
  draft: Clock,
  submitted: AlertCircle,
  in_review: Eye,
  approved: CheckCircle,
  rejected: XCircle,
  published: CheckCircle
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    framework: 'all',
    hasTests: false,
    hasTypescript: false
  });

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.framework !== 'all') params.append('framework', filters.framework);
      if (filters.hasTests) params.append('hasTests', 'true');
      if (filters.hasTypescript) params.append('hasTypescript', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/submissions?${params}`);
      const data = await response.json();
      
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionCounts = () => {
    const counts = {
      all: submissions.length,
      submitted: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
      published: 0
    };

    submissions.forEach(sub => {
      if (sub.status in counts) {
        counts[sub.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const counts = getSubmissionCounts();

  const filteredSubmissions = submissions.filter(sub => {
    if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Submission Review</h1>
        <p className="text-gray-600">
          Review and manage community component submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-2xl font-bold">{counts.all}</div>
          <div className="text-sm text-gray-600">Total Submissions</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{counts.submitted}</div>
          <div className="text-sm text-gray-600">Awaiting Review</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{counts.in_review}</div>
          <div className="text-sm text-gray-600">In Review</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{counts.published}</div>
          <div className="text-sm text-gray-600">Published</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filters.framework}
            onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
          >
            <option value="all">All Frameworks</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
            <option value="svelte">Svelte</option>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={filters.hasTypescript ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, hasTypescript: !prev.hasTypescript }))}
            >
              TypeScript
            </Button>
            <Button
              variant={filters.hasTests ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, hasTests: !prev.hasTests }))}
            >
              Has Tests
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="submitted">
            Awaiting Review ({counts.submitted})
          </TabsTrigger>
          <TabsTrigger value="in_review">
            In Review ({counts.in_review})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({counts.rejected})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({counts.published})
          </TabsTrigger>
        </TabsList>
        {/* Submissions List */}
        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No submissions found</p>
            </Card>
          ) : (
            filteredSubmissions.map(submission => {
              const StatusIcon = STATUS_ICONS[submission.status];
              const statusColor = STATUS_COLORS[submission.status];
              
              return (
                <Card key={submission.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{submission.name}</h3>
                        <Badge className={`bg-${statusColor}-100 text-${statusColor}-800`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {submission.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{submission.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {submission.submitterName}</span>
                        <span>{submission.category.name}</span>
                        <span>{submission.frameworks.join(', ')}</span>
                        {submission.submissionDate && (
                          <span>Submitted {format(new Date(submission.submissionDate), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {submission.hasTypescript && (
                          <Badge variant="outline" className="text-xs">TypeScript</Badge>
                        )}
                        {submission.hasTests && (
                          <Badge variant="outline" className="text-xs">Tests</Badge>
                        )}
                      </div>
                      
                      {(submission.codeQualityScore || submission.documentationScore || submission.designScore) && (
                        <div className="flex items-center gap-4 mt-3">
                          {submission.codeQualityScore && (
                            <div className="text-sm">
                              <span className="text-gray-500">Code:</span>
                              <span className="ml-1 font-medium">{submission.codeQualityScore}%</span>
                            </div>
                          )}
                          {submission.documentationScore && (
                            <div className="text-sm">
                              <span className="text-gray-500">Docs:</span>
                              <span className="ml-1 font-medium">{submission.documentationScore}%</span>
                            </div>
                          )}
                          {submission.designScore && (
                            <div className="text-sm">
                              <span className="text-gray-500">Design:</span>
                              <span className="ml-1 font-medium">{submission.designScore}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/admin/submissions/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}