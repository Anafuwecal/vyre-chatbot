import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';
import { pipeline, Pipeline } from '@xenova/transformers';

export interface TransformersEmbeddingsParams extends EmbeddingsParams {
  modelName?: string;
}

export class TransformersEmbeddings extends Embeddings {
  modelName: string;
  private pipeline: Pipeline | null = null;

  constructor(params?: TransformersEmbeddingsParams) {
    super(params ?? {});
    this.modelName = params?.modelName ?? 'Xenova/all-MiniLM-L6-v2';
  }

  async ensurePipeline() {
    if (!this.pipeline) {
      console.log('🧠 Loading embedding model (first time only)...');
      this.pipeline = await pipeline('feature-extraction', this.modelName);
      console.log('✅ Embedding model loaded');
    }
    return this.pipeline;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const pipe = await this.ensurePipeline();
    const embeddings: number[][] = [];

    for (const text of texts) {
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(output.data));
    }

    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const pipe = await this.ensurePipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}