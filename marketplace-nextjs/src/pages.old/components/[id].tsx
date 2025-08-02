import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'prism-react-renderer'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { components, getComponentById, frameworks } from '@/data/components'

interface ComponentPageProps {
  component: typeof components[0]
}

export default function ComponentPage({ component }: ComponentPageProps) {
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const code = component.codeExamples[selectedFramework] || component.codeExamples.react || ''
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <Head>
        <title>{component.name} - Revolutionary UI Factory</title>
        <meta name="description" content={component.description} />
      </Head>

      <div className="bg-gray-50 py-12">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Components
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href={`/categories/${component.category}`} className="text-gray-600 hover:text-gray-900 capitalize">
                  {component.category.replace('-', ' ')}
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{component.name}</li>
            </ol>
          </nav>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{component.icon}</span>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {component.name}
                </h1>
                <p className="text-xl text-gray-600">
                  {component.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {component.reduction}%
                </div>
                <div className="text-sm text-gray-600">Code Reduction</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {component.traditionalLines}
                </div>
                <div className="text-sm text-gray-600">Traditional Lines</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {component.factoryLines}
                </div>
                <div className="text-sm text-gray-600">Factory Lines</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {component.frameworks.length}
                </div>
                <div className="text-sm text-gray-600">Frameworks</div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Code Example */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Example</h2>
                
                {/* Framework Tabs */}
                <div className="flex space-x-1 mb-4 border-b">
                  {component.frameworks.map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setSelectedFramework(fw)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        selectedFramework === fw
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {frameworks.find(f => f.id === fw)?.name || fw}
                    </button>
                  ))}
                </div>

                {/* Code Block */}
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code>
                      {component.codeExamples[selectedFramework] || 
                       component.codeExamples.react || 
                       '// Code example coming soon'}
                    </code>
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 btn btn-sm bg-gray-700 text-white hover:bg-gray-600"
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </motion.div>

              {/* Usage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1. Install the package</h3>
                    <pre className="bg-gray-100 rounded p-3 text-sm">
                      <code>npm install @vladimirdukelic/revolutionary-ui-factory</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. Import and setup</h3>
                    <pre className="bg-gray-100 rounded p-3 text-sm">
                      <code>{`import { setup } from '@vladimirdukelic/revolutionary-ui-factory';
const ui = setup();`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3. Create your component</h3>
                    <p className="text-gray-600">
                      Use the code example above to create your {component.name} component with {component.reduction}% less code!
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6 mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                <ul className="space-y-2">
                  {component.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Frameworks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Supported Frameworks</h2>
                <div className="space-y-2">
                  {component.frameworks.map((fw) => {
                    const framework = frameworks.find(f => f.id === fw)
                    return (
                      <div key={fw} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">
                          {framework?.name || fw}
                        </span>
                        <span className="text-green-500">✓</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = components.map((component) => ({
    params: { id: component.id }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const component = getComponentById(params?.id as string)

  if (!component) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      component
    }
  }
}