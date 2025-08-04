'use client';

import { useState, useMemo } from 'react';
import { setup } from 'revolutionary-ui';
import { components, categories, frameworks } from '@/data/components-v2';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Initialize the factory
const ui = setup({ framework: 'react' });

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);

  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const categoryMatch = selectedCategory === 'all' || c.category === selectedCategory;
      const frameworkMatch = selectedFrameworks.length === 0 || c.frameworks.some(fw => selectedFrameworks.includes(fw));
      const searchMatch = searchQuery === '' || 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && frameworkMatch && searchMatch;
    });
  }, [searchQuery, selectedCategory, selectedFrameworks]);

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId) 
        ? prev.filter(f => f !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  // --- Generate Components with the Factory ---
  const ComponentGrid = ui.createGrid({
    items: filteredComponents.map(c => ui.createCard({
      title: c.name,
      description: c.description,
      href: `/components/${c.id}`,
      icon: c.icon,
      tags: [`${c.reduction}% Less Code`],
      isGlassmorphism: true,
    })),
    columns: 3,
  });

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">Explore Components</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Browse our library of {components.length}+ production-ready components.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Search</h3>
            <Input 
              placeholder="Search components..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              <Button variant={selectedCategory === 'all' ? 'secondary' : 'ghost'} onClick={() => setSelectedCategory('all')} className="w-full justify-start">All</Button>
              {categories.map(cat => (
                <Button key={cat.id} variant={selectedCategory === cat.id ? 'secondary' : 'ghost'} onClick={() => setSelectedCategory(cat.id)} className="w-full justify-start">{cat.name}</Button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Frameworks</h3>
            <div className="space-y-2">
              {frameworks.map(fw => (
                <Button key={fw.id} variant={selectedFrameworks.includes(fw.id) ? 'secondary' : 'ghost'} onClick={() => toggleFramework(fw.id)} className="w-full justify-start">{fw.name}</Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {filteredComponents.length > 0 ? (
            <ComponentGrid />
          ) : (
            <div className="text-center py-20 bg-card rounded-lg border">
              <h3 className="text-xl font-semibold">No Components Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
