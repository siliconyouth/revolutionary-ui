#!/bin/bash

# Backup and remove static configuration files
# This script creates a backup before removing the files

BACKUP_DIR="./config-backup-$(date +%Y%m%d-%H%M%S)"
CONFIG_DIR="./src/config"

echo "🔄 Creating backup of static configuration files..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy config files to backup
if [ -d "$CONFIG_DIR" ]; then
    cp -r "$CONFIG_DIR" "$BACKUP_DIR/"
    echo "✅ Backup created at: $BACKUP_DIR"
    
    # List backed up files
    echo "📁 Backed up files:"
    find "$BACKUP_DIR" -type f -name "*.ts" -o -name "*.js" | while read file; do
        echo "  - ${file#$BACKUP_DIR/}"
    done
    
    echo ""
    echo "🗑️  Removing static configuration files..."
    
    # Remove the config directory
    rm -rf "$CONFIG_DIR"
    
    echo "✅ Static configuration files removed"
    echo ""
    echo "💡 To restore the backup, run:"
    echo "   cp -r $BACKUP_DIR/config ./src/"
else
    echo "❌ Config directory not found at $CONFIG_DIR"
    exit 1
fi

# Also backup and remove the root config directory
ROOT_CONFIG="./config"
if [ -d "$ROOT_CONFIG" ]; then
    echo ""
    echo "🔄 Backing up root config directory..."
    cp -r "$ROOT_CONFIG" "$BACKUP_DIR/"
    rm -rf "$ROOT_CONFIG"
    echo "✅ Root config directory backed up and removed"
fi

echo ""
echo "✅ All static configuration files have been backed up and removed"
echo "📦 The application now uses database-driven configuration"