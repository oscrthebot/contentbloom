import { TrendingUp, FileText, Eye, MousePointerClick } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Content"
          value="24"
          change="+12%"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Page Views"
          value="12.5K"
          change="+23%"
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="Click Rate"
          value="3.2%"
          change="+0.8%"
          icon={<MousePointerClick className="w-5 h-5" />}
        />
        <StatCard
          title="Revenue Impact"
          value="$2,450"
          change="+18%"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Recent Content */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
        <div className="space-y-4">
          <ContentRow
            title="10 Best Running Shoes for 2026"
            status="published"
            views="1.2K"
            date="2 days ago"
          />
          <ContentRow
            title="How to Choose the Perfect Yoga Mat"
            status="published"
            views="890"
            date="3 days ago"
          />
          <ContentRow
            title="Top 5 Protein Powders for Muscle Gain"
            status="scheduled"
            views="-"
            date="Scheduled for tomorrow"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: React.ReactNode }) {
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

function ContentRow({ title, status, views, date }: { title: string; status: string; views: string; date: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">{views} views</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'published' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}
