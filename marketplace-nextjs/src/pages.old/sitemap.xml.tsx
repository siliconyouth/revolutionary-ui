import { GetServerSideProps } from 'next'
import { components, categories } from '@/data/components'

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://revolutionary-ui.com</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://revolutionary-ui.com/categories</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>https://revolutionary-ui.com/frameworks</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>https://revolutionary-ui.com/docs</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     ${components
       .map((component) => {
         return `
       <url>
           <loc>https://revolutionary-ui.com/components/${component.id}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.7</priority>
       </url>
     `
       })
       .join('')}
     ${categories
       .map((category) => {
         return `
       <url>
           <loc>https://revolutionary-ui.com/categories/${category.id}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.6</priority>
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap