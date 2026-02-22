import { query } from "./_generated/server";

// Aggregated stats for external dashboard
export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").collect();
    const outreach = await ctx.db.query("outreachLog").collect();

    // Lead stats
    const pipeline: Record<string, number> = {};
    for (const l of leads) {
      pipeline[l.status] = (pipeline[l.status] || 0) + 1;
    }

    // Outreach stats
    const sent = outreach.filter(o => o.status === "sent").length;
    const opened = outreach.filter(o => o.status === "opened").length;
    const replied = outreach.filter(o => o.status === "replied").length;
    const bounced = outreach.filter(o => o.status === "bounced").length;

    // Recent outreach (last 50)
    const recentOutreach = outreach
      .sort((a, b) => (b.sentAt > a.sentAt ? 1 : -1))
      .slice(0, 50)
      .map(o => ({
        email: o.email,
        subject: o.subject,
        type: o.type,
        status: o.status,
        sentAt: o.sentAt,
      }));

    // Recent leads (last 10 by lastContact)
    const recentLeads = leads
      .filter(l => l.lastContact)
      .sort((a, b) => (b.lastContact! > a.lastContact! ? 1 : -1))
      .slice(0, 10)
      .map(l => ({
        storeName: l.storeName,
        domain: l.domain,
        niche: l.niche,
        status: l.status,
        lastContact: l.lastContact,
      }));

    return {
      totalLeads: leads.length,
      pipeline,
      outreach: { sent, opened, replied, bounced, total: outreach.length },
      recentOutreach,
      recentLeads,
    };
  },
});
