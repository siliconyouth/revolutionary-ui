'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, AlertTriangle, CheckCircle } from 'lucide-react';

// Mock analysis result structure
interface AnalysisReport {
  frameworks: string[];
  uiLibraries: string[];
  styling: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

export default function AnalyzerClientPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setReport(null);

    try {
      const response = await fetch('/api/analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }
      
      // The API returns a complex object, we need to map it to the report structure
      // For now, we'll just display the recommendations from the AI part of the response
      setReport({
        frameworks: data.report.frameworks.map((f: any) => f.name),
        uiLibraries: data.report.uiLibraries.map((l: any) => l.name),
        styling: [
            data.analysis.hasTailwind ? 'Tailwind CSS' : '',
            ...data.report.styling
        ].filter(Boolean),
        recommendations: data.aiResults.recommendations.map((r: any) => ({
            title: r.recommendation,
            description: r.reasoning,
            priority: r.priority.charAt(0).toUpperCase() + r.priority.slice(1),
        }))
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'border-l-4 border-red-500';
      case 'Medium':
        return 'border-l-4 border-yellow-500';
      case 'Low':
        return 'border-l-4 border-blue-500';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Project Analyzer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Get AI-powered recommendations to improve your project structure and dependencies.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Analyze Your Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              placeholder="https://github.com/your-username/your-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Project'
              )}
            </Button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {error}
            </p>
            )}
        </CardContent>
      </Card>

      {report && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">Analysis Report</h2>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="mr-2" /> Detected Technologies
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Frameworks:</strong> {report.frameworks.join(', ')}</p>
                        <p><strong>UI Libraries:</strong> {report.uiLibraries.join(', ')}</p>
                        <p><strong>Styling:</strong> {report.styling.join(', ')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="mr-2" /> Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {report.recommendations.map((rec, index) => (
                        <div key={index} className={`p-3 rounded-md bg-card ${getPriorityClass(rec.priority)}`}>
                            <h4 className="font-semibold">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
