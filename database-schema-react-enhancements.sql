-- React-Specific Schema Enhancements for UI Catalog
-- Based on analysis of awesome-react-components

-- =====================================================
-- ENHANCED CATEGORY STRUCTURE FOR REACT
-- =====================================================

-- Add React-specific subcategories
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
-- UI Components subcategories
('Editable Data Grid', 'editable-data-grid', 'Spreadsheet-like data editing components', (SELECT id FROM categories WHERE slug = 'components'), 1),
('Tables', 'tables', 'Data table components with sorting, filtering, pagination', (SELECT id FROM categories WHERE slug = 'components'), 2),
('Infinite Scroll', 'infinite-scroll', 'Components for endless scrolling and virtualization', (SELECT id FROM categories WHERE slug = 'components'), 3),
('Overlays', 'overlays', 'Modals, dialogs, lightboxes, and popups', (SELECT id FROM categories WHERE slug = 'components'), 4),
('Notifications', 'notifications', 'Toasts, alerts, snackbars, and banners', (SELECT id FROM categories WHERE slug = 'components'), 5),
('Tooltips', 'tooltips', 'Hover and focus tooltips, popovers', (SELECT id FROM categories WHERE slug = 'components'), 6),
('Menus', 'menus', 'Dropdowns, context menus, command palettes', (SELECT id FROM categories WHERE slug = 'components'), 7),
('Carousels', 'carousels', 'Image sliders, content carousels, galleries', (SELECT id FROM categories WHERE slug = 'components'), 8),
('Charts', 'charts', 'Data visualization and charting libraries', (SELECT id FROM categories WHERE slug = 'components'), 9),
('Maps', 'maps', 'Geographic maps and location components', (SELECT id FROM categories WHERE slug = 'components'), 10),
('Time & Date', 'time-date', 'Date pickers, calendars, time selectors', (SELECT id FROM categories WHERE slug = 'components'), 11),
('Image', 'image', 'Image galleries, viewers, editors', (SELECT id FROM categories WHERE slug = 'components'), 12),
('Video & Audio', 'video-audio', 'Media players and audio visualizers', (SELECT id FROM categories WHERE slug = 'components'), 13),
('Canvas', 'canvas', 'Drawing and graphics components', (SELECT id FROM categories WHERE slug = 'components'), 14),
('Form Components', 'form-components', 'Inputs, selects, checkboxes, radio buttons', (SELECT id FROM categories WHERE slug = 'components'), 15),
('Markdown Editors', 'markdown-editors', 'Rich text and markdown editing components', (SELECT id FROM categories WHERE slug = 'components'), 16),

-- UI Layout subcategories
('UI Layout', 'ui-layout', 'Layout and container components', (SELECT id FROM categories WHERE slug = 'libraries'), 20),
('UI Animation', 'ui-animation', 'Animation and transition libraries', (SELECT id FROM categories WHERE slug = 'libraries'), 21),
('UI Frameworks', 'ui-frameworks', 'Complete UI component frameworks', (SELECT id FROM categories WHERE slug = 'libraries'), 22),

-- Utilities categories
('Utilities', 'utilities', 'React utilities and helpers', (SELECT id FROM categories WHERE slug = 'ecosystem'), 30),
('Visibility Reporters', 'visibility-reporters', 'Detect when components are visible', (SELECT id FROM categories WHERE slug = 'utilities'), 31),
('Device Input', 'device-input', 'Handle keyboard, mouse, touch events', (SELECT id FROM categories WHERE slug = 'utilities'), 32),
('Meta Tags', 'meta-tags', 'Manage document head and SEO', (SELECT id FROM categories WHERE slug = 'utilities'), 33),
('State Management', 'state-management', 'State management solutions', (SELECT id FROM categories WHERE slug = 'utilities'), 34),
('Routing', 'routing', 'Client-side routing solutions', (SELECT id FROM categories WHERE slug = 'utilities'), 35),

-- Performance category
('Performance', 'performance', 'Performance optimization tools', (SELECT id FROM categories WHERE slug = 'ecosystem'), 40),
('Lazy Loading', 'lazy-loading', 'Code splitting and lazy loading', (SELECT id FROM categories WHERE slug = 'performance'), 41),
('Virtualization', 'virtualization', 'Efficient rendering of large lists', (SELECT id FROM categories WHERE slug = 'performance'), 42),

-- Dev Tools category
('Dev Tools', 'dev-tools', 'Development and debugging tools', (SELECT id FROM categories WHERE slug = 'ecosystem'), 50),
('Testing', 'testing', 'Testing frameworks and utilities', (SELECT id FROM categories WHERE slug = 'dev-tools'), 51),
('Debugging', 'debugging', 'Debugging and inspection tools', (SELECT id FROM categories WHERE slug = 'dev-tools'), 52),
('Build Tools', 'build-tools', 'Build and bundling tools', (SELECT id FROM categories WHERE slug = 'dev-tools'), 53);

-- =====================================================
-- REACT-SPECIFIC METADATA FIELDS
-- =====================================================

-- Add React-specific columns to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS react_version_min VARCHAR(20);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS react_version_max VARCHAR(20);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS supports_ssr BOOLEAN DEFAULT NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS supports_react_native BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS bundle_size_kb INTEGER;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS has_typescript_defs BOOLEAN DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS quality_indicators TEXT[]; -- ['rocket', 'unicorn', 'butterfly', 'trophy']

-- =====================================================
-- REACT COMPONENT FEATURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS react_component_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL UNIQUE REFERENCES resources(id) ON DELETE CASCADE,
    
    -- State Management
    uses_hooks BOOLEAN DEFAULT true,
    uses_class_components BOOLEAN DEFAULT false,
    state_management_approach VARCHAR(50), -- internal, redux, mobx, context, zustand
    
    -- Styling
    styling_approach VARCHAR(50), -- css-modules, styled-components, emotion, tailwind, sass
    themeable BOOLEAN DEFAULT false,
    css_in_js BOOLEAN DEFAULT false,
    
    -- Component Architecture
    compound_components BOOLEAN DEFAULT false,
    render_props BOOLEAN DEFAULT false,
    higher_order_component BOOLEAN DEFAULT false,
    custom_hooks_provided BOOLEAN DEFAULT false,
    
    -- Accessibility
    aria_compliant BOOLEAN DEFAULT false,
    keyboard_navigation BOOLEAN DEFAULT false,
    screen_reader_tested BOOLEAN DEFAULT false,
    
    -- Performance
    memoized BOOLEAN DEFAULT false,
    code_splitting_ready BOOLEAN DEFAULT false,
    tree_shakeable BOOLEAN DEFAULT true,
    
    -- Testing
    unit_tests_included BOOLEAN DEFAULT false,
    integration_tests_included BOOLEAN DEFAULT false,
    storybook_stories BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REACT ECOSYSTEM COMPATIBILITY
-- =====================================================

CREATE TABLE IF NOT EXISTS react_ecosystem_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    ecosystem_tool VARCHAR(100) NOT NULL, -- next.js, gatsby, remix, vite, cra
    compatibility_level VARCHAR(20) NOT NULL, -- native, full, partial, plugin
    version_constraint VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, ecosystem_tool)
);

-- =====================================================
-- COMPONENT DEPENDENCIES
-- =====================================================

CREATE TABLE IF NOT EXISTS component_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    dependency_name VARCHAR(200) NOT NULL,
    dependency_version VARCHAR(50),
    dependency_type VARCHAR(20), -- peer, dev, optional, required
    is_react_specific BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ENHANCED TAGS FOR REACT
-- =====================================================

INSERT INTO tags (name, slug, category) VALUES
-- React-specific feature tags
('Hooks', 'hooks', 'react-feature'),
('Class Components', 'class-components', 'react-feature'),
('Function Components', 'function-components', 'react-feature'),
('SSR', 'ssr', 'react-feature'),
('React Native', 'react-native', 'react-feature'),
('Concurrent Mode', 'concurrent-mode', 'react-feature'),
('Suspense', 'suspense', 'react-feature'),

-- Styling approach tags
('Styled Components', 'styled-components', 'styling'),
('CSS Modules', 'css-modules', 'styling'),
('Emotion', 'emotion', 'styling'),
('Tailwind', 'tailwind', 'styling'),
('CSS-in-JS', 'css-in-js', 'styling'),

-- State management tags
('Redux', 'redux', 'state-management'),
('MobX', 'mobx', 'state-management'),
('Context API', 'context-api', 'state-management'),
('Zustand', 'zustand', 'state-management'),
('Recoil', 'recoil', 'state-management'),

-- Quality indicators (from awesome-react-components)
('Awesome', 'awesome', 'quality'),
('Exceptional', 'exceptional', 'quality'),
('Innovative', 'innovative', 'quality'),
('Beautiful', 'beautiful', 'quality'),
('Performant', 'performant', 'quality');

-- =====================================================
-- REACT-SPECIFIC USE CASES
-- =====================================================

INSERT INTO use_cases (title, description, category) VALUES
('Admin Dashboard', 'Building administrative interfaces with data tables and charts', 'enterprise'),
('E-commerce Storefront', 'Online shopping experiences with product galleries and carts', 'e-commerce'),
('Social Media Feed', 'Infinite scrolling feeds with real-time updates', 'social'),
('Data Visualization', 'Interactive charts and data dashboards', 'analytics'),
('Content Management', 'Rich text editing and content organization', 'cms'),
('Mobile Web App', 'Progressive web apps with touch interactions', 'mobile'),
('Real-time Collaboration', 'Live editing and multi-user interactions', 'collaboration'),
('Media Gallery', 'Image and video galleries with lightbox effects', 'media'),
('Form Builder', 'Dynamic form generation and validation', 'forms'),
('Map Application', 'Location-based services and geographic visualization', 'maps');

-- =====================================================
-- COMPONENT EXAMPLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS component_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    example_name VARCHAR(200) NOT NULL,
    description TEXT,
    code_snippet TEXT,
    live_demo_url VARCHAR(500),
    codesandbox_url VARCHAR(500),
    complexity_level VARCHAR(20), -- basic, intermediate, advanced
    use_case_id UUID REFERENCES use_cases(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERFORMANCE METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- bundle-size, first-render, re-render, memory
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL, -- kb, ms, mb
    test_environment VARCHAR(100),
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, metric_type, measured_at)
);

-- =====================================================
-- VIEWS FOR REACT-SPECIFIC QUERIES
-- =====================================================

-- View for finding React components by category with features
CREATE OR REPLACE VIEW react_components_detailed AS
SELECT 
    r.*,
    c.name as category_name,
    rcf.uses_hooks,
    rcf.styling_approach,
    rcf.themeable,
    rcf.aria_compliant,
    r.bundle_size_kb,
    r.supports_ssr,
    r.supports_react_native,
    ARRAY_AGG(DISTINCT t.name) as tags
FROM resources r
JOIN categories c ON r.category_id = c.id
LEFT JOIN react_component_features rcf ON r.id = rcf.resource_id
LEFT JOIN resource_tags rt ON r.id = rt.resource_id
LEFT JOIN tags t ON rt.tag_id = t.id
WHERE EXISTS (
    SELECT 1 FROM resource_frameworks rf
    JOIN frameworks f ON rf.framework_id = f.id
    WHERE rf.resource_id = r.id AND f.slug = 'react'
)
GROUP BY r.id, c.name, rcf.uses_hooks, rcf.styling_approach, rcf.themeable, rcf.aria_compliant;

-- View for React ecosystem compatibility matrix
CREATE OR REPLACE VIEW react_ecosystem_matrix AS
SELECT 
    r.name as component_name,
    r.slug as component_slug,
    rec.ecosystem_tool,
    rec.compatibility_level,
    rec.version_constraint,
    rec.notes
FROM resources r
JOIN react_ecosystem_compatibility rec ON r.id = rec.resource_id
ORDER BY r.name, rec.ecosystem_tool;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_resources_react_version ON resources(react_version_min, react_version_max);
CREATE INDEX idx_resources_supports_ssr ON resources(supports_ssr) WHERE supports_ssr IS NOT NULL;
CREATE INDEX idx_resources_bundle_size ON resources(bundle_size_kb) WHERE bundle_size_kb IS NOT NULL;
CREATE INDEX idx_react_features_hooks ON react_component_features(uses_hooks);
CREATE INDEX idx_react_features_styling ON react_component_features(styling_approach);