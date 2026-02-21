#!/usr/bin/env ts-node
/**
 * ContentBloom - Add Lead CLI
 * 
 * Quick way to add leads manually:
 * npx ts-node cli/add-lead.ts --domain example.com --email owner@example.com --niche "organic skincare"
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

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
  createdAt: string;
}

function loadLeads(): Lead[] {
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function addLead(
  domain: string,
  email: string,
  niche: string,
  options: {
    storeName?: string;
    language?: 'en' | 'es' | 'de' | 'fr';
    score?: number;
    notes?: string;
  } = {}
): Lead {
  const leads = loadLeads();
  
  // Check for duplicates
  if (leads.some(l => l.domain === domain || l.email === email)) {
    throw new Error(`Lead already exists: ${domain} or ${email}`);
  }
  
  const lead: Lead = {
    id: uuidv4(),
    domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    storeName: options.storeName || domain.split('.')[0],
    niche,
    email,
    language: options.language || 'en',
    status: 'new',
    score: options.score || 70,
    notes: options.notes ? [options.notes] : [],
    createdAt: new Date().toISOString()
  };
  
  leads.push(lead);
  saveLeads(leads);
  
  return lead;
}

function listLeads(status?: string): void {
  const leads = loadLeads();
  const filtered = status ? leads.filter(l => l.status === status) : leads;
  
  console.log('\n📋 ContentBloom Leads');
  console.log('=====================');
  console.log(`Total: ${leads.length} | Showing: ${filtered.length}\n`);
  
  if (filtered.length === 0) {
    console.log('No leads found.\n');
    return;
  }
  
  filtered.forEach(l => {
    console.log(`${l.status === 'new' ? '🆕' : l.status === 'converted' ? '✅' : '📧'} ${l.storeName}`);
    console.log(`   Domain: ${l.domain}`);
    console.log(`   Email: ${l.email}`);
    console.log(`   Niche: ${l.niche}`);
    console.log(`   Status: ${l.status} | Score: ${l.score}`);
    console.log('');
  });
}

// Parse CLI arguments
const args = process.argv.slice(2);

if (args.includes('--list') || args.includes('-l')) {
  const statusIdx = args.indexOf('--status');
  const status = statusIdx !== -1 ? args[statusIdx + 1] : undefined;
  listLeads(status);
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ContentBloom Lead Manager

Usage:
  npx ts-node cli/add-lead.ts [options]

Options:
  --domain <domain>       Store domain (required for add)
  --email <email>         Contact email (required for add)
  --niche <niche>         Store niche (required for add)
  --name <name>           Store name (optional, derived from domain)
  --language <lang>       Language: en, es, de, fr (default: en)
  --score <score>         Lead score 0-100 (default: 70)
  --notes <notes>         Initial notes
  
  --list, -l              List all leads
  --status <status>       Filter by status (with --list)
  
  --help, -h              Show this help

Examples:
  # Add a lead
  npx ts-node cli/add-lead.ts --domain example.com --email hi@example.com --niche "organic skincare"
  
  # Add with all options
  npx ts-node cli/add-lead.ts --domain myshop.com --email owner@myshop.com --niche "pet supplies" --name "MyShop" --language es --score 85
  
  # List all leads
  npx ts-node cli/add-lead.ts --list
  
  # List only new leads
  npx ts-node cli/add-lead.ts --list --status new
`);
} else {
  // Add lead mode
  const domainIdx = args.indexOf('--domain');
  const emailIdx = args.indexOf('--email');
  const nicheIdx = args.indexOf('--niche');
  
  if (domainIdx === -1 || emailIdx === -1 || nicheIdx === -1) {
    console.error('Error: --domain, --email, and --niche are required');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  const domain = args[domainIdx + 1];
  const email = args[emailIdx + 1];
  const niche = args[nicheIdx + 1];
  
  const nameIdx = args.indexOf('--name');
  const langIdx = args.indexOf('--language');
  const scoreIdx = args.indexOf('--score');
  const notesIdx = args.indexOf('--notes');
  
  try {
    const lead = addLead(domain, email, niche, {
      storeName: nameIdx !== -1 ? args[nameIdx + 1] : undefined,
      language: langIdx !== -1 ? args[langIdx + 1] as any : undefined,
      score: scoreIdx !== -1 ? parseInt(args[scoreIdx + 1]) : undefined,
      notes: notesIdx !== -1 ? args[notesIdx + 1] : undefined
    });
    
    console.log(`\n✅ Lead added successfully!`);
    console.log(`   ID: ${lead.id}`);
    console.log(`   Store: ${lead.storeName}`);
    console.log(`   Domain: ${lead.domain}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Niche: ${lead.niche}`);
    console.log(`   Score: ${lead.score}\n`);
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}
