const fs = require('fs');
const path = require('path');

// Mapping of problematic characters to safe alternatives
const SAFE_REPLACEMENTS = {
  ' ': '-',           // Space to dash
  '&': 'and',         // Ampersand to 'and'
  'ä': 'a',           // Swedish ä to a  
  'ö': 'o',           // Swedish ö to o
  'å': 'a',           // Swedish å to a
  'Ä': 'A',           // Swedish Ä to A
  'Ö': 'O',           // Swedish Ö to O
  'Å': 'A',           // Swedish Å to A
  '_': '-',           // Underscore to dash
  '(': '',            // Remove parentheses
  ')': '',
  '[': '',            // Remove brackets
  ']': '',
  '{': '',            // Remove braces
  '}': '',
  '%': '',            // Remove percent
  '#': '',            // Remove hash
  '+': 'plus',        // Plus to word
  '=': 'equals',      // Equals to word
  '?': '',            // Remove question mark
  '!': '',            // Remove exclamation
  ':': '-',           // Colon to dash
  ';': '-',           // Semicolon to dash
  ',': '-',           // Comma to dash
  "'": '',            // Remove apostrophe
  '"': '',            // Remove quotes
  '`': '',            // Remove backtick
  '|': '-',           // Pipe to dash
  '\\': '-',          // Backslash to dash
  '/': '-',           // Forward slash to dash
  '*': '',            // Remove asterisk
  '<': '',            // Remove less than
  '>': '',            // Remove greater than
};

function makeSafeFilename(filename) {
  let safeName = filename;
  
  // Apply all replacements
  for (const [char, replacement] of Object.entries(SAFE_REPLACEMENTS)) {
    safeName = safeName.replace(new RegExp('\\' + char, 'g'), replacement);
  }
  
  // Remove multiple consecutive dashes
  safeName = safeName.replace(/-+/g, '-');
  
  // Remove leading/trailing dashes
  safeName = safeName.replace(/^-+|-+$/g, '');
  
  // Convert to lowercase for consistency
  safeName = safeName.toLowerCase();
  
  return safeName;
}

async function renameFilesInDirectory(dirPath, isRoot = true) {
  const files = await fs.promises.readdir(dirPath);
  const renames = [];
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.promises.stat(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subRenames = await renameFilesInDirectory(fullPath, false);
      renames.push(...subRenames);
    } else {
      // Process files
      const ext = path.extname(file);
      const nameWithoutExt = path.basename(file, ext);
      const safeName = makeSafeFilename(nameWithoutExt) + ext;
      
      if (safeName !== file) {
        const newPath = path.join(dirPath, safeName);
        
        // Avoid conflicts
        if (!fs.existsSync(newPath)) {
          renames.push({
            oldPath: fullPath,
            newPath: newPath,
            oldName: file,
            newName: safeName,
            directory: path.relative(process.cwd(), dirPath)
          });
        } else {
          console.log(`⚠️  Skipping ${file} - target ${safeName} already exists`);
        }
      }
    }
  }
  
  return renames;
}

async function updateCodeReferences(renames) {
  // Files that might contain image references
  const codeFiles = [
    'frontend/src/**/*.tsx',
    'frontend/src/**/*.ts',
    'frontend/src/**/*.js',
    'frontend/src/**/*.jsx'
  ];
  
  console.log('\n📝 Files that need code updates:');
  
  for (const rename of renames) {
    console.log(`   ${rename.oldName} → ${rename.newName}`);
  }
  
  console.log('\n⚠️  Manual code updates needed in these directories:');
  console.log('   - frontend/src/app/[locale]/om-oss/');
  console.log('   - frontend/src/components/');
  console.log('   - Any components using these images');
}

async function main() {
  console.log('🔧 Starting filename safety conversion...\n');
  
  const publicDir = path.join(process.cwd(), 'public');
  
  try {
    const renames = await renameFilesInDirectory(publicDir);
    
    if (renames.length === 0) {
      console.log('✅ All filenames are already safe!');
      return;
    }
    
    console.log(`📁 Found ${renames.length} files to rename:\n`);
    
    // Show what will be renamed
    for (const rename of renames) {
      console.log(`📄 ${rename.directory}/`);
      console.log(`   ${rename.oldName} → ${rename.newName}`);
    }
    
    console.log('\n🚀 Starting renames...\n');
    
    // Perform renames
    for (const rename of renames) {
      try {
        await fs.promises.rename(rename.oldPath, rename.newPath);
        console.log(`✅ Renamed: ${rename.oldName} → ${rename.newName}`);
      } catch (error) {
        console.error(`❌ Failed to rename ${rename.oldName}: ${error.message}`);
      }
    }
    
    // Update code references
    await updateCodeReferences(renames);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ FILENAME SAFETY CONVERSION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📁 ${renames.length} files renamed`);
    console.log('📝 Remember to update code references manually');
    console.log('🚀 Files are now safe for Railway deployment!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during filename conversion:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { makeSafeFilename, renameFilesInDirectory }; 