import { Store, Link2, Settings } from "lucide-react";

export default function StorePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Store Settings</h1>

      {/* Store Info */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            <Store size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">My Fitness Store</h2>
            <p className="text-gray-600 dark:text-gray-400">fitness-store.myshopify.com</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <InfoField label="Platform" value="Shopify" />
          <InfoField label="Niche" value="Fitness & Sports" />
          <InfoField label="Blog URL" value="fitness-store.myshopify.com/blogs/news" />
          <InfoField label="Status" value="Active" badge="success" />
        </div>
      </div>

      {/* Shopify Connection */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 size={20} />
          Shopify Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your store is connected and ready to publish content automatically.
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            Test Connection
          </button>
          <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            Disconnect Store
          </button>
        </div>
      </div>

      {/* Publishing Settings */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Publishing Settings
        </h2>
        <div className="space-y-4">
          <SettingToggle
            label="Auto-publish content"
            description="Automatically publish generated content to your blog"
            enabled={true}
          />
          <SettingToggle
            label="SEO optimization"
            description="Optimize meta tags and descriptions for search engines"
            enabled={true}
          />
          <SettingToggle
            label="Add featured images"
            description="Automatically generate and add featured images to posts"
            enabled={false}
          />
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <div className="font-medium">
        {badge ? (
          <span className={`px-3 py-1 rounded-full text-sm ${
            badge === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
          }`}>
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function SettingToggle({ 
  label, 
  description, 
  enabled 
}: { 
  label: string; 
  description: string; 
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <div>
        <h3 className="font-medium mb-1">{label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <button className={`w-12 h-6 rounded-full transition ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
      }`}>
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
