-- Complete Framework List from Vercel Documentation
-- Additional frameworks not in the initial scan

-- =====================================================
-- ADDITIONAL FRAMEWORKS FROM VERCEL
-- =====================================================

-- Continue inserting frameworks that were missed in the initial scan
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem) VALUES

-- Build Tools & Dev Frameworks
('Brunch', 'brunch', 'brunch', 'https://brunch.io', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Fast and simple webapp build tool', 
    'Fast and simple webapp build tool with seamless incremental compilation',
    'agnostic'),

('Parcel', 'parcel', 'parcel', 'https://parceljs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'The zero configuration build tool', 
    'Zero configuration build tool for the web',
    'agnostic'),

('UmiJS', 'umijs', 'umi', 'https://umijs.org', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'Extensible enterprise-level front-end application framework', 
    'Extensible enterprise-level React application framework',
    'react'),

-- Static Site Generators
('Middleman', 'middleman', 'middleman', 'https://middlemanapp.com', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'Ruby', 
    'Hand-crafted frontend development', 
    'Static site generator using all the shortcuts and tools in modern web development',
    'ruby'),

('Saber', 'saber', 'saber', 'https://saber.land', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'JavaScript', 
    'A static website generator for building blazing fast websites', 
    'Framework for building static sites in Vue.js that supports data from any source',
    'vue'),

-- CMS & Content Platforms
('Sanity', 'sanity', 'sanity', 'https://sanity.io', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript', 
    'The composable content cloud', 
    'The structured content platform',
    'react'),

('Sanity v3', 'sanity-v3', 'sanity', 'https://sanity.io', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript', 
    'The composable content cloud (v3)', 
    'The structured content platform',
    'react'),

-- Component Libraries & Web Components
('Polymer', 'polymer', 'polymer', 'https://polymer-library.polymer-project.org', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript', 
    'Build modern apps using web components', 
    'Open-source webapps library from Google, for building using Web Components',
    'web-components'),

-- E-commerce & Specialized
('Hydrogen v1', 'hydrogen-v1', 'hydrogen', 'https://hydrogen.shopify.dev', 
    (SELECT id FROM framework_categories WHERE slug = 'e-commerce'), 
    'JavaScript/TypeScript', 
    'Shopify''s headless commerce framework', 
    'React framework for headless commerce',
    'react'),

-- Angular Ecosystem
('Scully', 'scully', 'scully', 'https://scully.io', 
    (SELECT id FROM framework_categories WHERE slug = 'ssg'), 
    'TypeScript', 
    'The Static Site Generator for Angular', 
    'Static site generator for Angular',
    'angular'),

-- Documentation Tools
('Storybook', 'storybook', 'storybook', 'https://storybook.js.org', 
    (SELECT id FROM framework_categories WHERE slug = 'documentation'), 
    'JavaScript/TypeScript', 
    'Build component driven UIs faster', 
    'Frontend workshop for UI development',
    'agnostic'),

-- Framework Routers
('React Router', 'react-router', 'react-router', 'https://reactrouter.com', 
    (SELECT id FROM framework_categories WHERE slug = 'frontend'), 
    'JavaScript/TypeScript', 
    'Declarative routing for React', 
    'Declarative routing for React',
    'react'),

-- Full-Stack Frameworks
('RedwoodJS', 'redwoodjs', 'redwoodjs', 'https://redwoodjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'The App Framework for Startups', 
    'Full-stack framework for the Jamstack',
    'react');

-- =====================================================
-- FRAMEWORK FEATURE MATRIX BASED ON VERCEL
-- =====================================================

-- Update framework features based on Vercel's support matrix
-- This is a comprehensive update for the main frameworks

-- Next.js - Full support for all features
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
FROM frameworks WHERE slug = 'nextjs';

-- SvelteKit - Most features supported
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, true, true, false, true, true, true, false, true, true, true, true, true, true, true, false, false
FROM frameworks WHERE slug = 'sveltekit';

-- Nuxt - Strong feature support
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, false
FROM frameworks WHERE slug = 'nuxt';

-- Astro - Static-first with SSR support
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, true, true, false, false, true, true, true, true, true, true, true, true, true, true, true, false
FROM frameworks WHERE slug = 'astro';

-- Remix - Full-stack React framework
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, true, true, false, true, true, true, true, true, true, true, true, true, true, true, false, false
FROM frameworks WHERE slug = 'remix';

-- Vite - Build tool with framework features
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, false, false, false, true, true, true, true, true, true, true, false, true, true, true, false, false
FROM frameworks WHERE slug = 'vite';

-- Gatsby - Static site generator
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, false, true, false, true, true, true, true, true, true, true, false, true, true, true, true, false
FROM frameworks WHERE slug = 'gatsby';

-- Create React App
INSERT INTO framework_features (framework_id, supports_ssr, supports_ssg, supports_isr, supports_spa, 
    hot_reload, typescript_support, jsx_support, code_splitting, tree_shaking, lazy_loading,
    edge_runtime, serverless_support, docker_support, bundle_size_optimization, image_optimization, font_optimization)
SELECT id, false, false, false, true, true, true, true, true, true, true, false, true, true, true, false, false
FROM frameworks WHERE slug = 'create-react-app';

-- =====================================================
-- VERCEL-SPECIFIC METADATA
-- =====================================================

CREATE TABLE IF NOT EXISTS vercel_framework_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL UNIQUE REFERENCES frameworks(id) ON DELETE CASCADE,
    
    -- Vercel-specific features from the matrix
    static_assets_support BOOLEAN DEFAULT true,
    edge_routing_rules BOOLEAN DEFAULT false,
    edge_middleware_native BOOLEAN DEFAULT false,
    streaming_ssr BOOLEAN DEFAULT false,
    data_cache BOOLEAN DEFAULT false,
    native_og_image_generation BOOLEAN DEFAULT false,
    multi_runtime_routes BOOLEAN DEFAULT false,
    multi_runtime_app BOOLEAN DEFAULT false,
    output_file_tracing BOOLEAN DEFAULT false,
    skew_protection BOOLEAN DEFAULT false,
    
    -- Deployment configuration
    build_command VARCHAR(200),
    output_directory VARCHAR(200),
    install_command VARCHAR(200),
    dev_command VARCHAR(200),
    
    -- Additional metadata
    preset_name VARCHAR(100),
    documentation_url VARCHAR(500),
    example_repo_url VARCHAR(500),
    demo_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Vercel-specific metadata for frameworks
INSERT INTO vercel_framework_metadata (
    framework_id, 
    static_assets_support, edge_routing_rules, edge_middleware_native, streaming_ssr,
    data_cache, native_og_image_generation, multi_runtime_routes, multi_runtime_app,
    output_file_tracing, skew_protection,
    example_repo_url, demo_url
)
SELECT 
    id,
    true, true, true, true, true, true, true, true, true, true,
    'https://github.com/vercel/vercel/tree/main/examples/nextjs',
    'https://nextjs-template.vercel.app/'
FROM frameworks WHERE slug = 'nextjs';

-- =====================================================
-- IONIC VARIANTS
-- =====================================================

-- Ionic has multiple variants based on the underlying framework
INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem, parent_framework_id) VALUES
('Ionic Angular', 'ionic-angular', 'ionic', 'https://ionicframework.com', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'TypeScript', 
    'Build amazing cross-platform mobile, web, and desktop apps', 
    'Build mobile PWAs with Angular and the Ionic Framework',
    'angular',
    (SELECT id FROM frameworks WHERE slug = 'ionic')),

('Ionic React', 'ionic-react', 'ionic', 'https://ionicframework.com', 
    (SELECT id FROM framework_categories WHERE slug = 'mobile'), 
    'JavaScript/TypeScript', 
    'Build amazing cross-platform mobile, web, and desktop apps', 
    'Build mobile PWAs with React and the Ionic Framework',
    'react',
    (SELECT id FROM frameworks WHERE slug = 'ionic'));

-- =====================================================
-- SOLIDSTART VERSIONS
-- =====================================================

-- SolidStart has different versions
UPDATE frameworks SET name = 'SolidStart v0' WHERE slug = 'solidstart';

INSERT INTO frameworks (name, slug, icon, website_url, category_id, language, description, tagline, ecosystem, is_meta_framework) VALUES
('SolidStart v1', 'solidstart-v1', 'solid', 'https://start.solidjs.com', 
    (SELECT id FROM framework_categories WHERE slug = 'full-stack'), 
    'JavaScript/TypeScript', 
    'The SolidJS meta-framework', 
    'Simple and performant reactivity for building user interfaces',
    'solid', true);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_frameworks_category ON frameworks(category_id);
CREATE INDEX idx_frameworks_ecosystem ON frameworks(ecosystem);
CREATE INDEX idx_frameworks_meta ON frameworks(is_meta_framework);
CREATE INDEX idx_framework_features_ssr ON framework_features(supports_ssr);
CREATE INDEX idx_framework_features_typescript ON framework_features(typescript_support);
CREATE INDEX idx_vercel_metadata_framework ON vercel_framework_metadata(framework_id);