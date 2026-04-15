import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeWebsite(url: string): Promise<string> {
  try {
    console.log(`🌐 Scraping: ${url}`);
    
    // Only allow VYRE domains
    if (!url.includes('vyre.africa')) {
      console.warn('⚠️ Blocked non-VYRE domain:', url);
      return '';
    }
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, iframe, noscript').remove();

    let content = '';
    const contentSelectors = ['main', 'article', '[role="main"]', '.content', '#content', 'body'];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text();
        break;
      }
    }

    content = content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();

    if (content.length > 2000) {
      content = content.substring(0, 2000);
    }

    console.log(`✅ Scraped ${content.length} characters from VYRE website`);
    return content;

  } catch (error: any) {
    console.error(`❌ Scraping failed:`, error.message);
    return '';
  }
}

export const websiteSearchTool = new DynamicStructuredTool({
  name: 'search_vyre_website',
  description: 'Searches VYRE.AFRICA and APP.VYRE.AFRICA websites ONLY for current public information about VYRE platform.',
  schema: z.object({
    query: z.string().describe('What to search for on VYRE website'),
    url: z.string().optional().default('https://vyre.africa').describe('Must be vyre.africa or app.vyre.africa')
  }),
  func: async ({ query, url = 'https://vyre.africa' }) => {
    console.log(`🔍 VYRE website search: "${query}"`);
    
    // Force VYRE domains only
    if (!url.includes('vyre.africa')) {
      url = 'https://vyre.africa';
    }
    
    const content = await scrapeWebsite(url);
    
    if (!content) {
      return 'Unable to access VYRE.AFRICA website at this time. Visit vyre.africa directly for current information.';
    }
    
    return `Current information from VYRE.AFRICA website:\n\n${content}`;
  }
});

export const googleSearchTool = new DynamicStructuredTool({
  name: 'google_search_vyre',
  description: 'Fallback - Not used',
  schema: z.object({
    query: z.string()
  }),
  func: async () => {
    return 'For current VYRE.AFRICA information, visit vyre.africa';
  }
});