import { notFound } from 'next/navigation'
import { components, getComponentById } from '@/data/components-v2'
import ComponentDetail from './ComponentDetail'

interface ComponentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const { id } = await params
  const component = getComponentById(id)
  
  if (!component) {
    notFound()
  }

  return <ComponentDetail component={component} />
}

// Generate static params for all components
export async function generateStaticParams() {
  return components.map((component) => ({
    id: component.id,
  }))
}

// Generate metadata for each component
export async function generateMetadata({ params }: ComponentPageProps) {
  const { id } = await params
  const component = getComponentById(id)
  
  if (!component) {
    return {
      title: 'Component Not Found',
    }
  }

  return {
    title: `${component.name} - Revolutionary UI Factory`,
    description: component.description,
  }
}