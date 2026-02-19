import { Plus, Calendar, Filter } from "lucide-react";

export default function ContentPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition">
          <Plus size={20} />
          Generate Content
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
          <Filter size={18} />
          Filter
        </button>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
          <Calendar size={18} />
          This Week
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        <ContentCard
          title="10 Best Running Shoes for Marathon Training"
          type="blog"
          status="published"
          date="Feb 17, 2026"
          keywords={["running shoes", "marathon", "training"]}
        />
        <ContentCard
          title="Yoga Mat Buying Guide: Complete 2026 Edition"
          type="blog"
          status="published"
          date="Feb 16, 2026"
          keywords={["yoga mat", "buying guide", "fitness"]}
        />
        <ContentCard
          title="Top 5 Protein Powders for Building Muscle"
          type="blog"
          status="scheduled"
          date="Feb 20, 2026 (scheduled)"
          keywords={["protein powder", "muscle gain", "supplements"]}
        />
        <ContentCard
          title="New Product Launch: Premium Resistance Bands"
          type="social"
          status="draft"
          date="Draft"
          keywords={["resistance bands", "workout", "fitness"]}
        />
      </div>
    </div>
  );
}

function ContentCard({ 
  title, 
  type, 
  status, 
  date, 
  keywords 
}: { 
  title: string; 
  type: string; 
  status: string; 
  date: string; 
  keywords: string[];
}) {
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              type === 'blog' 
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {type}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              status === 'published' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : status === 'scheduled'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
            }`}>
              {status}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{date}</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          •••
        </button>
      </div>
    </div>
  );
}
