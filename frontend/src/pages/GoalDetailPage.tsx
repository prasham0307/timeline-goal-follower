import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import AppShell from '../components/AppShell';
import ProgressBar from '../components/ProgressBar';
import CalendarView from '../components/CalendarView';
import { goalsApi } from '../lib/api';

export default function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');

  const { data, isLoading } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => goalsApi.getById(goalId!),
    enabled: !!goalId,
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading goal...</p>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Goal not found</p>
          <Link to="/" className="btn btn-primary mt-4">
            Back to Goals
          </Link>
        </div>
      </AppShell>
    );
  }

  const { goal, progress, totalDays } = data;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Goals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
          {goal.description && (
            <p className="text-gray-600 mt-2">{goal.description}</p>
          )}
        </div>

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-semibold">
                {format(parseISO(goal.startDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="text-lg font-semibold">
                {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-lg font-semibold">{totalDays} days</p>
            </div>
          </div>

          {progress && (
            <ProgressBar
              percentage={progress.percentage}
              completed={progress.completed}
              total={progress.total}
            />
          )}
        </div>

        <div className="card">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setView('timeline')}
              className={`btn ${view === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Calendar View
            </button>
          </div>

          {view === 'timeline' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Daily Timeline</h3>
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4">
                  {data.timeline?.slice(0, 30).map((day: any, index: number) => (
                    <Link
                      key={index}
                      to={`/goals/${goalId}/days/${format(parseISO(day.date), 'yyyy-MM-dd')}`}
                      className="flex-shrink-0 w-32 p-4 border rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(day.date), 'MMM dd')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(day.date), 'EEEE')}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {day.defaultTasks.length} tasks
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Showing first 30 days. Click a day to view details.
              </p>
            </div>
          ) : (
            <CalendarView
              goalId={goalId!}
              startDate={parseISO(goal.startDate)}
              deadline={parseISO(goal.deadline)}
              days={data.timeline || []}
            />
          )}
        </div>

        {goal.defaultTasks && goal.defaultTasks.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Default Daily Tasks</h3>
            <ul className="space-y-2">
              {goal.defaultTasks.map((task: any, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary-600">✓</span>
                  <span>{task.title}</span>
                  {task.isRecurring && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {task.recurrence || 'daily'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
