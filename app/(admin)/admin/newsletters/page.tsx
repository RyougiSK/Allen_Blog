import { fetchCampaignStats } from "@/lib/actions/email-analytics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Mail, MousePointerClick, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewslettersPage() {
  const campaigns = await fetchCampaignStats();

  return (
    <div className="w-full max-w-6xl px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Newsletter Analytics</h1>
      <p className="text-sm text-text-tertiary mb-8">
        Track open rates and click rates for sent newsletters.
      </p>

      {campaigns.length === 0 ? (
        <Card>
          <p className="text-sm text-text-tertiary text-center py-8">
            No newsletters sent yet. Publish an article to trigger a newsletter.
          </p>
        </Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Article</th>
                <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Sent</th>
                <th className="text-center text-xs font-medium text-text-tertiary px-4 py-3">Recipients</th>
                <th className="text-center text-xs font-medium text-text-tertiary px-4 py-3">Opens</th>
                <th className="text-center text-xs font-medium text-text-tertiary px-4 py-3">Clicks</th>
                <th className="text-center text-xs font-medium text-text-tertiary px-4 py-3">Open Rate</th>
                <th className="text-center text-xs font-medium text-text-tertiary px-4 py-3">Click Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-text-primary">{campaign.article_title}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary whitespace-nowrap">
                    {format(parseISO(campaign.sent_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-3 w-3 text-text-quaternary" />
                      <span className="text-sm text-text-secondary">{campaign.recipient_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3 text-text-quaternary" />
                      <span className="text-sm text-text-secondary">{campaign.open_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick className="h-3 w-3 text-text-quaternary" />
                      <span className="text-sm text-text-secondary">{campaign.click_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={campaign.open_rate >= 30 ? "success" : campaign.open_rate > 0 ? "warning" : "default"}>
                      {campaign.open_rate}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={campaign.click_rate >= 5 ? "success" : campaign.click_rate > 0 ? "warning" : "default"}>
                      {campaign.click_rate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
