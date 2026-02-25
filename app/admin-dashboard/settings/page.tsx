import { User, CreditCard, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Account Settings */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User size={20} />
          Account Information
        </h2>
        <div className="space-y-4">
          <InputField label="Name" value="John Doe" />
          <InputField label="Email" value="john@example.com" type="email" />
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
            Save Changes
          </button>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Billing & Subscription
        </h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Current Plan: Growth</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">$250/month • Renews on March 1, 2026</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            Change Plan
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            View Invoices
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h2>
        <div className="space-y-4">
          <NotificationToggle
            label="Content published"
            description="Get notified when new content is published to your blog"
            enabled={true}
          />
          <NotificationToggle
            label="Weekly reports"
            description="Receive weekly performance reports via email"
            enabled={true}
          />
          <NotificationToggle
            label="Marketing tips"
            description="Get tips and best practices for content marketing"
            enabled={false}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Security
        </h2>
        <div className="space-y-4">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            Change Password
          </button>
          <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

function NotificationToggle({ 
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
