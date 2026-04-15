import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export function logChatInteraction(
  userId: string,
  query: string,
  response: string,
  duration: number
) {
  logger.info('chat_interaction', {
    userId,
    queryLength: query.length,
    responseLength: response.length,
    duration,
    timestamp: new Date().toISOString(),
  });
}