'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from 'lucide-react';
// Note: Using a simple chart library for demonstration. In a real app, you'd use something like Recharts or Chart.js
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Mock data structure
interface AnalyticsData {
  totalGenerations: number;
  avgCodeReduction: number;
  timeSavedHours: number;
  frameworkUsage: { name: string; value: number }[];
  topComponents: { name: string; value: number }[];
  generationsOverTime: { date: string; count: number }[];
}

const mockAnalyticsData: AnalyticsData = {
  totalGenerations: 1245,
  avgCodeReduction: 89,
  timeSavedHours: 150,
  frameworkUsage: [
    { name: 'React', value: 700 },
    { name: 'Vue', value: 300 },
    { name: 'Angular', value: 150 },
    { name: 'Svelte', value: 95 },
  ],
  topComponents: [
    { name: 'DataTable', value: 400 },
    { name: 'Form', value: 350 },
    { name: 'Dashboard', value: 200 },
    { name: 'Card', value: 150 },
  ],
  generationsOverTime: [
    { date: 'Jan', count: 100 },
    { date: 'Feb', count: 150 },
    { date: 'Mar', count: 250 },
    { date: 'Apr', count: 200 },
    { date: 'May', count: 300 },
    { date: 'Jun', count: 245 },
  ]
};

export default function AnalyticsClientPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data.');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error(error);
        // Handle error state in UI if necessary
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Loading analytics...</div>;
  }

  const frameworkChartData = {
    labels: data.frameworkUsage.map(f => f.name),
    datasets: [{
      label: 'Framework Usage',
      data: data.frameworkUsage.map(f => f.value),
      backgroundColor: ['#60A5FA', '#34D399', '#F87171', '#FBBF24'],
    }],
  };

  const componentChartData = {
    labels: data.topComponents.map(c => c.name),
    datasets: [{
      label: 'Top Components',
      data: data.topComponents.map(c => c.value),
      backgroundColor: '#A78BFA',
    }],
  };
  
  const timeSeriesChartData = {
      labels: data.generationsOverTime.map(d => d.date),
      datasets: [{
          label: 'Generations Over Time',
          data: data.generationsOverTime.map(d => d.count),
          fill: false,
          borderColor: '#818CF8',
          tension: 0.1
      }]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Total Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data.totalGenerations.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Avg. Code Reduction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data.avgCodeReduction}%</p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Development Time Saved</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">~{data.timeSavedHours} hours</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center"><LineChart className="mr-2" />Generations Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={timeSeriesChartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><PieChart className="mr-2" />Framework Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie data={frameworkChartData} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChart className="mr-2" />Top Generated Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={componentChartData} />
        </CardContent>
      </Card>
    </div>
  );
}
