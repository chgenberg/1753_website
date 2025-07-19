const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Mapping of old filenames to new filenames
const FILE_MAPPINGS = {
  // Porträtt folder
  'C_&_E_2.jpg': 'c-and-e-2.jpg',
  
  // Porträtt_hemsidan folder - all the Kapitel files
  'Kapitel 3-desktop.png': 'kapitel-3-desktop.png',
  'Kapitel 3.png': 'kapitel-3.png',
  'Kapitel 4-desktop.png': 'kapitel-4-desktop.png',
  'Kapitel 4.png': 'kapitel-4.png',
  'Kapitel 5-desktop.png': 'kapitel-5-desktop.png',
  'Kapitel 5.png': 'kapitel-5.png',
  'Kapitel 7-desktop.png': 'kapitel-7-desktop.png',
  'Kapitel 7.png': 'kapitel-7.png',
  'Kapitel 10-desktop.png': 'kapitel-10-desktop.png',
  'Kapitel 10.png': 'kapitel-10.png',
  'Kapitel 11-desktop.png': 'kapitel-11-desktop.png',
  'Kapitel 11.png': 'kapitel-11.png',
  'Kapitel 12-desktop.png': 'kapitel-12-desktop.png',
  'Kapitel 12.png': 'kapitel-12.png',
  'Kapitel 13-desktop.png': 'kapitel-13-desktop.png',
  'Kapitel 13.png': 'kapitel-13.png',
  'Kapitel 14-desktop.png': 'kapitel-14-desktop.png',
  'Kapitel 14.png': 'kapitel-14.png',
  'Kapitel 15-desktop.png': 'kapitel-15-desktop.png',
  'Kapitel 15.png': 'kapitel-15.png',
  'Kapitel 16-desktop.png': 'kapitel-16-desktop.png',
  'Kapitel 16.png': 'kapitel-16.png',
  'Kapitel 17-desktop.png': 'kapitel-17-desktop.png',
  'Kapitel 17.png': 'kapitel-17.png',
  'Kapitel 18-desktop.png': 'kapitel-18-desktop.png',
  'Kapitel 18.png': 'kapitel-18.png',
  'Kapitel 20-desktop.png': 'kapitel-20-desktop.png',
  'Kapitel 20.png': 'kapitel-20.png',
  'Kapitel 22-desktop.png': 'kapitel-22-desktop.png',
  'Kapitel 22.png': 'kapitel-22.png',
  'Kapitel 23-desktop.png': 'kapitel-23-desktop.png',
  'Kapitel 23.png': 'kapitel-23.png',
  'Kapitel 24-desktop.png': 'kapitel-24-desktop.png',
  'Kapitel 24.png': 'kapitel-24.png',
  'Kapitel 26.png': 'kapitel-26.png',
  'Kapitel 28.png': 'kapitel-28.png',
  'Kapitel 37-desktop.png': 'kapitel-37-desktop.png',
  'Kapitel 37.png': 'kapitel-37.png',
  'Kapitel 40-desktop.png': 'kapitel-40-desktop.png',
  'Kapitel 40.png': 'kapitel-40.png',
  'Kapitel 43-desktop.png': 'kapitel-43-desktop.png',
  'Kapitel 43.png': 'kapitel-43.png',
  
  // Other files
  '1753_white.png': '1753-white.png'
};

async function updateFileReferences(filePath) {
  try {
    let content = await fs.promises.readFile(filePath, 'utf8');
    let updated = false;
    
    // Update each mapping
    for (const [oldName, newName] of Object.entries(FILE_MAPPINGS)) {
      const oldPattern = new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldName)) {
        content = content.replace(oldPattern, newName);
        updated = true;
        console.log(`  ✅ Updated: ${oldName} → ${newName}`);
      }
    }
    
    if (updated) {
      await fs.promises.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function findAndUpdateFiles() {
  // Find all TypeScript/JavaScript files in src directory
  const pattern = 'src/**/*.{ts,tsx,js,jsx}';
  
  return new Promise((resolve, reject) => {
    glob(pattern, { cwd: process.cwd() }, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`🔍 Found ${files.length} files to check...\n`);
      
      let updatedCount = 0;
      
      for (const file of files) {
        const fullPath = path.join(process.cwd(), file);
        console.log(`📄 Checking: ${file}`);
        
        const wasUpdated = await updateFileReferences(fullPath);
        if (wasUpdated) {
          updatedCount++;
          console.log(`  🔄 File updated!`);
        } else {
          console.log(`  ➡️  No changes needed`);
        }
        console.log('');
      }
      
      resolve(updatedCount);
    });
  });
}

async function main() {
  console.log('🚀 Starting image reference updates...\n');
  
  try {
    const updatedCount = await findAndUpdateFiles();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMAGE REFERENCE UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log(`📁 ${updatedCount} files updated`);
    console.log('🚀 All image paths now use safe filenames!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during update:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateFileReferences, FILE_MAPPINGS }; 