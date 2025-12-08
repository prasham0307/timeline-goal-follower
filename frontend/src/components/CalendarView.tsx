import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  isRecurring: boolean;
}

interface Day {
  date: string;
  tasks: Task[];
}

interface CalendarViewProps {
  goalId: string;
  startDate: Date;
  deadline: Date;
  days: Day[];
}

export default function CalendarView({ goalId, startDate, deadline, days }: CalendarViewProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  
  // Use goal start date as the base month
  const monthStart = startOfMonth(startDate);
  const monthEnd = endOfMonth(startDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayData = (date: Date): Day | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return days.find(d => d.date === dateStr) || null;
  };

  const isInGoalRange = (date: Date): boolean => {
    return date >= startDate && date <= deadline;
  };

  const getCompletionStats = (day: Day | null) => {
    if (!day || day.tasks.length === 0) return null;
    const completed = day.tasks.filter(t => t.completed).length;
    const total = day.tasks.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          {format(startDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Goal Period:</span>
          <span>{format(startDate, 'MMM d')} - {format(deadline, 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-700 py-3 text-sm bg-gray-50 rounded-t-lg">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(date => {
          const dayData = getDayData(date);
          const dateStr = format(date, 'yyyy-MM-dd');
          const inGoalRange = isInGoalRange(date);
          const isToday = isSameDay(date, new Date());
          const stats = getCompletionStats(dayData);
          const isCurrentMonth = isSameMonth(date, startDate);
          const isHovered = hoveredDay === dateStr;

          return (
            <Link
              key={date.toISOString()}
              to={inGoalRange && dayData ? `/goals/${goalId}/days/${format(date, 'yyyy-MM-dd')}` : '#'}
              onMouseEnter={() => setHoveredDay(dateStr)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`
                relative min-h-[110px] p-3 border-2 rounded-lg transition-all duration-200 transform
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 opacity-60' : 'bg-white'}
                ${!inGoalRange ? 'opacity-40 cursor-not-allowed' : ''}
                ${inGoalRange && dayData ? 'hover:scale-105 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 cursor-pointer hover:z-10' : ''}
                ${inGoalRange && !dayData ? 'hover:border-gray-400 hover:bg-gray-50' : ''}
                ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : 'border-gray-200'}
                ${isHovered && inGoalRange ? 'bg-blue-50' : ''}
                ${stats?.percentage === 100 ? 'border-green-300 bg-green-50' : ''}
              `}
              onClick={(e) => {
                if (!inGoalRange || !dayData) {
                  e.preventDefault();
                }
              }}
            >
              {/* Day Number */}
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  text-sm font-bold transition-all duration-200
                  ${isToday ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md' : ''}
                  ${isHovered && inGoalRange && !isToday ? 'text-blue-600 scale-110' : ''}
                  ${stats?.percentage === 100 ? 'text-green-600' : ''}
                `}>
                  {format(date, 'd')}
                </span>
                
                {stats && (
                  <div className="flex flex-col items-end gap-1">
                    <span className={`
                      text-xs font-bold px-2 py-1 rounded-full transition-all duration-200 shadow-sm
                      ${stats.percentage === 100 ? 'bg-green-500 text-white animate-pulse' : 
                        stats.percentage > 50 ? 'bg-yellow-400 text-yellow-900' : 
                        stats.percentage > 0 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-300 text-gray-700'}
                      ${isHovered ? 'scale-110' : ''}
                    `}>
                      {stats.completed}/{stats.total}
                    </span>
                    {stats.percentage === 100 && (
                      <span className="text-xl animate-bounce">✅</span>
                    )}
                  </div>
                )}
              </div>

              {/* Task Preview */}
              {dayData && inGoalRange && (
                <div className="space-y-1.5">
                  {dayData.tasks.slice(0, isHovered ? 5 : 2).map(task => (
                    <div
                      key={task.id}
                      className={`
                        text-xs p-1.5 rounded-md truncate transition-all duration-200 font-medium
                        ${task.completed 
                          ? 'bg-green-100 text-green-800 line-through border border-green-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }
                        ${isHovered ? 'shadow-sm transform scale-105' : ''}
                      `}
                      title={task.title}
                    >
                      <span className="mr-1">{task.completed ? '✓' : '○'}</span>
                      {task.title}
                    </div>
                  ))}
                  {dayData.tasks.length > (isHovered ? 5 : 2) && (
                    <div className="text-xs text-gray-600 font-semibold bg-gray-100 p-1 rounded text-center">
                      +{dayData.tasks.length - (isHovered ? 5 : 2)} more
                    </div>
                  )}
                </div>
              )}

              {/* Empty State for Goal Days with Hover Effect */}
              {!dayData && inGoalRange && (
                <div className={`
                  text-xs text-center mt-4 py-2 rounded transition-all duration-200
                  ${isHovered ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-400 italic'}
                `}>
                  {isHovered ? '➕ Click to add tasks' : 'No tasks'}
                </div>
              )}

              {/* Progress Bar for Days with Tasks */}
              {stats && stats.total > 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        stats.percentage === 100 ? 'bg-green-500' :
                        stats.percentage > 50 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 rounded ring-2 ring-blue-200"></div>
          <span className="font-medium">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="font-medium">All Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 border-2 border-blue-400 rounded"></div>
          <span className="font-medium">Has Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-50 border-2 border-gray-300 rounded"></div>
          <span className="font-medium">Empty</span>
        </div>
      </div>
    </div>
  );
}
