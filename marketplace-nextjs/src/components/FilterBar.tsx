import { categories, frameworks } from '@/data/components'

interface FilterBarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedFramework: string
  onFrameworkChange: (framework: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  selectedFramework,
  onFrameworkChange,
  sortBy,
  onSortChange
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Category Filter */}
      <div className="flex-1">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Framework Filter */}
      <div className="flex-1">
        <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-1">
          Framework
        </label>
        <select
          id="framework"
          value={selectedFramework}
          onChange={(e) => onFrameworkChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Frameworks</option>
          {frameworks.map((framework) => (
            <option key={framework.id} value={framework.id}>
              {framework.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="flex-1">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="popular">Most Popular</option>
          <option value="reduction">Highest Reduction</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  )
}