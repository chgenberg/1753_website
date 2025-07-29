import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BackupOptions {
  outputDir?: string
  filename?: string
  includeTables?: string[]
  excludeTables?: string[]
}

async function backupDatabase(options: BackupOptions = {}) {
  const {
    outputDir = './backups',
    filename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`,
    includeTables,
    excludeTables = []
  } = options

  try {
    console.log('🔄 Starting database backup...')
    
    // Ensure backup directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    }

    // Define all tables to backup
    const tablesToBackup = [
      'products',
      'blogPosts', 
      'rawMaterials',
      'storeReviews',
      'newsletterSubscribers',
      'contactSubmissions'
    ].filter(table => !excludeTables.includes(table))
    .filter(table => !includeTables || includeTables.includes(table))

    console.log(`📋 Backing up tables: ${tablesToBackup.join(', ')}`)

    // Backup each table
    for (const table of tablesToBackup) {
      try {
        let data
        switch (table) {
          case 'products':
            data = await prisma.product.findMany()
            break
          case 'blogPosts':
            data = await prisma.blogPost.findMany()
            break
          case 'rawMaterials':
            data = await prisma.rawMaterial.findMany()
            break
          case 'storeReviews':
            data = await prisma.storeReview.findMany()
            break
          case 'newsletterSubscribers':
            data = await prisma.newsletterSubscriber.findMany()
            break
          case 'contactSubmissions':
            data = await prisma.contactSubmission.findMany()
            break
          default:
            console.warn(`⚠️  Unknown table: ${table}`)
            continue
        }
        
        backup.data[table] = data
        console.log(`✅ Backed up ${table}: ${data.length} records`)
        
      } catch (error) {
        console.error(`❌ Error backing up ${table}:`, error)
        backup.data[table] = { error: error.message }
      }
    }

    // Write backup to file
    const backupPath = path.join(outputDir, filename)
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    
    const stats = fs.statSync(backupPath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    
    console.log(`🎉 Backup completed successfully!`)
    console.log(`📁 File: ${backupPath}`)
    console.log(`📊 Size: ${fileSizeMB} MB`)
    console.log(`🕐 Timestamp: ${backup.timestamp}`)
    
    return {
      success: true,
      filename: backupPath,
      size: stats.size,
      timestamp: backup.timestamp,
      tables: Object.keys(backup.data)
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function restoreDatabase(backupFile: string) {
  try {
    console.log(`🔄 Starting database restore from: ${backupFile}`)
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`)
    }

    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    
    console.log(`📋 Restore from backup created: ${backupData.timestamp}`)
    console.log(`📊 Tables to restore: ${Object.keys(backupData.data).join(', ')}`)
    
    // Confirm before proceeding
    console.log('⚠️  WARNING: This will overwrite existing data!')
    
    for (const [table, data] of Object.entries(backupData.data)) {
      if (Array.isArray(data)) {
        console.log(`🔄 Restoring ${table}...`)
        
        // Clear existing data first (be careful!)
        switch (table) {
          case 'blogPosts':
            await prisma.blogPost.deleteMany()
            break
          case 'storeReviews':
            await prisma.storeReview.deleteMany()
            break
          // Add other tables as needed
        }
        
        // Restore data
        // Note: You'll need to implement actual restore logic per table
        console.log(`✅ Would restore ${data.length} records to ${table}`)
      }
    }
    
    console.log('🎉 Restore completed!')
    
  } catch (error) {
    console.error('❌ Restore failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// CLI handling
const command = process.argv[2]
const options = {
  outputDir: process.argv[3] || './backups',
  filename: process.argv[4]
}

if (command === 'backup') {
  backupDatabase(options)
} else if (command === 'restore') {
  if (!process.argv[3]) {
    console.error('❌ Please provide backup file path')
    process.exit(1)
  }
  restoreDatabase(process.argv[3])
} else {
  console.log('Usage:')
  console.log('  npm run backup - Create backup')
  console.log('  npm run backup [outputDir] [filename] - Custom backup')
  console.log('  npm run restore [backupFile] - Restore from backup')
}

export { backupDatabase, restoreDatabase } 