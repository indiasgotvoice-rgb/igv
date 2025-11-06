import { Tv, Users, UserCircle } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'shows' | 'participants' | 'profile';
  onTabChange: (tab: 'shows' | 'participants' | 'profile') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'shows' as const, label: 'Shows', icon: Tv },
    { id: 'participants' as const, label: 'Participants', icon: Users },
    { id: 'profile' as const, label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-4 transition-all ${
                  isActive
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
