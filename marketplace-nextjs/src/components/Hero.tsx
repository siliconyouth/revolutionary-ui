import { motion } from 'framer-motion'

interface HeroProps {
  stats: {
    totalComponents: number
    totalCategories: number
    totalFrameworks: number
    avgReduction: number
  }
}

export default function Hero({ stats }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-primary-600 to-purple-600 text-white">
      <div className="container-custom py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Component Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto">
            Browse {stats.totalComponents}+ UI components with {stats.avgReduction}% average code reduction.
            Generate ANY component for ANY framework.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stats.totalComponents}+
              </div>
              <div className="text-primary-100">Components</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stats.totalFrameworks}+
              </div>
              <div className="text-primary-100">Frameworks</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stats.avgReduction}%
              </div>
              <div className="text-primary-100">Avg. Reduction</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stats.totalCategories}
              </div>
              <div className="text-primary-100">Categories</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}