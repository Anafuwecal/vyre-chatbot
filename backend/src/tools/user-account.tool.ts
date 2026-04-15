import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

// Mock user database - replace with your actual database
interface UserAccount {
  id: string;
  username: string;
  email: string;
  tier: 'free' | 'premium' | 'creator';
  createdAt: string;
  subscriptionStatus: string;
  streamingHours?: number;
  followers?: number;
}

export const userLookupTool = new DynamicStructuredTool({
  name: 'lookup_user_account',
  description:
    'Retrieves user account information when a user asks about their account status, subscription, or profile. Requires user authentication.',
  schema: z.object({
    userId: z.string().describe('The authenticated user ID'),
    queryType: z
      .enum(['subscription', 'profile', 'stats', 'billing'])
      .describe('Type of information requested'),
  }),
  func: async ({ userId, queryType }) => {
    try {
      // Replace with actual API call to your user database
      const response = await axios.get(
        `${process.env.VYRE_API_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VYRE_API_KEY}`,
          },
        }
      );

      const user: UserAccount = response.data;

      switch (queryType) {
        case 'subscription':
          return `User: ${user.username}\nTier: ${user.tier}\nStatus: ${user.subscriptionStatus}\nMember since: ${user.createdAt}`;

        case 'profile':
          return `Username: ${user.username}\nEmail: ${user.email}\nAccount type: ${user.tier}\nCreated: ${user.createdAt}`;

        case 'stats':
          if (user.tier === 'creator') {
            return `Creator Stats:\nFollowers: ${user.followers || 0}\nStreaming hours: ${user.streamingHours || 0}\nTier: ${user.tier}`;
          }
          return `This feature is only available for creator accounts.`;

        case 'billing':
          return `Account: ${user.username}\nTier: ${user.tier}\nStatus: ${user.subscriptionStatus}\nNext billing date: [contact billing for details]`;

        default:
          return 'Unable to retrieve account information.';
      }
    } catch (error) {
      return `Unable to access account information. Please ensure you're logged in or contact support@vyre.africa`;
    }
  },
});