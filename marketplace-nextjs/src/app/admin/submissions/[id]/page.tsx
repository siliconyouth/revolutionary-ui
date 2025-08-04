'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Code2,
  FileText,
  Image,
  Play,
  AlertCircle,
  MessageSquare,
  Save,
  Send
} from 'lucide-react';
import CodeEditor from '@/components/preview/CodeEditor';
import ComponentPreview from '@/components/preview/ComponentPreview';
import Link from 'next/link';

interface SubmissionDetails {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  submitterName: string;
  submitterEmail: string;
  submitterGithub?: string;
  category: { id: string; name: string };
  resourceType: { id: string; name: string };
  frameworks: string[];
  sourceCode: string;
  documentation: string;
  demoUrl?: string;
  githubUrl?: string;
  npmPackage?: string;
  dependencies: Record<string, string>;
  hasTypescript: boolean;
  hasTests: boolean;
  hasDocumentation: boolean;
  isResponsive: boolean;
  isAccessible: boolean;
  supportsDarkMode: boolean;
  supportsRtl: boolean;
  license: string;
  copyrightOwner?: string;
  status: string;
  submissionDate: string;
  reviewNotes?: string;
  rejectionReason?: string;
  requiredChanges: string[];
  codeQualityScore?: number;
  documentationScore?: number;
  designScore?: number;
  previews: Array<{
    id: string;
    framework: string;
    exampleCode: string;
    previewType: string;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    attachmentType: string;
    fileUrl: string;
  }>;
  comments: Array<{
    id: string;
    user: { name: string };
    comment: string;
    commentType: string;
    createdAt: string;
    isInternal: boolean;
  }>;
}

interface ReviewChecklist {
  codeFollowsStandards: boolean;
  codeIsClean: boolean;
  codeHasComments: boolean;
  noConsoleLogs: boolean;
  noSecurityIssues: boolean;
  readmeExists: boolean;
  apiDocumented: boolean;
  examplesProvided: boolean;
  propsDocumented: boolean;
  testsExist: boolean;
  testsPass: boolean;
  coverageAdequate: boolean;
  responsiveDesign: boolean;
  accessibleMarkup: boolean;
  consistentStyling: boolean;
  licenseAppropriate: boolean;
  noCopyrightIssues: boolean;
  dependenciesLicensed: boolean;
}

export default function SubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params?.id as string;
  
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [checklist, setChecklist] = useState<Partial<ReviewChecklist>>({});
  const [scores, setScores] = useState({
    codeQuality: 80,
    documentation: 70,
    design: 85
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requiredChanges, setRequiredChanges] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/submissions/${submissionId}`);
      const data = await response.json();
      setSubmission(data);
      
      // Load existing review data
      if (data.reviewNotes) setReviewNotes(data.reviewNotes);
      if (data.rejectionReason) setRejectionReason(data.rejectionReason);
      if (data.requiredChanges) setRequiredChanges(data.requiredChanges);
      if (data.codeQualityScore) setScores(prev => ({ ...prev, codeQuality: data.codeQualityScore }));
      if (data.documentationScore) setScores(prev => ({ ...prev, documentation: data.documentationScore }));
      if (data.designScore) setScores(prev => ({ ...prev, design: data.designScore }));
      
      // Load checklist if exists
      if (data.checklist) {
        setChecklist(data.checklist);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChecklistItem = (key: keyof ReviewChecklist, value: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const addRequiredChange = () => {
    const change = prompt('Enter required change:');
    if (change) {
      setRequiredChanges(prev => [...prev, change]);
    }
  };

  const removeRequiredChange = (index: number) => {
    setRequiredChanges(prev => prev.filter((_, i) => i !== index));
  };

  const saveReview = async () => {
    try {
      await fetch(`/api/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist,
          scores,
          reviewNotes,
          requiredChanges
        })
      });
      alert('Review saved successfully');
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review');
    }
  };

  const submitReviewDecision = async (decision: 'approve' | 'reject' | 'request-changes') => {
    if (decision === 'reject' && !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    if (decision === 'request-changes' && requiredChanges.length === 0) {
      alert('Please specify required changes');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await fetch(`/api/admin/submissions/${submissionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          checklist,
          scores,
          reviewNotes,
          rejectionReason: decision === 'reject' ? rejectionReason : undefined,
          requiredChanges: decision === 'request-changes' ? requiredChanges : undefined
        })
      });
      
      router.push('/admin/submissions');
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await fetch(`/api/admin/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          isInternal
        })
      });
      
      setNewComment('');
      fetchSubmission(); // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading || !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/submissions" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{submission.name}</h1>
            <p className="text-gray-600 mb-4">{submission.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Submitted by {submission.submitterName}</span>
              <span>{submission.submitterEmail}</span>
              {submission.submitterGithub && (
                <a href={`https://github.com/${submission.submitterGithub}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-gray-700">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  GitHub
                </a>
              )}
            </div>
          </div>
          
          <Badge className={`bg-${submission.status}-100 text-${submission.status}-800`}>
            {submission.status}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="code">Code Review</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="comments">Comments ({submission.comments.length})</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Component Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <div className="prose max-w-none">
                      {submission.longDescription || submission.description}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Technical Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium">{submission.category.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{submission.resourceType.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frameworks:</span>
                        <span className="ml-2 font-medium">{submission.frameworks.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">License:</span>
                        <span className="ml-2 font-medium">{submission.license}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {submission.hasTypescript && <Badge variant="outline">TypeScript</Badge>}
                      {submission.hasTests && <Badge variant="outline">Has Tests</Badge>}
                      {submission.hasDocumentation && <Badge variant="outline">Documented</Badge>}
                      {submission.isResponsive && <Badge variant="outline">Responsive</Badge>}
                      {submission.isAccessible && <Badge variant="outline">Accessible</Badge>}
                      {submission.supportsDarkMode && <Badge variant="outline">Dark Mode</Badge>}
                      {submission.supportsRtl && <Badge variant="outline">RTL Support</Badge>}
                    </div>
                  </div>
                  
                  {submission.dependencies && Object.keys(submission.dependencies).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Dependencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(submission.dependencies).map(([pkg, version]) => (
                          <Badge key={pkg} variant="secondary">
                            {pkg}@{version}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {submission.documentation && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Documentation</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: submission.documentation }} />
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                <div className="space-y-2">
                  {submission.githubUrl && (
                    <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      GitHub Repository
                    </a>
                  )}
                  {submission.npmPackage && (
                    <a href={`https://npmjs.com/package/${submission.npmPackage}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      NPM Package
                    </a>
                  )}
                  {submission.demoUrl && (
                    <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  )}
                </div>
              </Card>
              
              {submission.attachments.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                  <div className="space-y-2">
                    {submission.attachments.map(attachment => (
                      <a 
                        key={attachment.id}
                        href={attachment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        {attachment.attachmentType === 'screenshot' ? (
                          <Image className="w-4 h-4 mr-2" />
                        ) : attachment.attachmentType === 'demo_video' ? (
                          <Play className="w-4 h-4 mr-2" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Code Review Tab */}
        <TabsContent value="code">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Source Code</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <CodeEditor
              code={submission.sourceCode}
              language="typescript"
              height={600}
              readOnly
            />
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          {submission.previews.length > 0 ? (
            <div className="space-y-6">
              {submission.previews.map(preview => (
                <ComponentPreview
                  key={preview.id}
                  preview={{
                    ...preview,
                    previewType: preview.previewType as any,
                    exampleFramework: preview.framework,
                    isInteractive: true,
                    isResponsive: submission.isResponsive,
                    supportsThemes: submission.supportsDarkMode,
                    supportsRtl: submission.supportsRtl,
                    previewHeight: 400,
                    previewWidth: '100%',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }}
                  resourceName={submission.name}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No previews available</p>
            </Card>
          )}
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Review Checklist</h3>
            
            <div className="space-y-6">
              {/* Code Quality */}
              <div>
                <h4 className="font-medium mb-3">Code Quality</h4>
                <div className="space-y-2">
                  <ChecklistItem
                    label="Code follows standards"
                    checked={checklist.codeFollowsStandards || false}
                    onChange={(checked) => updateChecklistItem('codeFollowsStandards', checked)}
                  />
                  <ChecklistItem
                    label="Code is clean and readable"
                    checked={checklist.codeIsClean || false}
                    onChange={(checked) => updateChecklistItem('codeIsClean', checked)}
                  />
                  <ChecklistItem
                    label="Code has appropriate comments"
                    checked={checklist.codeHasComments || false}
                    onChange={(checked) => updateChecklistItem('codeHasComments', checked)}
                  />
                  <ChecklistItem
                    label="No console.log statements"
                    checked={checklist.noConsoleLogs || false}
                    onChange={(checked) => updateChecklistItem('noConsoleLogs', checked)}
                  />
                  <ChecklistItem
                    label="No security issues"
                    checked={checklist.noSecurityIssues || false}
                    onChange={(checked) => updateChecklistItem('noSecurityIssues', checked)}
                  />
                </div>
              </div>
              
              {/* Documentation */}
              <div>
                <h4 className="font-medium mb-3">Documentation</h4>
                <div className="space-y-2">
                  <ChecklistItem
                    label="README exists"
                    checked={checklist.readmeExists || false}
                    onChange={(checked) => updateChecklistItem('readmeExists', checked)}
                  />
                  <ChecklistItem
                    label="API is documented"
                    checked={checklist.apiDocumented || false}
                    onChange={(checked) => updateChecklistItem('apiDocumented', checked)}
                  />
                  <ChecklistItem
                    label="Examples provided"
                    checked={checklist.examplesProvided || false}
                    onChange={(checked) => updateChecklistItem('examplesProvided', checked)}
                  />
                  <ChecklistItem
                    label="Props are documented"
                    checked={checklist.propsDocumented || false}
                    onChange={(checked) => updateChecklistItem('propsDocumented', checked)}
                  />
                </div>
              </div>
              
              {/* Testing */}
              <div>
                <h4 className="font-medium mb-3">Testing</h4>
                <div className="space-y-2">
                  <ChecklistItem
                    label="Tests exist"
                    checked={checklist.testsExist || false}
                    onChange={(checked) => updateChecklistItem('testsExist', checked)}
                  />
                  <ChecklistItem
                    label="Tests pass"
                    checked={checklist.testsPass || false}
                    onChange={(checked) => updateChecklistItem('testsPass', checked)}
                  />
                  <ChecklistItem
                    label="Coverage is adequate"
                    checked={checklist.coverageAdequate || false}
                    onChange={(checked) => updateChecklistItem('coverageAdequate', checked)}
                  />
                </div>
              </div>
              
              {/* Design */}
              <div>
                <h4 className="font-medium mb-3">Design</h4>
                <div className="space-y-2">
                  <ChecklistItem
                    label="Responsive design"
                    checked={checklist.responsiveDesign || false}
                    onChange={(checked) => updateChecklistItem('responsiveDesign', checked)}
                  />
                  <ChecklistItem
                    label="Accessible markup"
                    checked={checklist.accessibleMarkup || false}
                    onChange={(checked) => updateChecklistItem('accessibleMarkup', checked)}
                  />
                  <ChecklistItem
                    label="Consistent styling"
                    checked={checklist.consistentStyling || false}
                    onChange={(checked) => updateChecklistItem('consistentStyling', checked)}
                  />
                </div>
              </div>
              
              {/* Legal */}
              <div>
                <h4 className="font-medium mb-3">Legal</h4>
                <div className="space-y-2">
                  <ChecklistItem
                    label="License is appropriate"
                    checked={checklist.licenseAppropriate || false}
                    onChange={(checked) => updateChecklistItem('licenseAppropriate', checked)}
                  />
                  <ChecklistItem
                    label="No copyright issues"
                    checked={checklist.noCopyrightIssues || false}
                    onChange={(checked) => updateChecklistItem('noCopyrightIssues', checked)}
                  />
                  <ChecklistItem
                    label="Dependencies are properly licensed"
                    checked={checklist.dependenciesLicensed || false}
                    onChange={(checked) => updateChecklistItem('dependenciesLicensed', checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Scores */}
            <div className="mt-8 space-y-4">
              <h4 className="font-medium mb-3">Quality Scores</h4>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Code Quality</Label>
                  <span className="text-sm font-medium">{scores.codeQuality}%</span>
                </div>
                <Slider
                  value={[scores.codeQuality]}
                  onValueChange={([value]) => setScores(prev => ({ ...prev, codeQuality: value }))}
                  max={100}
                  step={5}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Documentation</Label>
                  <span className="text-sm font-medium">{scores.documentation}%</span>
                </div>
                <Slider
                  value={[scores.documentation]}
                  onValueChange={([value]) => setScores(prev => ({ ...prev, documentation: value }))}
                  max={100}
                  step={5}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Design</Label>
                  <span className="text-sm font-medium">{scores.design}%</span>
                </div>
                <Slider
                  value={[scores.design]}
                  onValueChange={([value]) => setScores(prev => ({ ...prev, design: value }))}
                  max={100}
                  step={5}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={saveReview}>
                <Save className="w-4 h-4 mr-2" />
                Save Review Progress
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Comments & Discussion</h3>
            
            <div className="space-y-4 mb-6">
              {submission.comments.map(comment => (
                <div key={comment.id} className={`p-4 rounded-lg ${comment.isInternal ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.commentType}
                      </Badge>
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <Label htmlFor="comment">Add Comment</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={3}
                className="mt-2"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <Checkbox
                    id="internal"
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                  />
                  <Label htmlFor="internal" className="ml-2">Internal comment (not visible to submitter)</Label>
                </div>
                <Button onClick={addComment}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Decision Tab */}
        <TabsContent value="decision">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Review Decision</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="General notes about the submission..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Required Changes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequiredChange}
                  >
                    Add Change
                  </Button>
                </div>
                <div className="space-y-2">
                  {requiredChanges.map((change, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm bg-gray-50 p-2 rounded">{change}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequiredChange(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the submission is being rejected..."
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you have completed the checklist and added any necessary comments before making a decision.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => submitReviewDecision('request-changes')}
                  disabled={isSubmitting}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => submitReviewDecision('reject')}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                
                <Button
                  onClick={() => submitReviewDecision('approve')}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Checklist Item Component
function ChecklistItem({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={label} className="ml-2 font-normal">
        {label}
      </Label>
    </div>
  );
}