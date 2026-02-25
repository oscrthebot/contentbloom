import { TrendingUp, Eye, Users, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Views"
          value="24.5K"
          change="+18.2%"
          icon={<Eye className="w-5 h-5" />}
        />
        <MetricCard
          title="Unique Visitors"
          value="8.3K"
          change="+12.5%"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg. Read Time"
          value="3m 24s"
          change="+5.1%"
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          title="Conversion Rate"
          value="3.2%"
          change="+0.8%"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Top Performing Content */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Performing Content</h2>
        <div className="space-y-4">
          <PerformanceRow
            title="10 Best Running Shoes for Marathon Training"
            views="3.2K"
            conversions="42"
            revenue="$1,240"
          />
          <PerformanceRow
            title="Yoga Mat Buying Guide: Complete 2026 Edition"
            views="2.8K"
            conversions="35"
            revenue="$890"
          />
          <PerformanceRow
            title="How to Build Muscle with Protein Powder"
            views="2.1K"
            conversions="28"
            revenue="$650"
          />
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
        <div className="space-y-3">
          <TrafficSource source="Organic Search" percentage={65} visitors="15.9K" />
          <TrafficSource source="Direct" percentage={20} visitors="4.9K" />
          <TrafficSource source="Social Media" percentage={10} visitors="2.4K" />
          <TrafficSource source="Referral" percentage={5} visitors="1.2K" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: React.ReactNode }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last month
      </div>
    </div>
  );
}

function PerformanceRow({ 
  title, 
  views, 
  conversions, 
  revenue 
}: { 
  title: string; 
  views: string; 
  conversions: string; 
  revenue: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="flex items-center gap-8 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Views: </span>
          <span className="font-medium">{views}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Conversions: </span>
          <span className="font-medium">{conversions}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Revenue: </span>
          <span className="font-medium text-green-600">{revenue}</span>
        </div>
      </div>
    </div>
  );
}

function TrafficSource({ 
  source, 
  percentage, 
  visitors 
}: { 
  source: string; 
  percentage: number; 
  visitors: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{source}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{visitors} visitors</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
