import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
}

export function KPICard({ title, value, icon: Icon, iconColor = '#EB8C00', trend }: KPICardProps) {
  return (
    <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-[#333333]">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-2">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + '20' }}>
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
