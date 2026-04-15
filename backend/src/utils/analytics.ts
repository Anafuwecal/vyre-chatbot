export function trackQuery(query: string, response: string, duration: number) {
  // Log to your analytics service
  console.log({
    query,
    responseLength: response.length,
    duration,
    timestamp: new Date(),
  });
}