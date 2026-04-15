import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { TransformersEmbeddings } from '../utils/embeddings.js';
import { config } from '../config/env.js';
import { z } from 'zod';

let vectorStore: PineconeStore | null = null;

export async function initializePinecone() {
  if (vectorStore) return vectorStore;

  console.log('🔌 Initializing Pinecone vector store...');
  
  const pinecone = new Pinecone({
    apiKey: config.pinecone.apiKey,
  });

  const index = pinecone.Index(config.pinecone.index);

  const embeddings = new TransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2',
  });

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: 'vyre-docs',
  });

  console.log('✅ Pinecone vector store ready\n');
  return vectorStore;
}

export const pineconeSearchTool = new DynamicStructuredTool({
  name: 'search_documentation',
  description: 'Searches VYRE.AFRICA documentation and knowledge base. Returns information specifically about VYRE.AFRICA platform.',
  schema: z.object({
    query: z.string().describe('Search query about VYRE.AFRICA'),
    k: z.number().optional().default(4)
  }),
  func: async ({ query, k = 4 }) => {
    console.log('🔍 Searching VYRE.AFRICA documentation for:', query);

    if (!vectorStore) {
      await initializePinecone();
    }

    const results = await vectorStore!.similaritySearch(query, k);
    console.log(`📊 Found ${results.length} results`);

    if (results.length === 0) {
      return 'No relevant information found in VYRE.AFRICA documentation.';
    }

    // Filter and clean content - only include VYRE.AFRICA specific content
    const cleanContent = results
      .map((doc) => doc.pageContent.trim())
      .filter((content) => {
        // Basic filter: content should mention VYRE, Africa, streaming, or fintech
        const lowerContent = content.toLowerCase();
        return lowerContent.includes('vyre') || 
               lowerContent.includes('africa') || 
               lowerContent.includes('stream') ||
               lowerContent.includes('fintech');
      })
      .join('\n\n');

    console.log('📄 Returning', cleanContent.length, 'characters');
    
    if (!cleanContent) {
      return 'No relevant VYRE.AFRICA information found for this query.';
    }
    
    return `Information about VYRE.AFRICA:\n\n${cleanContent}`;
  }
});