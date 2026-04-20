import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export const scheduleStreamTool = new DynamicStructuredTool({
  name: 'schedule_stream',
  description:
    'Helps creators schedule upcoming streams by checking availability and creating calendar events.',
  schema: z.object({
    creatorId: z.string().describe('Creator user ID'),
    date: z.string().describe('Proposed stream date (YYYY-MM-DD)'),
    time: z.string().describe('Proposed stream time (HH:MM)'),
    title: z.string().describe('Stream title'),
    duration: z.number().describe('Duration in minutes'),
  }),
  func: async ({ creatorId, date, time, title, duration }) => {
    // Mock scheduling logic - integrate with calendar service
    const scheduledDateTime = new Date(`${date}T${time}`);

    return `Stream scheduled successfully!

**Stream Details:**
- Title: ${title}
- Date: ${scheduledDateTime.toLocaleDateString()}
- Time: ${scheduledDateTime.toLocaleTimeString()}
- Duration: ${duration} minutes

Your stream will be promoted 24 hours before going live. You'll receive a reminder notification 30 minutes before start time.

**Next steps:**
1. Prepare your content and test your setup
2. Promote on social media using #VYRELive
3. Go live at your scheduled time

Good luck!`;
  },
});