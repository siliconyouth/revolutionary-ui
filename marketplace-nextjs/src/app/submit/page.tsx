'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Upload, 
  Code2, 
  FileText, 
  Image, 
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  X,
  Save,
  Send
} from 'lucide-react';
import CodeEditor from '@/components/preview/CodeEditor';
import { useAuth } from '@/contexts/AuthContext';

interface SubmissionFormData {
  // Basic info
  name: string;
  description: string;
  longDescription: string;
  categoryId: string;
  resourceTypeId: string;
  frameworks: string[];
  
  // Code & Documentation
  sourceCode: string;
  documentation: string;
  demoUrl: string;
  githubUrl: string;
  npmPackage: string;
  
  // Technical details
  dependencies: Record<string, string>;
  hasTypescript: boolean;
  hasTests: boolean;
  hasDocumentation: boolean;
  isResponsive: boolean;
  isAccessible: boolean;
  supportsDarkMode: boolean;
  supportsRtl: boolean;
  
  // License
  license: string;
  copyrightOwner: string;
  acceptsTerms: boolean;
}

const FRAMEWORK_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'preact', label: 'Preact' },
  { value: 'lit', label: 'Lit' }
];

const LICENSE_OPTIONS = [
  { value: 'MIT', label: 'MIT License' },
  { value: 'Apache-2.0', label: 'Apache License 2.0' },
  { value: 'GPL-3.0', label: 'GPL v3' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
  { value: 'ISC', label: 'ISC License' },
  { value: 'Custom', label: 'Custom License' }
];

export default function SubmitComponentPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SubmissionFormData>({
    name: '',
    description: '',
    longDescription: '',
    categoryId: '',
    resourceTypeId: '',
    frameworks: [],
    sourceCode: '',
    documentation: '',
    demoUrl: '',
    githubUrl: '',
    npmPackage: '',
    dependencies: {},
    hasTypescript: false,
    hasTests: false,
    hasDocumentation: true,
    isResponsive: true,
    isAccessible: false,
    supportsDarkMode: false,
    supportsRtl: false,
    license: 'MIT',
    copyrightOwner: '',
    acceptsTerms: false
  });

  const [previews, setPreviews] = useState<Array<{
    framework: string;
    code: string;
    dependencies?: Record<string, string>;
  }>>([]);

  const [attachments, setAttachments] = useState<Array<{
    file: File;
    type: 'screenshot' | 'demo_video' | 'documentation';
    description: string;
  }>>([]);

  const updateField = (field: keyof SubmissionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addFramework = (framework: string) => {
    if (!formData.frameworks.includes(framework)) {
      updateField('frameworks', [...formData.frameworks, framework]);
    }
  };

  const removeFramework = (framework: string) => {
    updateField('frameworks', formData.frameworks.filter(f => f !== framework));
  };

  const addPreview = () => {
    setPreviews(prev => [...prev, {
      framework: 'react',
      code: '',
      dependencies: {}
    }]);
  };

  const updatePreview = (index: number, field: string, value: any) => {
    setPreviews(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files: FileList | null, type: 'screenshot' | 'demo_video' | 'documentation') => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (type === 'screenshot' && !file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, attachments: 'Only image files allowed for screenshots' }));
        return;
      }
      
      if (type === 'demo_video' && !file.type.startsWith('video/')) {
        setErrors(prev => ({ ...prev, attachments: 'Only video files allowed for demos' }));
        return;
      }
      
      setAttachments(prev => [...prev, {
        file,
        type,
        description: ''
      }]);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Component name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    if (formData.frameworks.length === 0) {
      newErrors.frameworks = 'Select at least one framework';
    }
    
    if (!formData.sourceCode.trim()) {
      newErrors.sourceCode = 'Source code is required';
    }
    
    if (!formData.acceptsTerms) {
      newErrors.acceptsTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: submissionId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: submissionId,
          status: 'draft',
          previews,
          attachments: attachments.map(a => ({
            type: a.type,
            description: a.description
          }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to save draft');
      
      const data = await response.json();
      setSubmissionId(data.id);
      
      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(data.id);
      }
      
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const submitComponent = async () => {
    if (!validateForm()) {
      // Focus on first tab with errors
      if (errors.name || errors.description || errors.categoryId || errors.frameworks) {
        setActiveTab('basic');
      } else if (errors.sourceCode) {
        setActiveTab('code');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: submissionId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: submissionId,
          status: 'submitted',
          submissionDate: new Date().toISOString(),
          previews,
          attachments: attachments.map(a => ({
            type: a.type,
            description: a.description
          }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit component');
      
      const data = await response.json();
      
      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(data.id);
      }
      
      // Redirect to success page
      router.push(`/submissions/${data.id}/success`);
    } catch (error) {
      console.error('Error submitting component:', error);
      alert('Failed to submit component. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadAttachments = async (submissionId: string) => {
    for (const attachment of attachments) {
      const formData = new FormData();
      formData.append('file', attachment.file);
      formData.append('type', attachment.type);
      formData.append('description', attachment.description);
      
      await fetch(`/api/submissions/${submissionId}/attachments`, {
        method: 'POST',
        body: formData
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to submit components to the catalog.
          </p>
          <Button onClick={() => router.push('/auth/signin?redirect=/submit')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Submit a Component</h1>
          <p className="text-gray-600">
            Share your component with the Revolutionary UI community. All submissions are reviewed 
            before publication to ensure quality and security.
          </p>
        </div>

        {/* Guidelines Alert */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please review our <a href="/guidelines" className="underline">submission guidelines</a> before 
            submitting your component. Components must be open-source and follow our quality standards.
          </AlertDescription>
        </Alert>

        {/* Form Tabs */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="code">Code & Docs</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="submit">Review & Submit</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div>
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Advanced Data Table"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of your component (max 200 characters)"
                  maxLength={200}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => updateField('longDescription', e.target.value)}
                  placeholder="Detailed description with features, use cases, etc."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => updateField('categoryId', e.target.value)}
                    className={errors.categoryId ? 'border-red-500' : ''}
                  >
                    <option value="">Select a category</option>
                    <option value="1">Data Display</option>
                    <option value="2">Data Entry</option>
                    <option value="3">Navigation</option>
                    <option value="4">Feedback</option>
                    <option value="5">Layout</option>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                </div>

                <div>
                  <Label htmlFor="resourceType">Type *</Label>
                  <Select
                    id="resourceType"
                    value={formData.resourceTypeId}
                    onChange={(e) => updateField('resourceTypeId', e.target.value)}
                  >
                    <option value="">Select a type</option>
                    <option value="1">Component</option>
                    <option value="2">Hook</option>
                    <option value="3">Utility</option>
                    <option value="4">Pattern</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Supported Frameworks *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FRAMEWORK_OPTIONS.map(fw => (
                    <Button
                      key={fw.value}
                      type="button"
                      variant={formData.frameworks.includes(fw.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        formData.frameworks.includes(fw.value) 
                          ? removeFramework(fw.value)
                          : addFramework(fw.value)
                      }
                    >
                      {fw.label}
                    </Button>
                  ))}
                </div>
                {errors.frameworks && <p className="text-sm text-red-500 mt-1">{errors.frameworks}</p>}
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="typescript"
                      checked={formData.hasTypescript}
                      onCheckedChange={(checked) => updateField('hasTypescript', checked)}
                    />
                    <Label htmlFor="typescript" className="ml-2">TypeScript support</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="tests"
                      checked={formData.hasTests}
                      onCheckedChange={(checked) => updateField('hasTests', checked)}
                    />
                    <Label htmlFor="tests" className="ml-2">Includes tests</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="responsive"
                      checked={formData.isResponsive}
                      onCheckedChange={(checked) => updateField('isResponsive', checked)}
                    />
                    <Label htmlFor="responsive" className="ml-2">Responsive design</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="accessible"
                      checked={formData.isAccessible}
                      onCheckedChange={(checked) => updateField('isAccessible', checked)}
                    />
                    <Label htmlFor="accessible" className="ml-2">Accessibility compliant</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="darkMode"
                      checked={formData.supportsDarkMode}
                      onCheckedChange={(checked) => updateField('supportsDarkMode', checked)}
                    />
                    <Label htmlFor="darkMode" className="ml-2">Dark mode support</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="rtl"
                      checked={formData.supportsRtl}
                      onCheckedChange={(checked) => updateField('supportsRtl', checked)}
                    />
                    <Label htmlFor="rtl" className="ml-2">RTL support</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Code & Documentation Tab */}
            <TabsContent value="code" className="space-y-6">
              <div>
                <Label>Source Code *</Label>
                <div className="mt-2">
                  <CodeEditor
                    code={formData.sourceCode}
                    language="typescript"
                    onChange={(code) => updateField('sourceCode', code)}
                    height={400}
                  />
                </div>
                {errors.sourceCode && <p className="text-sm text-red-500 mt-1">{errors.sourceCode}</p>}
              </div>

              <div>
                <Label>Documentation (Markdown)</Label>
                <Textarea
                  value={formData.documentation}
                  onChange={(e) => updateField('documentation', e.target.value)}
                  placeholder="## Installation&#10;&#10;## Usage&#10;&#10;## Props&#10;&#10;## Examples"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <Label htmlFor="npmPackage">NPM Package</Label>
                  <Input
                    id="npmPackage"
                    value={formData.npmPackage}
                    onChange={(e) => updateField('npmPackage', e.target.value)}
                    placeholder="@username/package-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input
                  id="demoUrl"
                  value={formData.demoUrl}
                  onChange={(e) => updateField('demoUrl', e.target.value)}
                  placeholder="https://example.com/demo"
                />
              </div>

              <div>
                <Label>Attachments</Label>
                <div className="space-y-4 mt-2">
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Screenshots</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('screenshot-upload')?.click()}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Add Screenshot
                      </Button>
                    </div>
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'screenshot')}
                    />
                    {attachments.filter(a => a.type === 'screenshot').map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 mt-2">
                        <span className="text-sm">{att.file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Demo Video</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('video-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'demo_video')}
                    />
                  </div>
                </div>
                {errors.attachments && <p className="text-sm text-red-500 mt-1">{errors.attachments}</p>}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Component Previews</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPreview}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Preview
                </Button>
              </div>

              {previews.map((preview, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Select
                      value={preview.framework}
                      onChange={(e) => updatePreview(index, 'framework', e.target.value)}
                    >
                      {FRAMEWORK_OPTIONS.map(fw => (
                        <option key={fw.value} value={fw.value}>{fw.label}</option>
                      ))}
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePreview(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CodeEditor
                    code={preview.code}
                    language="typescript"
                    onChange={(code) => updatePreview(index, 'code', code)}
                    height={300}
                  />
                </Card>
              ))}

              {previews.length === 0 && (
                <Card className="p-8 text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Add framework-specific preview examples to showcase your component
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Review & Submit Tab */}
            <TabsContent value="submit" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">License Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license">License *</Label>
                    <Select
                      id="license"
                      value={formData.license}
                      onChange={(e) => updateField('license', e.target.value)}
                    >
                      {LICENSE_OPTIONS.map(license => (
                        <option key={license.value} value={license.value}>
                          {license.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="copyrightOwner">Copyright Owner</Label>
                    <Input
                      id="copyrightOwner"
                      value={formData.copyrightOwner}
                      onChange={(e) => updateField('copyrightOwner', e.target.value)}
                      placeholder="Your name or organization"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Submission Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Component Name:</span>
                    <span className="font-medium">{formData.name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frameworks:</span>
                    <span className="font-medium">{formData.frameworks.join(', ') || 'None selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License:</span>
                    <span className="font-medium">{formData.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Features:</span>
                    <span className="font-medium">
                      {[
                        formData.hasTypescript && 'TypeScript',
                        formData.hasTests && 'Tests',
                        formData.isAccessible && 'Accessible',
                        formData.supportsDarkMode && 'Dark Mode'
                      ].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-start mb-6">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptsTerms}
                    onCheckedChange={(checked) => updateField('acceptsTerms', checked)}
                  />
                  <Label htmlFor="terms" className="ml-2 text-sm">
                    I confirm that I have the right to submit this component and agree to the{' '}
                    <a href="/terms" className="underline">terms and conditions</a> and{' '}
                    <a href="/guidelines" className="underline">submission guidelines</a>.
                  </Label>
                </div>
                {errors.acceptsTerms && <p className="text-sm text-red-500 mb-4">{errors.acceptsTerms}</p>}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={isSavingDraft || isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingDraft ? 'Saving...' : 'Save Draft'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={submitComponent}
                    disabled={isSubmitting || !formData.acceptsTerms}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}