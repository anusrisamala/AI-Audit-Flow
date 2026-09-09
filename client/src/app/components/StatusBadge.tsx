export function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().replace(/_/g, ' ');

  const colors: Record<string, string> = {
    'not started': 'bg-gray-100 text-gray-700 border-gray-300',
    'in progress': 'bg-blue-100 text-blue-700 border-blue-300',
    'completed': 'bg-green-100 text-green-700 border-green-300',
    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  const labels: Record<string, string> = {
    'not started': 'Not Started',
    'in progress': 'In Progress',
    'completed': 'Completed',
    'pending': 'Pending',
  };

  const colorClass = colors[normalized] || 'bg-gray-100 text-gray-700 border-gray-300';
  const label = labels[normalized] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}
