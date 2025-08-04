-- Comprehensive Framework Expansion for UI Catalog
-- Based on Vercel's supported frameworks documentation

-- =====================================================
-- FRAMEWORK CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS framework_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO framework_categories (name, slug, description, sort_order) VALUES
('Full-Stack', 'full-stack', 'Frameworks that handle both frontend and backend', 1),
('Frontend', 'frontend', 'Client-side rendering and SPA frameworks', 2),
('Backend', 'backend', 'Server-side frameworks and APIs', 3),
('Static Site Generator', 'ssg', 'Build-time rendering frameworks', 4),
('Mobile', 'mobile', 'Mobile app development frameworks', 5),
('Documentation', 'documentation', 'Documentation-focused frameworks', 6),
('E-commerce', 'e-commerce', 'E-commerce specialized frameworks', 7),
('Experimental', 'experimental', 'Cutting-edge or experimental frameworks', 8);

-- =====================================================
-- ENHANCED FRAMEWORKS TABLE
-- =====================================================

ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES framework_categories(id);
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS language VARCHAR(50);
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS tagline VARCHAR(200);
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS deployment_platform VARCHAR(50)[];
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS is_meta_framework BOOLEAN DEFAULT false;
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS parent_framework_id UUID REFERENCES frameworks(id);
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0;
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS npm_downloads INTEGER DEFAULT 0;
ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS ecosystem VARCHAR(50); -- react, vue, angular, etc.

-- =====================================================
-- COMPREHENSIVE FRAMEWORK LIST
-- =====================================================

-- Clear existing frameworks for fresh import
TRUNCATE TABLE frameworks CASCADE;

-- Full-Stack Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem, is_meta_framework) VALUES
('Next.js', 'nextjs', 'nextjs', 'https://nextjs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'The React Framework for Production', 
    'Makes you productive with React instantly',
    'react', true),

('SvelteKit', 'sveltekit', 'svelte', 'https://kit.svelte.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript', 
    'Web app framework with server-side rendering, routing, and more', 
    'Framework for building web applications of all sizes',
    'svelte', true),

('Nuxt', 'nuxt', 'nuxt', 'https://nuxt.com', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript', 
    'The Intuitive Vue Framework', 
    'Web comprehensive framework for Vue.js',
    'vue', true),

('Remix', 'remix', 'remix', 'https://remix.run', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript', 
    'Full stack web framework that lets you focus on the user interface', 
    'Build Better Websites',
    'react', true),

('Analog', 'analog', 'angular', 'https://analogjs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'The fullstack Angular meta-framework', 
    'Angular meta-framework with Vite',
    'angular', true),

('SolidStart', 'solidstart', 'solid', 'https://start.solidjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'Fine-grained reactivity framework', 
    'The SolidJS meta-framework',
    'solid', true),

('Qwik City', 'qwik-city', 'qwik', 'https://qwik.builder.io/qwikcity', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'Resumable framework with O(1) hydration', 
    'Meta-framework for Qwik',
    'qwik', true);

-- Frontend Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES
('React', 'react', 'react', 'https://react.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'A JavaScript library for building user interfaces', 
    'Learn once, write anywhere',
    'react'),

('Vue', 'vue', 'vue', 'https://vuejs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'The Progressive JavaScript Framework', 
    'An approachable, performant and versatile framework',
    'vue'),

('Angular', 'angular', 'angular', 'https://angular.io', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'TypeScript', 
    'Platform for building mobile and desktop web applications', 
    'One framework. Mobile & desktop.',
    'angular'),

('Svelte', 'svelte', 'svelte', 'https://svelte.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Cybernetically enhanced web apps', 
    'Write less code',
    'svelte'),

('Solid', 'solid', 'solid', 'https://solidjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'Simple and performant reactivity for building user interfaces', 
    'Simple and performant',
    'solid'),

('Preact', 'preact', 'preact', 'https://preactjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Fast 3kB alternative to React with the same modern API', 
    'Fast 3kB React alternative',
    'react'),

('Ember.js', 'emberjs', 'ember', 'https://emberjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'A framework for ambitious web developers', 
    'A framework for ambitious web developers',
    'ember'),

('Dojo', 'dojo', 'dojo', 'https://dojo.io', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'TypeScript', 
    'Modern TypeScript framework for building web applications', 
    'A Progressive TypeScript Framework',
    'dojo'),

('Vite', 'vite', 'vite', 'https://vitejs.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Next Generation Frontend Tooling', 
    'Improves frontend development experience',
    'agnostic'),

('Create React App', 'create-react-app', 'react', 'https://create-react-app.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Set up a modern web app by running one command', 
    'Get going with React in no time',
    'react'),

('Lit', 'lit', 'lit', 'https://lit.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'Simple. Fast. Web Components.', 
    'Build fast, lightweight web components',
    'web-components'),

('Stencil', 'stencil', 'stencil', 'https://stenciljs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'TypeScript', 
    'A compiler for generating Web Components', 
    'Build. Customize. Distribute. Adopt.',
    'web-components'),

('Alpine.js', 'alpinejs', 'alpine', 'https://alpinejs.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Your new, lightweight, JavaScript framework', 
    'Think of it like jQuery for the modern web',
    'alpine'),

('Qwik', 'qwik', 'qwik', 'https://qwik.builder.io', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'Instant-loading web apps, without effort', 
    'The HTML-first framework',
    'qwik');

-- Static Site Generators
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES
('Astro', 'astro', 'astro', 'https://astro.build', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'Build faster websites with less client-side JavaScript', 
    'Static site builder for the modern web',
    'agnostic'),

('Gatsby', 'gatsby', 'gatsby', 'https://gatsbyjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'Build blazing fast, modern apps and websites with React', 
    'Helps developers build blazing fast websites',
    'react'),

('Eleventy', 'eleventy', '11ty', 'https://11ty.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'A simpler static site generator', 
    'Simpler static site generator',
    'agnostic'),

('Hugo', 'hugo', 'hugo', 'https://gohugo.io', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'Go', 
    'The world''s fastest framework for building websites', 
    'World''s fastest framework for building websites',
    'go'),

('Jekyll', 'jekyll', 'jekyll', 'https://jekyllrb.com', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'Ruby', 
    'Transform your plain text into static websites and blogs', 
    'Transforms plain text into static websites',
    'ruby'),

('VuePress', 'vuepress', 'vue', 'https://vuepress.vuejs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'Vue-powered Static Site Generator', 
    'Minimalistic docs generator',
    'vue'),

('Gridsome', 'gridsome', 'gridsome', 'https://gridsome.org', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'Build blazing fast websites for any CMS or data with Vue.js', 
    'JAMstack framework for Vue.js',
    'vue'),

('Hexo', 'hexo', 'hexo', 'https://hexo.io', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'A fast, simple & powerful blog framework', 
    'Fast, simple & powerful blog framework',
    'agnostic'),

('Zola', 'zola', 'zola', 'https://getzola.org', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'Rust', 
    'A fast static site generator in a single binary', 
    'Your one-stop static site engine',
    'rust'),

('Bridgetown', 'bridgetown', 'bridgetown', 'https://bridgetownrb.com', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'Ruby', 
    'A next-generation progressive site generator & fullstack framework', 
    'Progressive site generator',
    'ruby');

-- Backend Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES
('Nitro', 'nitro', 'nitro', 'https://nitro.unjs.io', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'JavaScript/TypeScript', 
    'Create web servers that run anywhere', 
    'Next generation server toolkit',
    'unjs'),

('Hono', 'hono', 'hono', 'https://hono.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'JavaScript/TypeScript', 
    'Fast, lightweight, built on Web Standards', 
    'Web framework built on Web Standards',
    'agnostic'),

('Express', 'express', 'express', 'https://expressjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'JavaScript', 
    'Fast, unopinionated, minimalist web framework for Node.js', 
    'Fast, unopinionated, minimalist',
    'node'),

('Fastify', 'fastify', 'fastify', 'https://fastify.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'JavaScript/TypeScript', 
    'Fast and low overhead web framework for Node.js', 
    'Fast and low overhead',
    'node'),

('Koa', 'koa', 'koa', 'https://koajs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'JavaScript', 
    'Next generation web framework for Node.js', 
    'Expressive middleware',
    'node'),

('NestJS', 'nestjs', 'nestjs', 'https://nestjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'backend'), 
    'TypeScript', 
    'A progressive Node.js framework', 
    'Enterprise-grade server-side applications',
    'node');

-- Documentation Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES
('Docusaurus', 'docusaurus', 'docusaurus', 'https://docusaurus.io', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript', 
    'Build optimized websites quickly, focus on your content', 
    'Easy to maintain open source documentation',
    'react'),

('Nextra', 'nextra', 'nextra', 'https://nextra.site', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript/TypeScript', 
    'Simple, powerful and flexible site generation framework', 
    'Make beautiful websites with Next.js & MDX',
    'react'),

('VitePress', 'vitepress', 'vue', 'https://vitepress.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript', 
    'Vite & Vue powered static site generator', 
    'Simple, powerful, and fast',
    'vue'),

('MkDocs', 'mkdocs', 'mkdocs', 'https://mkdocs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'Python', 
    'Project documentation with Markdown', 
    'Documentation that just works',
    'python');

-- Mobile Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES
('React Native', 'react-native', 'react', 'https://reactnative.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'JavaScript/TypeScript', 
    'Build mobile apps with React', 
    'Learn once, write anywhere',
    'react'),

('Ionic', 'ionic', 'ionic', 'https://ionicframework.com', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'JavaScript/TypeScript', 
    'One codebase. Any platform.', 
    'Build amazing apps across mobile, desktop, and web',
    'angular'),

('Capacitor', 'capacitor', 'capacitor', 'https://capacitorjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'JavaScript/TypeScript', 
    'Cross-platform native runtime for web apps', 
    'Build cross-platform apps',
    'agnostic'),

('Expo', 'expo', 'expo', 'https://expo.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'JavaScript/TypeScript', 
    'Build one project that runs natively on all your devices', 
    'Build universal native apps',
    'react');

-- Experimental Frameworks
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline) VALUES
('FastHTML', 'fasthtml', 'fasthtml', 'https://fastht.ml', 
    (SELECT id FROM framework_categories WHERE slug = 'experimental'), 
    'Python', 
    'Modern web framework for Python', 
    'The fastest way to create an HTML app',
    'python');

-- =====================================================
-- FRAMEWORK FEATURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS framework_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL UNIQUE REFERENCES frameworks(id) ON DELETE CASCADE,
    
    -- Rendering capabilities
    supports_ssr BOOLEAN DEFAULT false,
    supports_ssg BOOLEAN DEFAULT false,
    supports_isr BOOLEAN DEFAULT false,
    supports_spa BOOLEAN DEFAULT false,
    
    -- Development features
    hot_reload BOOLEAN DEFAULT true,
    typescript_support BOOLEAN DEFAULT false,
    jsx_support BOOLEAN DEFAULT false,
    
    -- Build features
    code_splitting BOOLEAN DEFAULT false,
    tree_shaking BOOLEAN DEFAULT false,
    lazy_loading BOOLEAN DEFAULT false,
    
    -- Deployment
    edge_runtime BOOLEAN DEFAULT false,
    serverless_support BOOLEAN DEFAULT false,
    docker_support BOOLEAN DEFAULT true,
    
    -- Performance
    bundle_size_optimization BOOLEAN DEFAULT false,
    image_optimization BOOLEAN DEFAULT false,
    font_optimization BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FRAMEWORK RELATIONSHIPS
-- =====================================================

CREATE TABLE IF NOT EXISTS framework_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    target_framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'based_on', 'alternative_to', 'works_with', 'extends'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_framework_id, target_framework_id, relationship_type)
);

-- Add relationships
INSERT INTO framework_relationships (source_framework_id, target_framework_id, relationship_type, notes) VALUES
-- Next.js is based on React
((SELECT id FROM frameworks WHERE slug = 'nextjs'), 
 (SELECT id FROM frameworks WHERE slug = 'react'), 
 'based_on', 
 'Next.js is a React framework'),

-- Gatsby is based on React
((SELECT id FROM frameworks WHERE slug = 'gatsby'), 
 (SELECT id FROM frameworks WHERE slug = 'react'), 
 'based_on', 
 'Gatsby builds on React'),

-- Nuxt is based on Vue
((SELECT id FROM frameworks WHERE slug = 'nuxt'), 
 (SELECT id FROM frameworks WHERE slug = 'vue'), 
 'based_on', 
 'Nuxt is the Vue meta-framework'),

-- SvelteKit is based on Svelte
((SELECT id FROM frameworks WHERE slug = 'sveltekit'), 
 (SELECT id FROM frameworks WHERE slug = 'svelte'), 
 'based_on', 
 'SvelteKit is the Svelte meta-framework');

-- =====================================================
-- DEPLOYMENT PLATFORM SUPPORT
-- =====================================================

CREATE TABLE IF NOT EXISTS deployment_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO deployment_platforms (name, slug, website_url) VALUES
('Vercel', 'vercel', 'https://vercel.com'),
('Netlify', 'netlify', 'https://netlify.com'),
('AWS', 'aws', 'https://aws.amazon.com'),
('Google Cloud', 'gcp', 'https://cloud.google.com'),
('Azure', 'azure', 'https://azure.microsoft.com'),
('Cloudflare Pages', 'cloudflare-pages', 'https://pages.cloudflare.com'),
('Render', 'render', 'https://render.com'),
('Railway', 'railway', 'https://railway.app'),
('Fly.io', 'fly-io', 'https://fly.io'),
('Heroku', 'heroku', 'https://heroku.com');

CREATE TABLE IF NOT EXISTS framework_deployment_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES deployment_platforms(id) ON DELETE CASCADE,
    support_level VARCHAR(20) NOT NULL, -- 'official', 'community', 'experimental'
    deployment_guide_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(framework_id, platform_id)
);

-- =====================================================
-- VIEWS FOR FRAMEWORK QUERIES
-- =====================================================

-- View for framework ecosystem overview
CREATE OR REPLACE VIEW framework_ecosystem_view AS
SELECT 
    f.*,
    fc.name as category_name,
    ff.supports_ssr,
    ff.supports_ssg,
    ff.typescript_support,
    COUNT(DISTINCT r.id) as component_count
FROM frameworks f
JOIN framework_categories fc ON f.category_id = fc.id
LEFT JOIN framework_features ff ON f.id = ff.framework_id
LEFT JOIN resource_frameworks rf ON f.id = rf.framework_id
LEFT JOIN resources r ON rf.resource_id = r.id
GROUP BY f.id, fc.name, ff.supports_ssr, ff.supports_ssg, ff.typescript_support;

-- View for framework compatibility matrix
CREATE OR REPLACE VIEW framework_compatibility_view AS
SELECT 
    f1.name as framework_name,
    f1.ecosystem,
    f2.name as works_with,
    fr.relationship_type,
    fr.notes
FROM frameworks f1
JOIN framework_relationships fr ON f1.id = fr.source_framework_id
JOIN frameworks f2 ON fr.target_framework_id = f2.id
ORDER BY f1.name, fr.relationship_type, f2.name;