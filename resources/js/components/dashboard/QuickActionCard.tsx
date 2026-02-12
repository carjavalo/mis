// components/dashboard/QuickActionCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
    orange: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-left group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{title}</h3>
          <p className="text-sm text-white/80">{description}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;
