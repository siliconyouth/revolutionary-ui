'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code2, 
  ArrowRight, 
  Copy, 
  Download, 
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import CodeEditor from '@/components/preview/CodeEditor';
import { FrameworkType } from '@/types/transpiler';

const FRAMEWORK_OPTIONS: Array<{ value: FrameworkType; label: string; icon: string }> = [
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'vue', label: 'Vue', icon: '🟢' },
  { value: 'angular', label: 'Angular', icon: '🔺' },
  { value: 'svelte', label: 'Svelte', icon: '🧡' },
  { value: 'solid', label: 'Solid', icon: '🔷' },
  { value: 'preact', label: 'Preact', icon: '⚡' },
  { value: 'lit', label: 'Lit', icon: '🔥' }
];

const SAMPLE_COMPONENTS = {
  react: {
    simple: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={increment}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
    complex: `import React, { useState, useEffect } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Load todos from localStorage
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const newTodos = [...todos, { id: Date.now(), text: input, done: false }];
      setTodos(newTodos);
      setInput('');
      localStorage.setItem('todos', JSON.stringify(newTodos));
    }
  };

  const toggleTodo = (id) => {
    const updated = todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    setTodos(updated);
    localStorage.setItem('todos', JSON.stringify(updated));
  };

  return (
    <div className="todo-list">
      <h1>Todo List</h1>
      <form onSubmit={addTodo}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;`
  },
  vue: {
    simple: `<template>
  <div class="counter">
    <h2>Count: {{ count }}</h2>
    <button @click="increment">
      Increment
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Counter',
  setup() {
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    return {
      count,
      increment
    };
  }
};
</script>`,
    complex: `<template>
  <div class="todo-list">
    <h1>Todo List</h1>
    <form @submit.prevent="addTodo">
      <input
        v-model="input"
        placeholder="Add a todo..."
      />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li 
        v-for="todo in todos" 
        :key="todo.id"
        @click="toggleTodo(todo.id)"
      >
        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.text }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'TodoList',
  setup() {
    const todos = ref([]);
    const input = ref('');

    onMounted(() => {
      const saved = localStorage.getItem('todos');
      if (saved) {
        todos.value = JSON.parse(saved);
      }
    });

    const addTodo = () => {
      if (input.value.trim()) {
        const newTodos = [...todos.value, { 
          id: Date.now(), 
          text: input.value, 
          done: false 
        }];
        todos.value = newTodos;
        input.value = '';
        localStorage.setItem('todos', JSON.stringify(newTodos));
      }
    };

    const toggleTodo = (id) => {
      todos.value = todos.value.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      );
      localStorage.setItem('todos', JSON.stringify(todos.value));
    };

    return {
      todos,
      input,
      addTodo,
      toggleTodo
    };
  }
};
</script>`
  }
};

export default function TranspilerPage() {
  const [sourceCode, setSourceCode] = useState(SAMPLE_COMPONENTS.react.simple);
  const [sourceFramework, setSourceFramework] = useState<FrameworkType>('react');
  const [targetFramework, setTargetFramework] = useState<FrameworkType>('vue');
  const [transpiledCode, setTranspiledCode] = useState('');
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'source' | 'result'>('source');

  const handleTranspile = async () => {
    if (sourceFramework === targetFramework) {
      setError('Source and target frameworks must be different');
      return;
    }

    setIsTranspiling(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetch('/api/transpiler/transpile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sourceCode,
          sourceFramework,
          targetFramework,
          options: {
            format: true,
            typescript: false,
            style: targetFramework === 'vue' ? 'composition' : undefined
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setTranspiledCode(result.code);
        setWarnings(result.warnings || []);
        setActiveTab('result');
      } else {
        setError(result.error || 'Transpilation failed');
      }
    } catch (err) {
      setError('Failed to transpile code. Please try again.');
    } finally {
      setIsTranspiling(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(transpiledCode);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([transpiledCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${getFileExtension(targetFramework)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (framework: FrameworkType): string => {
    const extensions: Record<FrameworkType, string> = {
      react: 'jsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      solid: 'jsx',
      preact: 'jsx',
      lit: 'ts'
    };
    return extensions[framework] || 'js';
  };

  const loadSampleCode = (complexity: 'simple' | 'complex') => {
    const samples = SAMPLE_COMPONENTS[sourceFramework];
    if (samples && samples[complexity]) {
      setSourceCode(samples[complexity]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Framework Transpiler</h1>
          <p className="text-xl text-gray-600">
            Convert UI components between React, Vue, Angular, Svelte, and more
          </p>
        </div>

        {/* Framework Selection */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium mb-2">Source Framework</label>
              <Select
                value={sourceFramework}
                onChange={(e) => setSourceFramework(e.target.value as FrameworkType)}
                className="w-full"
              >
                {FRAMEWORK_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Framework</label>
              <Select
                value={targetFramework}
                onChange={(e) => setTargetFramework(e.target.value as FrameworkType)}
                className="w-full"
              >
                {FRAMEWORK_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleTranspile}
              disabled={isTranspiling || sourceFramework === targetFramework}
              className="px-8"
            >
              {isTranspiling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transpiling...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transpile Code
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {warnings.length > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="text-yellow-800">
                <strong>Warnings:</strong>
                <ul className="list-disc list-inside mt-2">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Code Editor Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="source">
                <Code2 className="w-4 h-4 mr-2" />
                Source Code
                <Badge variant="outline" className="ml-2">
                  {sourceFramework}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="result" disabled={!transpiledCode}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Transpiled Code
                {transpiledCode && (
                  <Badge variant="outline" className="ml-2">
                    {targetFramework}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'source' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleCode('simple')}
                >
                  Load Simple Example
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleCode('complex')}
                >
                  Load Complex Example
                </Button>
              </div>
            )}

            {activeTab === 'result' && transpiledCode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCode}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="source">
            <Card className="p-0 overflow-hidden">
              <CodeEditor
                code={sourceCode}
                language={sourceFramework === 'angular' ? 'typescript' : 'javascript'}
                onChange={setSourceCode}
                height={500}
              />
            </Card>
          </TabsContent>

          <TabsContent value="result">
            <Card className="p-0 overflow-hidden">
              <CodeEditor
                code={transpiledCode}
                language={targetFramework === 'angular' ? 'typescript' : 'javascript'}
                height={500}
                readOnly
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🎯 Accurate Conversion</h3>
            <p className="text-sm text-gray-600">
              Intelligently converts component structure, state management, and lifecycle methods
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">⚡ Framework Features</h3>
            <p className="text-sm text-gray-600">
              Preserves framework-specific patterns like hooks, directives, and reactivity
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🔧 Clean Output</h3>
            <p className="text-sm text-gray-600">
              Generates idiomatic code that follows each framework's best practices
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}