import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupPinecone() {
  console.log('🔧 Setting up Pinecone index...\n');

  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX || 'vyre-knowledge';

    // Check if index exists
    console.log(`📋 Checking for index: ${indexName}...`);
    const existingIndexes = await pinecone.listIndexes();
    
    const indexExists = existingIndexes.indexes?.some(
      (index) => index.name === indexName
    );

    if (indexExists) {
      console.log(`✅ Index "${indexName}" already exists!`);
      console.log('');
      console.log('You can now run: npm run ingest-simple');
      console.log('');
      return;
    }

    // Create new index
    console.log(`📦 Creating new index: ${indexName}...`);
    console.log('⏳ This will take about 1-2 minutes...\n');

    await pinecone.createIndex({
      name: indexName,
      dimension: 384, // all-MiniLM-L6-v2 uses 384 dimensions
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });

    console.log('✅ Index created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Index Details:');
    console.log(`   • Name: ${indexName}`);
    console.log(`   • Dimension: 384`);
    console.log(`   • Metric: cosine`);
    console.log(`   • Type: Serverless`);
    console.log(`   • Cloud: AWS (us-east-1)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⏳ Waiting 60 seconds for index to be ready...');
    
    // Wait for index to be ready
    await new Promise((resolve) => setTimeout(resolve, 60000));

    console.log('');
    console.log('🎉 Setup complete!');
    console.log('💡 Next step: npm run ingest-simple');
    console.log('');
  } catch (error: any) {
    console.error('');
    console.error('❌ Setup failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('already exists')) {
      console.log('✅ Good news: The index already exists!');
      console.log('💡 You can proceed with: npm run ingest-simple');
      console.log('');
    } else if (error.message.includes('PINECONE_API_KEY')) {
      console.error('💡 Tip: Make sure PINECONE_API_KEY is set in .env');
      console.error('   Get your key at: https://app.pinecone.io/');
      console.error('');
    } else {
      console.error('💡 Try creating the index manually at:');
      console.error('   https://app.pinecone.io/');
      console.error('');
      console.error('   Settings:');
      console.error('   - Name: vyre-knowledge');
      console.error('   - Dimensions: 384');
      console.error('   - Metric: cosine');
      console.error('   - Cloud: AWS');
      console.error('   - Region: us-east-1');
      console.error('');
    }

    process.exit(1);
  }
}

setupPinecone();