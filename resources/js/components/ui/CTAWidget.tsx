import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Users, Settings, BarChart3, FileText } from 'lucide-react';

interface CTAWidgetProps {
  title: string;
  description: string;
  route: string;
  icon?: 'plus' | 'users' | 'settings' | 'chart' | 'file' | 'documents';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

const CTAWidget: React.FC<CTAWidgetProps> = ({ 
  title, 
  description, 
  route, 
  icon = 'plus',
  color = 'blue',
  className = '' 
}) => {
  const navigate = useNavigate();

  const icons = {
    plus: Plus,
    users: Users,
    settings: Settings,
    documents: FileText,
    chart: BarChart3,
    file: FileText
  };

  const colors = {
    blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
    orange: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
    red: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
  };

  const IconComponent = icons[icon];

  return (
    <div 
      onClick={() => navigate(route)}
      className={`
        group cursor-pointer bg-gradient-to-br ${colors[color]} 
        rounded-xl p-6 text-white shadow-lg hover:shadow-xl 
        transform hover:scale-100 transition-all duration-300 
        border border-white/10 relative overflow-hidden
        ${className}
      `}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <IconComponent size={24} />
        </div>
        <ArrowRight 
          size={20} 
          className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" 
        />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2 group-hover:text-white/90 transition-colors">
          {title}
        </h3>
        <p className="text-white/80 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
    </div>
  );
};

export default CTAWidget;
