#!/bin/bash

# Revolutionary UI - Interactive Environment Setup Script
# This script helps set up your .env.local file with guided configuration

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print functions
print_title() {
    echo -e "\n${BOLD}${BLUE}$1${NC}"
}

print_section() {
    echo -e "\n${BOLD}${CYAN}$1${NC}"
}

print_info() {
    echo -e "${NC}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Ask function with default value support
ask() {
    local prompt="$1"
    local default="$2"
    local response
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " response
        echo "${response:-$default}"
    else
        read -p "$prompt: " response
        echo "$response"
    fi
}

# Ask yes/no question
ask_yn() {
    local prompt="$1"
    local default="${2:-n}"
    local response
    
    if [ "$default" = "y" ]; then
        read -p "$prompt (Y/n): " response
        case "$response" in
            [nN][oO]|[nN]) echo "n" ;;
            *) echo "y" ;;
        esac
    else
        read -p "$prompt (y/N): " response
        case "$response" in
            [yY][eE][sS]|[yY]) echo "y" ;;
            *) echo "n" ;;
        esac
    fi
}

# Main setup function
main() {
    print_title "🚀 Revolutionary UI - Environment Setup Wizard"
    print_info "This wizard will help you configure your environment variables.\n"

    # Check for backup file
    if [ -f ".env.local.backup" ]; then
        print_info "Found ${BOLD}${YELLOW}.env.local.backup${NC} - will use existing values where available."
        source .env.local.backup 2>/dev/null || true
    fi

    # Check for existing .env.local
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists!"
        if [ "$(ask_yn "Do you want to overwrite it?")" = "n" ]; then
            print_info "Setup cancelled."
            exit 0
        fi
        # Backup current file
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_name=".env.local.backup-$timestamp"
        mv .env.local "$backup_name"
        print_success "Current .env.local backed up to $backup_name"
    fi

    # Start collecting variables
    ENV_VARS=""

    # Supabase Configuration
    print_section "🗄️  Supabase Database Configuration"
    
    print_info "\nSupabase Project URL"
    print_info "ℹ️  Found in Supabase Dashboard > Settings > API"
    print_info "Example: https://abcdefghijk.supabase.co"
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_info "Current value: ${BOLD}${YELLOW}$NEXT_PUBLIC_SUPABASE_URL${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
        else
            NEW_SUPABASE_URL=$(ask "Enter NEXT_PUBLIC_SUPABASE_URL")
        fi
    else
        NEW_SUPABASE_URL=$(ask "Enter NEXT_PUBLIC_SUPABASE_URL")
    fi
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_SUPABASE_URL=$NEW_SUPABASE_URL\n"

    print_info "\nSupabase Anonymous Key (safe for browser)"
    print_info "ℹ️  Found in Supabase Dashboard > Settings > API > anon key"
    print_info "Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        masked="${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}...${NEXT_PUBLIC_SUPABASE_ANON_KEY: -10}"
        print_info "Current value: ${BOLD}${YELLOW}$masked${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
        else
            NEW_ANON_KEY=$(ask "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY")
        fi
    else
        NEW_ANON_KEY=$(ask "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY")
    fi
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEW_ANON_KEY\n"

    print_info "\nSupabase Service Role Key (server-side only)"
    print_info "ℹ️  Found in Supabase Dashboard > Settings > API > service_role key"
    print_info "⚠️  Keep this secret! Never expose in client-side code"
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        masked="${SUPABASE_SERVICE_ROLE_KEY:0:20}...${SUPABASE_SERVICE_ROLE_KEY: -10}"
        print_info "Current value: ${BOLD}${YELLOW}$masked${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
        else
            NEW_SERVICE_KEY=$(ask "Enter SUPABASE_SERVICE_ROLE_KEY")
        fi
    else
        NEW_SERVICE_KEY=$(ask "Enter SUPABASE_SERVICE_ROLE_KEY")
    fi
    ENV_VARS="${ENV_VARS}SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY\n"

    # Database URLs
    print_section "🔗 Database Connection Strings"
    
    print_info "\nDirect Database URL"
    print_info "ℹ️  Found in Supabase Dashboard > Settings > Database"
    print_info "Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    if [ -n "$DATABASE_URL" ]; then
        # Mask password in URL
        masked=$(echo "$DATABASE_URL" | sed -E 's/(postgres:)[^@]+(@)/\1****\2/')
        print_info "Current value: ${BOLD}${YELLOW}$masked${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_DATABASE_URL="$DATABASE_URL"
        else
            NEW_DATABASE_URL=$(ask "Enter DATABASE_URL")
        fi
    else
        NEW_DATABASE_URL=$(ask "Enter DATABASE_URL")
    fi
    ENV_VARS="${ENV_VARS}DATABASE_URL=$NEW_DATABASE_URL\n"

    # Generate pooled URL
    print_info "\nGenerating pooled connection URL for Prisma..."
    NEW_DATABASE_URL_PRISMA=$(echo "$NEW_DATABASE_URL" | sed 's/:5432/:6543/' | sed 's/\?.*$//')
    NEW_DATABASE_URL_PRISMA="${NEW_DATABASE_URL_PRISMA}?pgbouncer=true&connection_limit=1"
    print_success "Generated DATABASE_URL_PRISMA"
    ENV_VARS="${ENV_VARS}DATABASE_URL_PRISMA=$NEW_DATABASE_URL_PRISMA\n"

    # Direct URL is same as DATABASE_URL
    ENV_VARS="${ENV_VARS}DIRECT_URL=$NEW_DATABASE_URL\n"

    # Authentication
    print_section "🔐 Authentication Configuration"
    
    print_info "\nNextAuth URL"
    print_info "ℹ️  Your app URL (use http://localhost:3000 for development)"
    NEXTAUTH_URL_DEFAULT="http://localhost:3000"
    if [ -n "$NEXTAUTH_URL" ]; then
        print_info "Current value: ${BOLD}${YELLOW}$NEXTAUTH_URL${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_NEXTAUTH_URL="$NEXTAUTH_URL"
        else
            NEW_NEXTAUTH_URL=$(ask "Enter NEXTAUTH_URL" "$NEXTAUTH_URL_DEFAULT")
        fi
    else
        NEW_NEXTAUTH_URL=$(ask "Enter NEXTAUTH_URL" "$NEXTAUTH_URL_DEFAULT")
    fi
    ENV_VARS="${ENV_VARS}NEXTAUTH_URL=$NEW_NEXTAUTH_URL\n"

    print_info "\nNextAuth Secret"
    print_info "ℹ️  Random string for JWT encryption"
    if [ -n "$NEXTAUTH_SECRET" ]; then
        print_info "Current value: ${BOLD}${YELLOW}[HIDDEN]${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "y" ]; then
            NEW_NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
        else
            if [ "$(ask_yn "Generate new secret?" "y")" = "y" ]; then
                NEW_NEXTAUTH_SECRET=$(openssl rand -base64 32)
                print_success "Generated new secret"
            else
                NEW_NEXTAUTH_SECRET=$(ask "Enter NEXTAUTH_SECRET")
            fi
        fi
    else
        if [ "$(ask_yn "Generate secret automatically?" "y")" = "y" ]; then
            NEW_NEXTAUTH_SECRET=$(openssl rand -base64 32)
            print_success "Generated new secret"
        else
            NEW_NEXTAUTH_SECRET=$(ask "Enter NEXTAUTH_SECRET")
        fi
    fi
    ENV_VARS="${ENV_VARS}NEXTAUTH_SECRET=$NEW_NEXTAUTH_SECRET\n"

    # Optional: OAuth Providers
    if [ "$(ask_yn "Configure OAuth providers (GitHub, Google)?")" = "y" ]; then
        print_section "🔑 OAuth Providers"
        
        # GitHub OAuth
        if [ "$(ask_yn "Configure GitHub OAuth?")" = "y" ]; then
            print_info "\nGitHub OAuth App ID"
            print_info "ℹ️  Create at https://github.com/settings/developers"
            GITHUB_ID=$(ask "Enter GITHUB_ID (or press Enter to skip)" "$GITHUB_ID")
            if [ -n "$GITHUB_ID" ]; then
                ENV_VARS="${ENV_VARS}GITHUB_ID=$GITHUB_ID\n"
                GITHUB_SECRET=$(ask "Enter GITHUB_SECRET")
                ENV_VARS="${ENV_VARS}GITHUB_SECRET=$GITHUB_SECRET\n"
            fi
        fi

        # Google OAuth
        if [ "$(ask_yn "Configure Google OAuth?")" = "y" ]; then
            print_info "\nGoogle OAuth Client ID"
            print_info "ℹ️  Create at https://console.cloud.google.com/apis/credentials"
            GOOGLE_CLIENT_ID=$(ask "Enter GOOGLE_CLIENT_ID (or press Enter to skip)" "$GOOGLE_CLIENT_ID")
            if [ -n "$GOOGLE_CLIENT_ID" ]; then
                ENV_VARS="${ENV_VARS}GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID\n"
                GOOGLE_CLIENT_SECRET=$(ask "Enter GOOGLE_CLIENT_SECRET")
                ENV_VARS="${ENV_VARS}GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET\n"
            fi
        fi
    fi

    # Optional: Stripe
    if [ "$(ask_yn "Configure Stripe payments?")" = "y" ]; then
        print_section "💳 Stripe Configuration"
        
        print_info "\nStripe Secret Key"
        print_info "ℹ️  Found in Stripe Dashboard > Developers > API keys"
        STRIPE_SECRET_KEY=$(ask "Enter STRIPE_SECRET_KEY (or press Enter to skip)" "$STRIPE_SECRET_KEY")
        if [ -n "$STRIPE_SECRET_KEY" ]; then
            ENV_VARS="${ENV_VARS}STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY\n"
            
            print_info "\nStripe Publishable Key"
            STRIPE_PUBLISHABLE_KEY=$(ask "Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
            ENV_VARS="${ENV_VARS}NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY\n"
            
            print_info "\nStripe Webhook Secret"
            print_info "ℹ️  Found in Stripe Dashboard > Developers > Webhooks"
            STRIPE_WEBHOOK_SECRET=$(ask "Enter STRIPE_WEBHOOK_SECRET (optional)" "$STRIPE_WEBHOOK_SECRET")
            if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
                ENV_VARS="${ENV_VARS}STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET\n"
            fi
        fi
    fi

    # AI Providers
    print_section "🤖 AI Provider API Keys"
    print_info "Configure API keys for AI providers you want to use."
    
    # OpenAI
    print_info "\nOpenAI API Key"
    print_info "ℹ️  Get from https://platform.openai.com/api-keys"
    if [ -n "$OPENAI_API_KEY" ]; then
        masked="${OPENAI_API_KEY:0:10}...${OPENAI_API_KEY: -4}"
        print_info "Current value: ${BOLD}${YELLOW}$masked${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "n" ]; then
            OPENAI_API_KEY=$(ask "Enter OPENAI_API_KEY (or press Enter to skip)")
        fi
    else
        OPENAI_API_KEY=$(ask "Enter OPENAI_API_KEY (or press Enter to skip)")
    fi
    if [ -n "$OPENAI_API_KEY" ]; then
        ENV_VARS="${ENV_VARS}OPENAI_API_KEY=$OPENAI_API_KEY\n"
    fi

    # Anthropic
    print_info "\nAnthropic (Claude) API Key"
    print_info "ℹ️  Get from https://console.anthropic.com/"
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        masked="${ANTHROPIC_API_KEY:0:15}...${ANTHROPIC_API_KEY: -4}"
        print_info "Current value: ${BOLD}${YELLOW}$masked${NC}"
        if [ "$(ask_yn "Keep existing value?" "y")" = "n" ]; then
            ANTHROPIC_API_KEY=$(ask "Enter ANTHROPIC_API_KEY (or press Enter to skip)")
        fi
    else
        ANTHROPIC_API_KEY=$(ask "Enter ANTHROPIC_API_KEY (or press Enter to skip)")
    fi
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        ENV_VARS="${ENV_VARS}ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY\n"
    fi

    # Feature Flags
    print_section "⚡ Feature Flags"
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_ENABLE_MARKETPLACE=true\n"
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_ENABLE_AI_GENERATION=true\n"
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_ENABLE_COMMUNITY_SUBMISSIONS=true\n"
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_ENABLE_TRANSPILER=true\n"
    ENV_VARS="${ENV_VARS}NEXT_PUBLIC_ENABLE_PREVIEW=true\n"
    print_success "Set all feature flags to enabled"

    # Generate .env.local file
    print_section "📝 Generating .env.local file..."
    
    cat > .env.local << EOF
# Revolutionary UI Environment Configuration
# Generated on $(date)
# 
# IMPORTANT: Keep this file secure and never commit it to version control
# =============================================================================

# Supabase Database Configuration
# =============================================================================

$ENV_VARS

# =============================================================================
# Additional configuration can be added below
# =============================================================================
EOF

    print_success "Created ${BOLD}${YELLOW}.env.local${NC}"

    # Summary
    print_section "✅ Setup Complete!"
    print_info "\nNext steps:"
    print_info "1. Run: ${BOLD}npm install${NC}"
    print_info "2. Run: ${BOLD}./scripts/setup-database.sh${NC}"
    print_info "3. Run: ${BOLD}cd marketplace-nextjs && npm run dev${NC}"
    print_info "\nHappy coding! 🚀"
}

# Run main function
main