import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';
import { 
  pipeline, 
  FeatureExtractionPipeline,
  env
} from '@xenova/transformers';

export interface TransformersEmbeddingsParams extends EmbeddingsParams {
  modelName?: string;
}

export class TransformersEmbeddings extends Embeddings {
  modelName: string;
  private pipeline: FeatureExtractionPipeline | null = null;

  constructor(params?: TransformersEmbeddingsParams) {
    super(params ?? {});
    this.modelName = params?.modelName ?? 'Xenova/all-MiniLM-L6-v2';
    
    // ✅ Configure for server environment
    env.allowLocalModels = false;
    env.useBrowserCache = false;
  }

  async ensurePipeline(): Promise<FeatureExtractionPipeline> {
    if (!this.pipeline) {
      console.log('🧠 Loading embedding model (first time only)...');
      
      // ✅ FIX: Properly type the pipeline
      this.pipeline = await pipeline(
        'feature-extraction', 
        this.modelName
      ) as FeatureExtractionPipeline;
      
      console.log('✅ Embedding model loaded');
    }
    return this.pipeline;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const pipe = await this.ensurePipeline();
    const embeddings: number[][] = [];

    for (const text of texts) {
      // ✅ FIX: Properly handle the output
      const output = await pipe(text, { 
        pooling: 'mean', 
        normalize: true 
      });
      
      embeddings.push(Array.from(output.data as Float32Array));
    }

    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const pipe = await this.ensurePipeline();
    
    const output = await pipe(text, { 
      pooling: 'mean', 
      normalize: true 
    });
    
    return Array.from(output.data as Float32Array);
  }
}