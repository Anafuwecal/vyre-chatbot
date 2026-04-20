import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { TransformersEmbeddings } from './utils/embeddings.js';
import * as dotenv from 'dotenv';

dotenv.config();

// VYRE Knowledge Base
const VYRE_KNOWLEDGE = [
  {
    content: `# About VYRE Network

VYRE is a revolutionary streaming culture platform designed to empower creators and build engaged communities through niche channels.

## What Makes VYRE Unique
- Dedicated niche channels for specific content verticals
- Advanced monetization tools for creators
- High-quality streaming up to 4K resolution
- Real-time community engagement features
- Multi-platform distribution capabilities

## Platform Features
- Live streaming with ultra-low latency
- VOD (Video on Demand) library
- Community chat and interactions
- Creator analytics dashboard
- Mobile apps for iOS and Android`,
    metadata: { source: 'vyre-overview', category: 'general' },
  },
  {
    content: `# Getting Started with VYRE

## For Viewers
1. Visit vyre.africa or app.vyre.africa
2. Browse available channels and content
3. Create your free account in seconds
4. Subscribe to your favorite creators
5. Engage with live streams and communities

## For Creators
1. Sign up at app.vyre.africa
2. Complete your profile
3. Apply for creator status
4. Set up your channel branding and description
5. Configure your streaming software (OBS, Streamlabs, XSplit)
6. Go live and start building your audience

## Quick Tips
- Complete your profile to increase discoverability
- Stream consistently to build an audience
- Engage with your community in chat
- Use hashtags to reach new viewers`,
    metadata: { source: 'getting-started', category: 'onboarding' },
  },
  {
    content: `# VYRE Pricing Plans

## Free Tier (Viewers)
- Access to all public channels
- Standard video quality (480p-720p)
- Basic chat features
- Limited VOD access
- Free forever

## Premium Subscription ($9.99/month)
- Ad-free viewing experience
- HD/4K streaming quality
- Unlimited VOD access
- Exclusive content access
- Priority customer support
- Custom emotes and badges
- Download for offline viewing

## Creator Pro ($29.99/month)
- Everything in Premium
- Advanced analytics dashboard
- Custom monetization options
- Priority streaming slots
- Enhanced moderation tools
- Multi-stream capability
- API access for integrations
- Dedicated account manager
- Custom domain support`,
    metadata: { source: 'pricing', category: 'business' },
  },
  {
    content: `# Technical Requirements

## For Streaming
**Internet Connection:**
- Minimum upload speed: 5 Mbps
- Recommended: 10+ Mbps for HD
- Recommended: 20+ Mbps for 4K

**Hardware:**
- CPU: Intel i5/AMD Ryzen 5 or better
- RAM: 8GB minimum, 16GB recommended
- GPU: Dedicated graphics card recommended

**Software:**
- Supported encoders: OBS Studio, Streamlabs OBS, XSplit
- Streaming protocols: RTMP, RTMPS, WebRTC
- Video codecs: H.264, H.265/HEVC
- Audio codecs: AAC, Opus

## For Viewing
**Browser Support:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Internet:**
- Minimum: 3 Mbps for SD
- Recommended: 5 Mbps for HD
- Recommended: 25 Mbps for 4K

**Mobile Apps:**
- iOS 14+ 
- Android 10+

## Recommended Stream Settings
- 4K (3840x2160): 8000-16000 kbps, 30-60 fps
- 1080p (1920x1080): 4500-8000 kbps, 30-60 fps
- 720p (1280x720): 2500-5000 kbps, 30-60 fps
- 480p (854x480): 1000-2500 kbps, 30 fps`,
    metadata: { source: 'technical-specs', category: 'technical' },
  },
  {
    content: `# Creator Monetization Guide

## Available Revenue Streams

### 1. Subscriptions
Monthly recurring revenue from channel subscribers. Creators earn 70% of subscription fees.

### 2. Tips & Donations
One-time contributions from viewers during streams. Creators keep 95% (5% processing fee).

### 3. Pay-Per-View Events
Charge for exclusive live events, premieres, or special content. Set your own pricing.

### 4. Channel Memberships
Offer tiered membership levels with exclusive perks and benefits.

### 5. Sponsorships
Partner with brands for sponsored content and integrations.

## Eligibility Requirements
To enable monetization:
- Have at least 100 followers
- Complete 10 hours of streaming in past 30 days
- Comply with community guidelines
- Verify your identity
- Be 18 years or older
- Set up payment information

## Payout Information
**Payment Methods:**
- Bank transfer (ACH, SWIFT)
- PayPal
- Mobile Money (MTN, Airtel, Vodafone)
- Cryptocurrency (Coming soon)

**Payout Schedule:**
- Frequency: Monthly
- Processing: 1st-5th of each month
- Minimum threshold: $50
- Processing time: 3-5 business days

**Supported Currencies:**
USD, EUR, GBP, NGN, KES, GHS, ZAR

## Tax Information
Creators are responsible for their own taxes. VYRE provides annual earning statements for tax purposes.`,
    metadata: { source: 'monetization', category: 'creator' },
  },
  {
    content: `# Frequently Asked Questions

## Account Questions

**How do I create an account?**
Visit app.vyre.africa and click "Sign Up". Enter your email, create a password, and verify your email.

**Can I change my username?**
Yes, once every 30 days from your account settings.

**How do I delete my account?**
Go to Settings > Account > Delete Account. Note: This action is permanent.

**Is VYRE available in my country?**
VYRE is available globally in 150+ countries.

## Streaming Questions

**What equipment do I need?**
- Computer or mobile device
- Webcam and microphone
- Stable internet (5+ Mbps upload)
- Streaming software (OBS recommended)

**Can I stream from mobile?**
Yes! Use the VYRE mobile app for iOS or Android.

**How long can I stream?**
No time limits. Stream as long as you want.

**Can I save my streams?**
Yes, enable "Save VOD" in your stream settings.

## Payment Questions

**When do I get paid?**
Payouts are processed monthly between the 1st-5th.

**What's the minimum payout?**
$50 USD or equivalent.

**What payment methods are supported?**
Bank transfer, PayPal, and Mobile Money.

## Technical Issues

**My stream is buffering:**
- Check your upload speed (need 5+ Mbps)
- Lower your bitrate in OBS
- Close bandwidth-heavy applications
- Try a wired connection instead of WiFi

**I can't log in:**
- Verify your email and password
- Try password reset
- Clear browser cache
- Disable VPN if using one`,
    metadata: { source: 'faq', category: 'help' },
  },
  {
    content: `# Support & Contact Information

## Get Help

**Help Center**
Visit help.vyre.africa for guides, tutorials, and troubleshooting.

**Email Support**
- General: support@vyre.africa
- Technical issues: tech@vyre.africa
- Billing: billing@vyre.africa
- Creator support: creators@vyre.africa

**Response Times:**
- Free users: Within 48 hours
- Premium: Within 24 hours
- Creator Pro: Within 12 hours
- Emergency: Within 2 hours (Creator Pro only)

## Community

**Discord Community**
Join discord.gg/vyre for:
- Community discussions
- Creator networking
- Feature announcements
- Live support chat

**Social Media**
- Twitter: @vyrenetwork
- Instagram: @vyre.africa
- TikTok: @vyre.africa
- YouTube: VYRE Network

**Creator Forums**
Connect with other creators at community.vyre.africa

## Report Issues

**Content Violations**
Report inappropriate content: moderation@vyre.africa

**Copyright Claims**
DMCA notices: copyright@vyre.africa

**Security Issues**
Report security vulnerabilities: security@vyre.africa

## Business Inquiries
- Partnerships: partners@vyre.africa
- Press & Media: press@vyre.africa
- Advertising: ads@vyre.africa

## Office Hours
**Customer Support:**
- Monday-Friday: 9 AM - 6 PM WAT
- Saturday: 10 AM - 4 PM WAT
- Sunday: Closed (Emergency only)

**Headquarters:**
VYRE Network Ltd.
Lagos, Nigeria`,
    metadata: { source: 'support', category: 'contact' },
  },
];

async function ingestKnowledge() {
  console.log('Starting VYRE knowledge base ingestion...\n');

  try {
    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set in .env file');
    }
    if (!process.env.PINECONE_INDEX) {
      throw new Error('PINECONE_INDEX is not set in .env file');
    }

    // Initialize Pinecone
    console.log('🔌 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX);
    console.log('Connected to Pinecone index:', process.env.PINECONE_INDEX);
    console.log('');

    // Convert to LangChain documents
    const documents = VYRE_KNOWLEDGE.map(
      (item) =>
        new Document({
          pageContent: item.content,
          metadata: item.metadata,
        })
    );

    console.log(`📚 Prepared ${documents.length} knowledge articles`);
    console.log('');

    // Split documents into chunks
    console.log('✂️  Splitting into chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await textSplitter.splitDocuments(documents);
    console.log(`Created ${chunks.length} searchable chunks`);
    console.log('');

    // Create FREE embeddings using HuggingFace model
    console.log('🧠 Initializing FREE embeddings (HuggingFace)...');
    console.log('📥 Downloading model on first run (one-time, ~25MB)...');
    const embeddings = new TransformersEmbeddings({
      modelName: 'Xenova/all-MiniLM-L6-v2', // Free, local model
    });
    console.log('');

    // Upload to Pinecone
    console.log('📤 Uploading to Pinecone...');
    console.log('⏳ This will take about 1-2 minutes...');
    console.log('');

    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace: 'vyre-docs',
      textKey: 'text',
    });

    console.log('');
    console.log('✨ Ingestion complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   • Knowledge articles: ${documents.length}`);
    console.log(`   • Searchable chunks: ${chunks.length}`);
    console.log(`   • Embedding model: HuggingFace (FREE)`);
    console.log(`   • Pinecone namespace: vyre-docs`);
    console.log(`   • Index: ${process.env.PINECONE_INDEX}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎉 Your VYRE chatbot is ready!');
    console.log('💡 Start the server with: npm run dev');
    console.log('');
  } catch (error: any) {
    console.error('');
    console.error('Ingestion failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('API key')) {
      console.error('💡 Tip: Check your PINECONE_API_KEY in the .env file');
    }

    console.error('');
    process.exit(1);
  }
}

// Run ingestion
ingestKnowledge();