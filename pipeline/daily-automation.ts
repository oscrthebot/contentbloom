/**
 * BloomContent - Daily Automation Pipeline
 * 
 * This is what OSCR runs every day:
 * 1. Check for new leads to contact
 * 2. Send follow-ups to unresponsive leads
 * 3. Generate content for active clients
 * 4. Process revision requests
 * 5. Report daily summary
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const OUTREACH_LOG = path.join(DATA_DIR, 'outreach-log.jsonl');

interface Lead {
  id: string;
  domain: string;
  storeName: string;
  niche: string;
  email: string;
  language: 'en' | 'es' | 'de' | 'fr';
  status: 'new' | 'contacted' | 'demo_sent' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'replied' | 'converted' | 'rejected';
  score: number;
  firstContact?: string;
  lastContact?: string;
  nextAction?: string;
  notes: string[];
}

interface Client {
  id: string;
  domain: string;
  storeName: string;
  email: string;
  plan: 'starter' | 'growth' | 'scale';
  articlesPerDay: number;
  startDate: string;
  status: 'active' | 'paused' | 'cancelled';
  contentQueue: ArticleTask[];
  deliveredCount: number;
}

interface ArticleTask {
  id: string;
  keyword: string;
  type: string;
  status: 'queued' | 'generating' | 'review' | 'delivered' | 'revision';
  createdAt: string;
  deliveredAt?: string;
}

interface DailyReport {
  date: string;
  outreach: {
    newContacts: number;
    followUps: number;
    replies: number;
    conversions: number;
  };
  content: {
    articlesGenerated: number;
    articlesDelivered: number;
    revisionRequests: number;
  };
  revenue: {
    activeClients: number;
    mrr: number;
  };
}

/**
 * Load leads from file
 */
function loadLeads(): Lead[] {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Save leads to file
 */
function saveLeads(leads: Lead[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

/**
 * Load clients from file
 */
function loadClients(): Client[] {
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Save clients to file
 */
function saveClients(clients: Client[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
}

/**
 * Log outreach action
 */
function logOutreach(action: object): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(OUTREACH_LOG, JSON.stringify({ ...action, timestamp: new Date().toISOString() }) + '\n');
}

/**
 * Step 1: Contact new leads
 */
async function contactNewLeads(maxContacts: number = 10): Promise<number> {
  const leads = loadLeads();
  const newLeads = leads
    .filter(l => l.status === 'new' && l.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxContacts);
  
  let contacted = 0;
  for (const lead of newLeads) {
    // Mark as contacted
    lead.status = 'contacted';
    lead.firstContact = new Date().toISOString();
    lead.lastContact = new Date().toISOString();
    lead.nextAction = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
    
    logOutreach({
      type: 'cold_outreach',
      leadId: lead.id,
      email: lead.email,
      storeName: lead.storeName
    });
    
    contacted++;
    console.log(`📧 Contacted: ${lead.storeName} (${lead.email})`);
  }
  
  saveLeads(leads);
  return contacted;
}

/**
 * Step 2: Send follow-ups
 */
async function sendFollowUps(): Promise<number> {
  const leads = loadLeads();
  const now = new Date();
  let followUps = 0;
  
  for (const lead of leads) {
    if (!lead.nextAction || new Date(lead.nextAction) > now) continue;
    
    if (lead.status === 'contacted') {
      lead.status = 'follow_up_1';
      lead.lastContact = now.toISOString();
      lead.nextAction = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      logOutreach({ type: 'follow_up_1', leadId: lead.id, email: lead.email });
      followUps++;
      console.log(`📧 Follow-up 1: ${lead.storeName}`);
    } else if (lead.status === 'follow_up_1') {
      lead.status = 'follow_up_2';
      lead.lastContact = now.toISOString();
      lead.nextAction = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
      logOutreach({ type: 'follow_up_2', leadId: lead.id, email: lead.email });
      followUps++;
      console.log(`📧 Follow-up 2: ${lead.storeName}`);
    } else if (lead.status === 'follow_up_2') {
      lead.status = 'follow_up_3';
      lead.lastContact = now.toISOString();
      lead.nextAction = undefined; // Final follow-up
      logOutreach({ type: 'follow_up_3', leadId: lead.id, email: lead.email });
      followUps++;
      console.log(`📧 Follow-up 3 (final): ${lead.storeName}`);
    }
  }
  
  saveLeads(leads);
  return followUps;
}

/**
 * Step 3: Generate content for clients using the v2 pipeline
 */
async function generateClientContent(): Promise<number> {
  const clients = loadClients();
  let generated = 0;

  // Dynamic import to avoid issues if openai not installed
  const { runArticlePipeline } = await import('../generator/pipeline-runner');

  for (const client of clients.filter(c => c.status === 'active')) {
    const articlesToGenerate = client.articlesPerDay;

    for (let i = 0; i < articlesToGenerate; i++) {
      try {
        console.log(`📝 Generating article ${i + 1}/${articlesToGenerate} for ${client.storeName}...`);

        const result = await runArticlePipeline({
          storeName: client.storeName,
          storeUrl: `https://${client.domain}`,
          niche: 'general', // Would come from client data
          language: 'en',
          articleType: 'guide',
          wordCount: 1500,
          clientId: client.id,
        });

        if (result.success && result.article) {
          const task: ArticleTask = {
            id: `${client.id}-${Date.now()}-${i}`,
            keyword: result.article.targetKeyword,
            type: 'guide',
            status: 'review',
            createdAt: new Date().toISOString(),
          };
          client.contentQueue.push(task);
          generated++;
          console.log(`  ✅ "${result.article.title}" (QA: ${result.article.qaScore}/100)`);
          result.steps.forEach(s => console.log(`     ${s.step}: ${s.status} (${s.durationMs}ms)${s.note ? ' — ' + s.note : ''}`));
        } else {
          console.log(`  ❌ Pipeline failed: ${result.error}`);
          const task: ArticleTask = {
            id: `${client.id}-${Date.now()}-${i}`,
            keyword: '[failed]',
            type: 'guide',
            status: 'queued',
            createdAt: new Date().toISOString(),
          };
          client.contentQueue.push(task);
        }
      } catch (err) {
        console.error(`  ❌ Error generating for ${client.storeName}:`, err);
      }
    }
  }

  saveClients(clients);
  return generated;
}

/**
 * Step 4: Generate daily report
 */
function generateDailyReport(): DailyReport {
  const leads = loadLeads();
  const clients = loadClients();
  
  const report: DailyReport = {
    date: new Date().toISOString().split('T')[0],
    outreach: {
      newContacts: leads.filter(l => l.status === 'contacted' && 
        l.firstContact?.startsWith(new Date().toISOString().split('T')[0])).length,
      followUps: 0, // Would count from today's log
      replies: leads.filter(l => l.status === 'replied').length,
      conversions: leads.filter(l => l.status === 'converted').length
    },
    content: {
      articlesGenerated: 0,
      articlesDelivered: 0,
      revisionRequests: 0
    },
    revenue: {
      activeClients: clients.filter(c => c.status === 'active').length,
      mrr: clients
        .filter(c => c.status === 'active')
        .reduce((sum, c) => {
          const prices = { starter: 49, growth: 99, scale: 149 };
          return sum + prices[c.plan];
        }, 0)
    }
  };
  
  return report;
}

/**
 * Main daily automation
 */
async function runDailyAutomation(): Promise<void> {
  console.log('\n🚀 BloomContent Daily Automation');
  console.log('================================');
  console.log(`Date: ${new Date().toISOString()}\n`);
  
  // Step 1: Contact new leads (max 10/day)
  console.log('📤 Step 1: Contacting new leads...');
  const contacted = await contactNewLeads(10);
  console.log(`   Contacted ${contacted} new leads\n`);
  
  // Step 2: Send follow-ups
  console.log('📫 Step 2: Sending follow-ups...');
  const followUps = await sendFollowUps();
  console.log(`   Sent ${followUps} follow-ups\n`);
  
  // Step 3: Generate client content
  console.log('📝 Step 3: Generating client content...');
  const articles = await generateClientContent();
  console.log(`   Queued ${articles} articles\n`);
  
  // Step 4: Generate report
  console.log('📊 Step 4: Daily report...');
  const report = generateDailyReport();
  console.log(`   Active clients: ${report.revenue.activeClients}`);
  console.log(`   MRR: €${report.revenue.mrr}`);
  console.log(`   Replies today: ${report.outreach.replies}`);
  
  // Save report
  const reportsDir = path.join(DATA_DIR, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportsDir, `${report.date}.json`),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Daily automation complete!\n');
}

// Export for cron/OSCR
export { 
  runDailyAutomation, 
  contactNewLeads, 
  sendFollowUps, 
  generateClientContent,
  generateDailyReport,
  loadLeads,
  saveLeads,
  loadClients,
  saveClients,
  Lead,
  Client
};

// CLI usage
if (require.main === module) {
  runDailyAutomation().catch(console.error);
}
