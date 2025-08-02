import Link from 'next/link'
import { Component } from '@/data/components'

interface ComponentCardProps {
  component: Component
}

export default function ComponentCard({ component }: ComponentCardProps) {
  const reductionClass = 
    component.reduction >= 90 ? 'badge-success' :
    component.reduction >= 80 ? 'badge-warning' :
    'badge-primary'

  return (
    <Link href={`/components/${component.id}`} className="block h-full">
      <article className="card h-full flex flex-col hover:translate-y-[-2px] transition-transform duration-200">
        {/* Preview */}
        <div className="h-48 bg-gray-100 flex items-center justify-center relative">
          <span className="text-6xl">{component.icon}</span>
          <div className="absolute top-3 right-3">
            <span className={`badge ${reductionClass}`}>
              {component.reduction}% reduction
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {component.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 flex-1">
            {component.description}
          </p>

          {/* Meta */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📏</span>
              <span>{component.traditionalLines} → {component.factoryLines} lines</span>
            </div>

            {/* Frameworks */}
            <div className="flex flex-wrap gap-1">
              {component.frameworks.slice(0, 4).map((fw) => (
                <span key={fw} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {fw}
                </span>
              ))}
              {component.frameworks.length > 4 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  +{component.frameworks.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <span className="btn btn-sm btn-outline flex-1 text-center">
            View Details
          </span>
          <button
            onClick={(e) => {
              e.preventDefault()
              // Copy code logic would go here
              alert('Code copied!')
            }}
            className="btn btn-sm btn-primary"
          >
            Copy Code
          </button>
        </div>
      </article>
    </Link>
  )
}