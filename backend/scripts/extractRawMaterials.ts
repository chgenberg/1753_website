import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function extractPDFContent() {
  try {
    // Read the PDF file
    const pdfPath = path.join(__dirname, '../../frontend/public/ravaror_hud.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Parse PDF
    const data = await pdf(dataBuffer);
    
    console.log('📄 PDF Content:');
    console.log('=================');
    console.log(data.text);
    console.log('=================');
    console.log(`Total pages: ${data.numpages}`);
    console.log(`Total text length: ${data.text.length}`);
    
    // Save to a text file for easier review
    const outputPath = path.join(__dirname, 'extracted_raw_materials.txt');
    fs.writeFileSync(outputPath, data.text, 'utf-8');
    console.log(`\n✅ Saved extracted text to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error extracting PDF:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractPDFContent(); 