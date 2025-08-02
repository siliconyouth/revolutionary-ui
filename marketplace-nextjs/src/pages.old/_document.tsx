import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0969da" />
        <meta name="description" content="Browse 150+ UI components with 60-95% code reduction. Revolutionary UI Factory - Generate ANY UI component for ANY framework." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Revolutionary UI Factory - Component Marketplace" />
        <meta property="og:description" content="Browse 150+ UI components with 60-95% code reduction. Generate ANY UI component for ANY framework." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://revolutionary-ui.com" />
        <meta property="og:image" content="https://revolutionary-ui.com/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Revolutionary UI Factory" />
        <meta name="twitter:description" content="Browse 150+ UI components with 60-95% code reduction." />
        <meta name="twitter:image" content="https://revolutionary-ui.com/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}