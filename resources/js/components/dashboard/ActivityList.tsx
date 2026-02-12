// components/dashboard/ActivityList.tsx
import React from 'react';
import { Clock, User, FileText } from 'lucide-react';

interface Activity {
  id: number;
  user?: string;
  action: string;
  description: string;
  created_at: string;
  entity_type?: string;
}

interface ActivityListProps {
  activities: Activity[];
  title?: string;
  showUser?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  title = 'Recent Activity',
  showUser = true,
}) => {
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'text-green-600 bg-green-100';
      case 'updated':
        return 'text-blue-600 bg-blue-100';
      case 'deleted':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                {showUser && activity.user && (
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {activity.user}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-900 font-medium">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{activity.created_at}</span>
                  {activity.entity_type && (
                    <span className="text-xs text-gray-400">• {activity.entity_type}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;
