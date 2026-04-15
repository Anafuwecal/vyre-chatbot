import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { TransformersEmbeddings } from './utils/embeddings.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom text file loader
async function loadTextFile(filePath: string): Promise<Document[]> {
  const text = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  
  return [
    new Document({
      pageContent: text,
      metadata: {
        source: filename,
        filePath: filePath,
      },
    }),
  ];
}

async function loadDocumentsFromDirectory(dirPath: string): Promise<Document[]> {
  const documents: Document[] = [];

  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    console.log(`💡 Creating it now...\n`);
    fs.mkdirSync(dirPath, { recursive: true });
    return documents;
  }

  const files = fs.readdirSync(dirPath);
  console.log(`📂 Found ${files.length} item(s) in: ${dirPath}\n`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      console.log(`  ⏭️  Skipping directory: ${file}`);
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    console.log(`  📋 Processing: ${file} (${ext})`);

    try {
      let docs: Document[] = [];

      switch (ext) {
        case '.pdf':
          console.log(`     Loading as PDF...`);
          try {
            const loader = new PDFLoader(filePath, {
              splitPages: false,
            });
            docs = await loader.load();
          } catch (pdfError: any) {
            console.error(`     ❌ PDF Error: ${pdfError.message}`);
            docs = [
              new Document({
                pageContent: `[PDF file: ${file} - content could not be extracted]`,
                metadata: { source: file, filePath, error: 'pdf_parse_failed' },
              }),
            ];
          }
          break;

        case '.txt':
        case '.md':
          console.log(`     Loading as text...`);
          docs = await loadTextFile(filePath);
          break;

        default:
          console.log(`     ⏭️  Skipping unsupported format\n`);
          continue;
      }

      docs.forEach((doc) => {
        if (!doc.metadata.source) {
          doc.metadata.source = file;
        }
        if (!doc.metadata.filePath) {
          doc.metadata.filePath = filePath;
        }
      });

      documents.push(...docs);
      console.log(`     ✅ Loaded ${docs.length} document(s)\n`);
    } catch (error: any) {
      console.error(`     ❌ Error: ${error.message}\n`);
    }
  }

  return documents;
}

async function ingestDocuments() {
  console.log('🚀 Starting VYRE document ingestion...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not set in .env');
    }
    if (!process.env.PINECONE_INDEX) {
      throw new Error('PINECONE_INDEX not set in .env');
    }

    console.log('🔌 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX);
    console.log(`✅ Connected to index: ${process.env.PINECONE_INDEX}\n`);

    // FIX: Correct path to backend/docs
    // __dirname is: backend/src
    // We need: backend/docs
    const docsPath = path.join(__dirname, '..', 'docs'); // ← FIXED!
    
    console.log(`📚 Looking for documents in:\n   ${docsPath}\n`);

    const rawDocs = await loadDocumentsFromDirectory(docsPath);

    if (rawDocs.length === 0) {
      console.log('⚠️  No documents found!');
      console.log('\n💡 Add files to: backend/docs/');
      console.log('   Supported formats:');
      console.log('   • PDF (.pdf)');
      console.log('   • Text (.txt)');
      console.log('   • Markdown (.md)\n');
      
      const examplePath = path.join(docsPath, 'example.txt');
      const exampleContent = `# VYRE Platform Overview

VYRE is a streaming culture platform for creators.

## Key Features:
- Live streaming up to 4K
- Monetization tools
- Community engagement
- Mobile apps

## Pricing:
- Free tier available
- Premium: $9.99/month
- Creator Pro: $29.99/month

For more info, visit vyre.africa`;

      fs.writeFileSync(examplePath, exampleContent);
      console.log(`✅ Created example: ${examplePath}`);
      console.log('\n🔄 Run "npm run ingest" again.\n');
      return;
    }

    console.log(`✅ Loaded ${rawDocs.length} document(s)\n`);

    console.log('📋 Documents loaded:');
    rawDocs.forEach((doc, i) => {
      const preview = doc.pageContent.substring(0, 80).replace(/\n/g, ' ');
      console.log(`   ${i + 1}. ${doc.metadata.source}`);
      console.log(`      "${preview}..."`);
    });
    console.log('');

    console.log('✂️  Splitting into chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await textSplitter.splitDocuments(rawDocs);
    console.log(`✅ Created ${chunks.length} chunks\n`);

    console.log('🧠 Creating embeddings (FREE HuggingFace)...');
    console.log('📥 Model: Xenova/all-MiniLM-L6-v2\n');
    
    const embeddings = new TransformersEmbeddings({
      modelName: 'Xenova/all-MiniLM-L6-v2',
    });

    console.log('📤 Uploading to Pinecone...');
    console.log('⏳ Please wait...\n');

    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: 'vyre-docs',
      textKey: 'text',
    });

    console.log('✨ Ingestion complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   • Documents: ${rawDocs.length}`);
    console.log(`   • Chunks: ${chunks.length}`);
    console.log(`   • Namespace: vyre-docs`);
    console.log(`   • Index: ${process.env.PINECONE_INDEX}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Ready! Start server: npm run dev\n');
  } catch (error: any) {
    console.error('❌ Ingestion failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    
    if (error.stack) {
      console.error('\nStack:');
      console.error(error.stack);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

ingestDocuments();