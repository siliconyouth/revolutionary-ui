-- Visual Component Preview System Schema Extensions
-- Adds preview capabilities to the Revolutionary UI Component Catalog

-- =====================================================
-- PREVIEW CONFIGURATION TABLE
-- =====================================================

CREATE TABLE component_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Preview metadata
    preview_type VARCHAR(50) NOT NULL, -- 'live', 'static', 'sandbox', 'storybook', 'codepen'
    preview_url VARCHAR(500), -- URL for iframe embeds
    preview_height INTEGER DEFAULT 400, -- Default preview height in pixels
    preview_width VARCHAR(20) DEFAULT '100%', -- Width (can be px or %)
    
    -- Code examples
    example_code TEXT, -- Primary code example
    example_framework VARCHAR(50) DEFAULT 'react', -- Framework for the example
    example_dependencies JSONB, -- Package dependencies needed
    
    -- Static preview assets
    screenshot_url VARCHAR(500), -- Fallback static image
    thumbnail_url VARCHAR(500), -- Small preview image
    video_url VARCHAR(500), -- Demo video URL
    
    -- Interactive preview configuration
    sandbox_template VARCHAR(100), -- 'react', 'vue', 'angular', 'vanilla'
    sandbox_files JSONB, -- Files structure for CodeSandbox/StackBlitz
    sandbox_config JSONB, -- Additional sandbox configuration
    
    -- Preview features
    is_interactive BOOLEAN DEFAULT true,
    is_responsive BOOLEAN DEFAULT true,
    supports_themes BOOLEAN DEFAULT false,
    supports_rtl BOOLEAN DEFAULT false,
    
    -- Performance
    load_time_ms INTEGER, -- Average load time
    bundle_size_kb INTEGER, -- Component bundle size
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_resource_preview UNIQUE(resource_id, preview_type, example_framework)
);

-- =====================================================
-- PREVIEW VARIATIONS TABLE
-- =====================================================

CREATE TABLE preview_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preview_id UUID NOT NULL REFERENCES component_previews(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL, -- 'Dark Mode', 'Compact', 'With Icons'
    description TEXT,
    
    -- Variation specifics
    props_override JSONB, -- Component props for this variation
    styles_override TEXT, -- Additional CSS
    code_snippet TEXT, -- Code for this variation
    screenshot_url VARCHAR(500),
    
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PREVIEW PLAYGROUND SETTINGS
-- =====================================================

CREATE TABLE playground_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Template configuration
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    
    -- Base setup
    base_code TEXT NOT NULL, -- Starting code template
    base_props JSONB, -- Default props
    base_styles TEXT, -- Default styles
    
    -- Customization options
    editable_props JSONB, -- Which props can be edited
    prop_controls JSONB, -- UI controls for each prop
    theme_options JSONB, -- Available themes
    
    -- Dependencies
    required_packages JSONB,
    cdn_links JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LIVE PREVIEW PROVIDERS
-- =====================================================

CREATE TABLE preview_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    
    -- Provider configuration
    base_url VARCHAR(200),
    embed_pattern VARCHAR(500), -- URL pattern for embeds
    api_endpoint VARCHAR(200),
    api_key_required BOOLEAN DEFAULT false,
    
    -- Supported features
    supports_react BOOLEAN DEFAULT true,
    supports_vue BOOLEAN DEFAULT false,
    supports_angular BOOLEAN DEFAULT false,
    supports_svelte BOOLEAN DEFAULT false,
    supports_typescript BOOLEAN DEFAULT true,
    
    -- Limits
    max_file_size_kb INTEGER DEFAULT 1000,
    max_dependencies INTEGER DEFAULT 50,
    rate_limit_per_hour INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PREVIEW ANALYTICS
-- =====================================================

CREATE TABLE preview_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preview_id UUID NOT NULL REFERENCES component_previews(id) ON DELETE CASCADE,
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    interaction_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    sandbox_opens INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_load_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 100,
    
    -- User engagement
    avg_time_spent_seconds INTEGER,
    bounce_rate FLOAT,
    
    -- Date tracking
    date DATE NOT NULL,
    
    CONSTRAINT unique_preview_date UNIQUE(preview_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_previews_resource ON component_previews(resource_id);
CREATE INDEX idx_previews_type ON component_previews(preview_type);
CREATE INDEX idx_previews_framework ON component_previews(example_framework);
CREATE INDEX idx_variations_preview ON preview_variations(preview_id);
CREATE INDEX idx_playground_resource ON playground_templates(resource_id);
CREATE INDEX idx_analytics_preview_date ON preview_analytics(preview_id, date);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default preview providers
INSERT INTO preview_providers (name, slug, base_url, embed_pattern, supports_react, supports_vue, supports_angular, supports_svelte, supports_typescript) VALUES
('CodeSandbox', 'codesandbox', 'https://codesandbox.io', 'https://codesandbox.io/embed/{sandbox_id}', true, true, true, true, true),
('StackBlitz', 'stackblitz', 'https://stackblitz.com', 'https://stackblitz.com/edit/{project_id}?embed=1', true, true, true, true, true),
('CodePen', 'codepen', 'https://codepen.io', 'https://codepen.io/{username}/embed/{pen_id}', true, true, false, false, false),
('Storybook', 'storybook', null, '{storybook_url}/iframe.html?id={story_id}', true, true, true, true, true),
('Custom Iframe', 'iframe', null, '{url}', true, true, true, true, true);