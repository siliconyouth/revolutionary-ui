-- Community Component Submissions Schema
-- Allows users to submit components for review and publication

-- =====================================================
-- SUBMISSION TABLES
-- =====================================================

CREATE TABLE component_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Submitter information
    user_id UUID NOT NULL REFERENCES users(id),
    submitter_name VARCHAR(100) NOT NULL,
    submitter_email VARCHAR(255) NOT NULL,
    submitter_github VARCHAR(100),
    
    -- Component information
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT NOT NULL,
    long_description TEXT,
    
    -- Component details
    category_id UUID NOT NULL REFERENCES categories(id),
    resource_type_id UUID NOT NULL REFERENCES resource_types(id),
    frameworks TEXT[], -- Array of supported frameworks
    
    -- Code and documentation
    source_code TEXT NOT NULL,
    documentation TEXT,
    demo_url VARCHAR(500),
    github_url VARCHAR(500),
    npm_package VARCHAR(200),
    
    -- Technical details
    dependencies JSONB,
    peer_dependencies JSONB,
    dev_dependencies JSONB,
    bundle_size_kb INTEGER,
    min_react_version VARCHAR(20),
    min_vue_version VARCHAR(20),
    min_angular_version VARCHAR(20),
    
    -- Features
    has_typescript BOOLEAN DEFAULT false,
    has_tests BOOLEAN DEFAULT false,
    has_documentation BOOLEAN DEFAULT true,
    has_preview BOOLEAN DEFAULT false,
    is_responsive BOOLEAN DEFAULT true,
    is_accessible BOOLEAN DEFAULT false,
    supports_dark_mode BOOLEAN DEFAULT false,
    supports_rtl BOOLEAN DEFAULT false,
    
    -- License and legal
    license VARCHAR(50) NOT NULL DEFAULT 'MIT',
    accepts_terms BOOLEAN NOT NULL DEFAULT false,
    copyright_owner VARCHAR(200),
    
    -- Submission status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- draft, submitted, in_review, approved, rejected, published, archived
    
    submission_date TIMESTAMP,
    review_started_at TIMESTAMP,
    review_completed_at TIMESTAMP,
    published_at TIMESTAMP,
    
    -- Review details
    reviewer_id UUID REFERENCES users(id),
    review_notes TEXT,
    rejection_reason TEXT,
    required_changes TEXT[],
    
    -- Quality scores (set by reviewer)
    code_quality_score INTEGER CHECK (code_quality_score >= 0 AND code_quality_score <= 100),
    documentation_score INTEGER CHECK (documentation_score >= 0 AND documentation_score <= 100),
    design_score INTEGER CHECK (design_score >= 0 AND design_score <= 100),
    
    -- Publishing details
    published_resource_id UUID REFERENCES resources(id),
    version VARCHAR(20) DEFAULT '1.0.0',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION PREVIEW/DEMO TABLE
-- =====================================================

CREATE TABLE submission_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES component_submissions(id) ON DELETE CASCADE,
    
    -- Preview configuration
    preview_type VARCHAR(50) NOT NULL, -- 'live', 'static', 'sandbox'
    preview_code TEXT NOT NULL,
    preview_dependencies JSONB,
    sandbox_url VARCHAR(500),
    screenshot_url VARCHAR(500),
    
    -- Framework-specific examples
    framework VARCHAR(50) NOT NULL,
    example_code TEXT NOT NULL,
    example_props JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION ATTACHMENTS
-- =====================================================

CREATE TABLE submission_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES component_submissions(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    
    attachment_type VARCHAR(50) NOT NULL, -- 'screenshot', 'demo_video', 'documentation', 'test_file'
    description TEXT,
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION REVIEW CHECKLIST
-- =====================================================

CREATE TABLE submission_review_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES component_submissions(id) ON DELETE CASCADE,
    
    -- Code quality checks
    code_follows_standards BOOLEAN,
    code_is_clean BOOLEAN,
    code_has_comments BOOLEAN,
    no_console_logs BOOLEAN,
    no_security_issues BOOLEAN,
    
    -- Documentation checks
    readme_exists BOOLEAN,
    api_documented BOOLEAN,
    examples_provided BOOLEAN,
    props_documented BOOLEAN,
    
    -- Testing checks
    tests_exist BOOLEAN,
    tests_pass BOOLEAN,
    coverage_adequate BOOLEAN,
    
    -- Design checks
    responsive_design BOOLEAN,
    accessible_markup BOOLEAN,
    consistent_styling BOOLEAN,
    
    -- Legal checks
    license_appropriate BOOLEAN,
    no_copyright_issues BOOLEAN,
    dependencies_licensed BOOLEAN,
    
    reviewer_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION COMMENTS (for review process)
-- =====================================================

CREATE TABLE submission_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES component_submissions(id) ON DELETE CASCADE,
    
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    
    -- Comment context
    comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'code_review', 'design_feedback', 'documentation'
    line_number INTEGER, -- For code-specific comments
    file_path VARCHAR(255), -- For file-specific comments
    
    is_internal BOOLEAN DEFAULT false, -- Internal comments not shown to submitter
    is_resolved BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION VERSIONS (track changes)
-- =====================================================

CREATE TABLE submission_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES component_submissions(id) ON DELETE CASCADE,
    
    version_number INTEGER NOT NULL,
    changes_made TEXT[],
    source_code TEXT NOT NULL,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUBMISSION GUIDELINES
-- =====================================================

CREATE TABLE submission_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEATURED SUBMISSIONS
-- =====================================================

CREATE TABLE featured_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id),
    
    featured_reason TEXT,
    featured_by UUID REFERENCES users(id),
    featured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    featured_until TIMESTAMP,
    
    position INTEGER DEFAULT 0, -- For ordering featured items
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_submissions_user ON component_submissions(user_id);
CREATE INDEX idx_submissions_status ON component_submissions(status);
CREATE INDEX idx_submissions_category ON component_submissions(category_id);
CREATE INDEX idx_submissions_date ON component_submissions(submission_date);
CREATE INDEX idx_submissions_reviewer ON component_submissions(reviewer_id);
CREATE INDEX idx_submission_comments_submission ON submission_comments(submission_id);
CREATE INDEX idx_submission_previews_submission ON submission_previews(submission_id);
CREATE INDEX idx_featured_active ON featured_submissions(is_active, featured_until);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Submission guidelines
INSERT INTO submission_guidelines (category, title, content, is_required, sort_order) VALUES
('general', 'Component Quality Standards', 'All submitted components must follow our quality standards including clean code, proper documentation, and accessibility best practices.', true, 1),
('code', 'Code Style Guide', 'Use consistent naming conventions, proper indentation, and meaningful variable names. ESLint and Prettier configurations are recommended.', true, 2),
('documentation', 'Documentation Requirements', 'Include a comprehensive README with installation instructions, usage examples, API documentation, and prop descriptions.', true, 3),
('testing', 'Testing Guidelines', 'Components should include unit tests with at least 80% code coverage. Integration tests and visual regression tests are encouraged.', false, 4),
('licensing', 'License Policy', 'Components must be submitted under an open-source license (MIT, Apache 2.0, or BSD). All dependencies must have compatible licenses.', true, 5),
('security', 'Security Requirements', 'No hardcoded secrets, API keys, or sensitive data. Follow OWASP guidelines for web security. Sanitize all user inputs.', true, 6);