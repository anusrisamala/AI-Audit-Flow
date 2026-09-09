export function RiskBadge({ risk }: { risk: string }) {
  const normalized = risk?.toLowerCase();

  const colors: Record<string, string> = {
    'low': 'bg-green-100 text-green-700 border-green-300',
    'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'high': 'bg-orange-100 text-orange-700 border-orange-300',
    'critical': 'bg-red-100 text-red-700 border-red-300',
  };

  const labels: Record<string, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  };

  const colorClass = colors[normalized] || 'bg-gray-100 text-gray-700 border-gray-300';
  const label = labels[normalized] || risk;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}
