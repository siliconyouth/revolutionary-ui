-- Revolutionary UI Component Database Schema
-- Based on analysis of awesome-web-components categorization system
-- Designed for comprehensive UI resource cataloging

-- =====================================================
-- CORE CATEGORIZATION TABLES
-- =====================================================

-- Main categories (top-level classification)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- icon identifier
    sort_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource types (component, library, framework, tool, etc.)
CREATE TABLE resource_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programming paradigms (class-based, functional, declarative, etc.)
CREATE TABLE paradigms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MAIN RESOURCE TABLE
-- =====================================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT, -- markdown supported
    resource_type_id UUID NOT NULL REFERENCES resource_types(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    paradigm_id UUID REFERENCES paradigms(id),
    
    -- Source information
    github_url VARCHAR(500),
    npm_package VARCHAR(200),
    website_url VARCHAR(500),
    documentation_url VARCHAR(500),
    demo_url VARCHAR(500),
    
    -- Metadata
    author VARCHAR(200),
    organization VARCHAR(200),
    license VARCHAR(50),
    version VARCHAR(50),
    last_updated DATE,
    first_released DATE,
    
    -- Statistics
    github_stars INTEGER DEFAULT 0,
    npm_downloads INTEGER DEFAULT 0,
    popularity_score DECIMAL(5,2) DEFAULT 0, -- calculated metric
    
    -- Features
    is_typescript BOOLEAN DEFAULT false,
    is_open_source BOOLEAN DEFAULT true,
    is_maintained BOOLEAN DEFAULT true,
    is_deprecated BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Search optimization
    search_vector tsvector,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create search index
CREATE INDEX idx_resources_search ON resources USING GIN (search_vector);

-- =====================================================
-- CLASSIFICATION & TAGGING
-- =====================================================

-- Tags for flexible categorization
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50), -- tag category (tech, feature, use-case, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship for resource tags
CREATE TABLE resource_tags (
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- =====================================================
-- FRAMEWORK & TECHNOLOGY SUPPORT
-- =====================================================

-- Supported frameworks (React, Vue, Angular, etc.)
CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    version VARCHAR(20),
    icon VARCHAR(50),
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Framework compatibility
CREATE TABLE resource_frameworks (
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    compatibility_level VARCHAR(20), -- full, partial, plugin
    min_version VARCHAR(20),
    notes TEXT,
    PRIMARY KEY (resource_id, framework_id)
);

-- =====================================================
-- DESIGN SYSTEMS & COMPONENT LIBRARIES
-- =====================================================

-- Design system specific information
CREATE TABLE design_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
    design_language VARCHAR(100), -- Material, Fluent, Carbon, etc.
    company VARCHAR(100),
    theming_support BOOLEAN DEFAULT true,
    dark_mode_support BOOLEAN DEFAULT true,
    rtl_support BOOLEAN DEFAULT false,
    accessibility_level VARCHAR(20), -- WCAG AA, AAA, etc.
    component_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual components within libraries/systems
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    component_type VARCHAR(50), -- button, form, navigation, etc.
    description TEXT,
    props_schema JSONB, -- component props/attributes
    code_example TEXT,
    preview_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USE CASES & EXAMPLES
-- =====================================================

-- Real-world use cases
CREATE TABLE use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- e-commerce, dashboard, marketing, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link resources to use cases
CREATE TABLE resource_use_cases (
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    relevance_score INTEGER DEFAULT 5, -- 1-10
    notes TEXT,
    PRIMARY KEY (resource_id, use_case_id)
);

-- =====================================================
-- TOOLS & ECOSYSTEM
-- =====================================================

-- Development tools (bundlers, testing, etc.)
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
    tool_type VARCHAR(50), -- bundler, testing, devtools, etc.
    supported_features TEXT[],
    configuration_complexity VARCHAR(20), -- low, medium, high
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LEARNING RESOURCES
-- =====================================================

-- Tutorials, guides, articles
CREATE TABLE learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    url VARCHAR(500) NOT NULL,
    resource_type VARCHAR(50), -- tutorial, article, video, course
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    duration_minutes INTEGER,
    author VARCHAR(200),
    published_date DATE,
    related_resource_id UUID REFERENCES resources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COMMUNITY & METRICS
-- =====================================================

-- Community metrics and health
CREATE TABLE resource_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    github_stars INTEGER,
    github_forks INTEGER,
    github_issues_open INTEGER,
    github_issues_closed INTEGER,
    github_contributors INTEGER,
    npm_weekly_downloads INTEGER,
    stackoverflow_questions INTEGER,
    community_size_estimate INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, metric_date)
);

-- =====================================================
-- RELATIONSHIPS & DEPENDENCIES
-- =====================================================

-- Resource relationships (alternatives, dependencies, etc.)
CREATE TABLE resource_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    target_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- alternative, dependency, extends, integrates
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_resource_id, target_resource_id, relationship_type)
);

-- =====================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Update search vector on resource changes
CREATE OR REPLACE FUNCTION update_resource_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.author, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.organization, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_search_vector
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_resource_search_vector();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA BASED ON AWESOME-WEB-COMPONENTS
-- =====================================================

-- Insert main categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Standards', 'standards', 'Web Components standards and specifications', 1),
('Guides', 'guides', 'Learning resources and best practices', 2),
('Articles', 'articles', 'In-depth articles and discussions', 3),
('Real World', 'real-world', 'Production implementations and case studies', 4),
('Libraries', 'libraries', 'Web Components libraries and frameworks', 5),
('Frameworks', 'frameworks', 'Framework integrations and support', 6),
('Ecosystem', 'ecosystem', 'Tools, testing, and development ecosystem', 7),
('Design Systems', 'design-systems', 'Complete design system implementations', 8);

-- Insert subcategories
INSERT INTO categories (name, slug, description, parent_id, sort_order) 
SELECT 'Components', 'components', 'Individual web components', id, 1 FROM categories WHERE slug = 'real-world';

INSERT INTO categories (name, slug, description, parent_id, sort_order) 
SELECT 'Component Libraries', 'component-libraries', 'Collections of web components', id, 2 FROM categories WHERE slug = 'real-world';

-- Insert resource types
INSERT INTO resource_types (name, slug, description) VALUES
('Component', 'component', 'Individual UI component'),
('Library', 'library', 'Component library or collection'),
('Framework', 'framework', 'UI framework or meta-framework'),
('Design System', 'design-system', 'Complete design system implementation'),
('Tool', 'tool', 'Development tool or utility'),
('Guide', 'guide', 'Tutorial or learning resource'),
('Article', 'article', 'Technical article or blog post'),
('Example', 'example', 'Code example or demo'),
('Integration', 'integration', 'Framework integration or adapter');

-- Insert paradigms
INSERT INTO paradigms (name, description) VALUES
('Class-Based', 'Object-oriented approach using ES6 classes'),
('Functional', 'Functional programming approach with hooks'),
('Declarative', 'Declarative component definition'),
('Compiler-Based', 'Compile-time optimization approach'),
('Hybrid', 'Mixed paradigm approach');

-- Insert frameworks
INSERT INTO frameworks (name, slug, icon) VALUES
('React', 'react', 'react'),
('Vue', 'vue', 'vue'),
('Angular', 'angular', 'angular'),
('Svelte', 'svelte', 'svelte'),
('Vanilla JS', 'vanilla', 'javascript'),
('Web Components', 'web-components', 'web-components');

-- Insert common tags
INSERT INTO tags (name, slug, category) VALUES
('Accessible', 'accessible', 'feature'),
('TypeScript', 'typescript', 'tech'),
('Responsive', 'responsive', 'feature'),
('Material Design', 'material-design', 'design'),
('Dark Mode', 'dark-mode', 'feature'),
('SSR Compatible', 'ssr-compatible', 'feature'),
('Tree-Shakeable', 'tree-shakeable', 'feature'),
('Zero Dependencies', 'zero-dependencies', 'feature'),
('Enterprise', 'enterprise', 'use-case'),
('Mobile-First', 'mobile-first', 'feature');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Popular resources view
CREATE VIEW popular_resources AS
SELECT 
    r.*,
    c.name as category_name,
    rt.name as resource_type_name,
    p.name as paradigm_name,
    COALESCE(r.github_stars, 0) + COALESCE(r.npm_downloads / 1000, 0) as popularity_score
FROM resources r
JOIN categories c ON r.category_id = c.id
JOIN resource_types rt ON r.resource_type_id = rt.id
LEFT JOIN paradigms p ON r.paradigm_id = p.id
WHERE r.is_deprecated = false
ORDER BY popularity_score DESC;

-- Framework compatibility view
CREATE VIEW framework_compatibility_matrix AS
SELECT 
    r.name as resource_name,
    f.name as framework_name,
    rf.compatibility_level,
    rf.min_version
FROM resources r
CROSS JOIN frameworks f
LEFT JOIN resource_frameworks rf ON r.id = rf.resource_id AND f.id = rf.framework_id
ORDER BY r.name, f.name;