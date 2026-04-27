interface ProgressBarProps {
  percentage: number;
  completed: number;
  total: number;
  className?: string;
}

export default function ProgressBar({
  percentage,
  completed,
  total,
  className = '',
}: ProgressBarProps) {
  const getColorClass = () => {
    if (percentage === 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 70) return 'from-blue-500 to-indigo-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-lg">{percentage === 100 ? '🎉' : '📊'}</span>
          Progress
        </span>
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {completed}/{total} tasks • {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
        <div
          className={`bg-gradient-to-r ${getColorClass()} h-4 rounded-full transition-all duration-500 relative`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
