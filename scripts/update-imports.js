const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files
const files = glob.sync('marketplace-nextjs/src/**/*.{ts,tsx,js,jsx}', {
  cwd: '/Users/vladimir/projects/revolutionary-ui',
  absolute: true
});

let updatedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace the import statements
    content = content.replace(
      /@vladimirdukelic\/revolutionary-ui(?:-factory)?/g,
      'revolutionary-ui'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`✅ Updated: ${path.relative('/Users/vladimir/projects/revolutionary-ui', file)}`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n📊 Updated ${updatedCount} files`);