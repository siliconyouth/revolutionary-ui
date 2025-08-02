# Revolutionary UI Factory - Marketplace & Development Hub

The official website for Revolutionary UI Factory, built with Next.js and deployed on Vercel at https://revolutionary-ui.com. This platform is not just a component marketplace, but a full-featured development hub with interactive tools.

## 🚀 Features

- **Component Browser**: Browse 150+ UI components with live search and filtering.
- **Interactive Playground**: Visually build components, edit their configurations in real-time, and generate production-ready code for multiple frameworks.
- **AI Playground**: Generate components from natural language prompts using advanced AI.
- **Project Analyzer**: Analyze public GitHub repositories to get AI-powered recommendations for improvement.
- **User Dashboard**: Manage your account, team, analytics, and premium features.
- **Framework Support**: Examples for React, Vue, Angular, Svelte, and more.
- **Code Examples**: Copy-paste ready code for every component.
- **Responsive Design**: Works perfectly on all devices.
- **SEO Optimized**: Server-side rendering for better search visibility.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI**: Shadcn/UI
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics & In-app Analytics Dashboard

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Configure Environment Variables
4. Deploy with default settings

### Custom Domain Setup

1. Add domain in Vercel dashboard
2. Update DNS records:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
3. Enable HTTPS in Vercel

## 📁 Project Structure

```
marketplace-nextjs/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── components/      # React components (UI, pages, etc.)
│   ├── data/            # Component registry & static data
│   ├── lib/             # Core logic, Supabase client, analyzer code
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── next.config.js       # Next.js config
├── tailwind.config.ts   # Tailwind config
└── vercel.json          # Vercel config
```

## 🔧 Environment Variables

Create a `.env.local` file from `.env.sample` and fill in the required keys for Supabase, Stripe, and any AI providers.

## 📝 Adding New Components

1. Edit `src/config/factory-resources.ts`
2. Add component definition to the `componentRegistry` array with:
   - Metadata (name, description, reduction %)
   - Default configuration object
   - Traditional line counts for metrics
3. The component will automatically appear in the marketplace and playground.

## 🔗 Links

- **Production**: https://revolutionary-ui.com
- **GitHub**: https://github.com/siliconyouth/revolutionary-ui-factory-system
- **npm Package**: https://www.npmjs.com/package/@vladimirdukelic/revolutionary-ui-factory

## 📄 License

MIT License - Copyright (c) 2024 Vladimir Dukelic
