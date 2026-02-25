# User Pipeline & Journey

## Complete User Flow

### 1. Discovery & Landing

**Entry Points:**
- Organic search: "shopify blog automation"
- Direct outreach email
- Social media (LinkedIn, Twitter)
- Referral from existing user

**Landing Page Experience:**
```
Hero Section
├─ Headline: "AI-Powered Content for E-commerce"
├─ Subheadline: Value proposition
├─ CTA: "Generate Your First Post Free"
└─ Social Proof: Testimonials, logos, stats

Features Section
├─ AI Content Generation
├─ Keyword Research
├─ Auto-Publishing
└─ Email Campaigns

Pricing Section
├─ Starter: $150/mo
├─ Growth: $250/mo (highlighted)
└─ Scale: $400/mo

Footer
└─ Trust signals, links, contact
```

**Conversion Goals:**
- Primary: Sign up for trial
- Secondary: Book demo call
- Tertiary: Join waitlist

### 2. Sign Up & Account Creation

**Sign Up Form:**
```typescript
interface SignUpData {
  email: string;
  password: string;
  storeName?: string;
  source?: string; // How did you hear about us?
}
```

**Flow:**
1. User enters email
2. Email verification sent
3. User confirms email
4. Account created in Convex
5. Redirect to onboarding

**Technical:**
```typescript
// Convex mutation
export const createUser = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const userId = await ctx.db.insert("users", {
      email,
      password: hashedPassword,
      plan: "starter",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Send welcome email
    await sendWelcomeEmail(email);
    
    return userId;
  },
});
```

### 3. Onboarding Questionnaire

**Purpose:** Gather data to personalize experience

**Step 1: Store Connection**
```
┌─────────────────────────────────┐
│  Connect Your Shopify Store     │
├─────────────────────────────────┤
│                                 │
│  Store URL:                     │
│  [_____________________.myshopi │
│         fy.com]                 │
│                                 │
│  [Connect Store]                │
│  or                             │
│  [I'll do this later]           │
└─────────────────────────────────┘
```

**Step 2: Niche & Products**
```
┌─────────────────────────────────┐
│  Tell us about your store       │
├─────────────────────────────────┤
│                                 │
│  What do you sell?              │
│  [ ] Fashion & Apparel          │
│  [ ] Fitness & Sports           │
│  [ ] Beauty & Skincare          │
│  [ ] Home & Garden              │
│  [ ] Tech & Electronics         │
│  [ ] Other: [___________]       │
│                                 │
│  Top products (optional):       │
│  [_________________________]    │
│  [_________________________]    │
│                                 │
│  [Continue]                     │
└─────────────────────────────────┘
```

**Step 3: Content Goals**
```
┌─────────────────────────────────┐
│  Set your content goals         │
├─────────────────────────────────┤
│                                 │
│  How often do you want to       │
│  publish new content?           │
│                                 │
│  ○ 2-3 posts per week           │
│  ● 1 post per week              │
│  ○ 2 posts per month            │
│  ○ Let AI decide                │
│                                 │
│  Content tone:                  │
│  ○ Professional                 │
│  ● Conversational               │
│  ○ Technical                    │
│                                 │
│  [Continue]                     │
└─────────────────────────────────┘
```

**Step 4: First Content Generation**
```
┌─────────────────────────────────┐
│  Generate your first post       │
├─────────────────────────────────┤
│                                 │
│  🤖 AI is analyzing your store  │
│      and researching keywords   │
│                                 │
│  ┌─────────────────────┐        │
│  │ ████████░░░░░░░ 60% │        │
│  └─────────────────────┘        │
│                                 │
│  This usually takes 30-45s...   │
└─────────────────────────────────┘

↓ (After generation)

┌─────────────────────────────────┐
│  ✓ Your first post is ready!    │
├─────────────────────────────────┤
│                                 │
│  "10 Best Running Shoes for     │
│   Marathon Training in 2026"    │
│                                 │
│  Estimated monthly traffic:     │
│  500-800 visitors               │
│                                 │
│  [Preview Post] [Edit] [Publish]│
│                                 │
│  [Continue to Dashboard]        │
└─────────────────────────────────┘
```

### 4. Payment & Plan Selection

**Trigger:** After onboarding complete

**Pricing Page:**
```
┌──────────────────────────────────────────────┐
│  Choose your plan                            │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐  ┌─────────┐  ┌──────────┐      │
│  │Starter │  │ Growth  │  │  Scale   │      │
│  │  $150  │  │  $250   │  │  $400    │      │
│  │  /mo   │  │  /mo    │  │  /mo     │      │
│  ├────────┤  ├─────────┤  ├──────────┤      │
│  │10 posts│  │25 posts │  │Unlimited │      │
│  │Basic KW│  │Adv. KW  │  │Full suite│      │
│  │1 store │  │3 stores │  │Unlimited │      │
│  │Email   │  │Priority │  │Dedicated │      │
│  │support │  │support  │  │manager   │      │
│  │        │  │Social   │  │Video     │      │
│  │        │  │content  │  │Email camp│      │
│  └────────┘  └─────────┘  └──────────┘      │
│  [Select]    [Select ✓]   [Select]          │
│                                              │
│  💳 7-day trial for $1, then $250/month      │
│     Cancel anytime                           │
└──────────────────────────────────────────────┘
```

**Stripe Integration:**
```typescript
// Create Stripe checkout session
export const createCheckoutSession = mutation({
  args: { 
    userId: v.id("users"),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("scale"))
  },
  handler: async (ctx, { userId, plan }) => {
    const user = await ctx.db.get(userId);
    
    const priceId = {
      starter: "price_starter_monthly",
      growth: "price_growth_monthly",
      scale: "price_scale_monthly",
    }[plan];
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
    });
    
    return session.url;
  },
});
```

### 5. Dashboard - First Login

**Overview Page:**
```
┌─────────────────────────────────────────────┐
│  Welcome to BloomContent! 👋                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ Quick Start ──────────────────────┐    │
│  │ ☐ Connect Shopify store            │    │
│  │ ☑ Generate first blog post         │    │
│  │ ☐ Review and publish                │    │
│  │ ☐ Set up publishing schedule       │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Stats (Last 30 Days)                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │  1   │ │  0   │ │  0   │ │  $0  │      │
│  │Posts │ │Views │ │Clicks│ │Revenue│     │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  Recent Content                             │
│  ┌────────────────────────────────────┐    │
│  │ 10 Best Running Shoes... [Draft]   │    │
│  │ Generated 5 mins ago               │    │
│  │ [Edit] [Preview] [Publish Now]     │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 6. Content Calendar

**User creates/schedules content:**

1. Click "Generate Content"
2. AI suggests topics based on:
   - Product catalog
   - Keyword research
   - Seasonal trends
   - Competitor gaps
3. User reviews title, selects one
4. AI generates full post (1-2 minutes)
5. User edits in WYSIWYG editor
6. Schedule or publish immediately

### 7. Analytics View

**After content published:**

- Track page views (Shopify Analytics API)
- Monitor conversions (UTM tracking)
- Show revenue attribution
- Suggest optimization opportunities

## Retention & Expansion

**Week 1:** Onboarding emails, first post published
**Week 2:** Performance report, tips for optimization
**Week 4:** Upsell to higher plan (if hitting limits)
**Month 3:** Introduce new features (email campaigns, video)

**Expansion Triggers:**
- 80% of content quota used → Suggest upgrade
- Multiple stores added → Suggest multi-store plan
- High engagement → Offer dedicated support

## Churn Prevention

**Risk Signals:**
- No login in 7 days
- No content published in 14 days
- Low engagement with generated content

**Interventions:**
- Email: "We miss you! Here are 3 new post ideas"
- Offer free consultation call
- Provide success stories from similar stores

## Success Metrics

**Activation:** User publishes first post within 48 hours
**Engagement:** 4+ posts per month
**Retention:** Active subscription for 6+ months
**Expansion:** Upgrades plan or adds features within 90 days
