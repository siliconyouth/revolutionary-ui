/**
 * Smart Project Analyzer
 * This now uses the database-backed analyzer for all framework/library detection
 */

export { 
  SmartProjectAnalyzerDB as SmartProjectAnalyzer,
  type SmartProjectAnalysis,
  type SubProject 
} from './smart-project-analyzer-db'