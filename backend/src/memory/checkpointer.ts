import { MemorySaver } from '@langchain/langgraph';
import { BaseCheckpointSaver } from '@langchain/langgraph';

// Use built-in memory saver for development
export const memorySaver = new MemorySaver();

// For production, use PostgreSQL checkpointer
// npm install @langchain/langgraph-checkpoint-postgres

/*
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export const postgresCheckpointer = PostgresSaver.fromPool(pool);
*/