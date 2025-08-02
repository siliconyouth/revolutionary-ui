import { motion } from 'framer-motion'
import ComponentCard from './ComponentCard'
import { Component } from '@/data/components'

interface ComponentGridProps {
  components: Component[]
}

export default function ComponentGrid({ components }: ComponentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {components.map((component, index) => (
        <motion.div
          key={component.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ComponentCard component={component} />
        </motion.div>
      ))}
    </div>
  )
}