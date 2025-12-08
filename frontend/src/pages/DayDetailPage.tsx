import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import AppShell from '../components/AppShell';
import ProgressBar from '../components/ProgressBar';
import { goalsApi, tasksApi, Task } from '../lib/api';

export default function DayDetailPage() {
  const { goalId, date } = useParams<{ goalId: string; date: string }>();
  const queryClient = useQueryClient();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['day', goalId, date],
    queryFn: () => goalsApi.getDayTasks(goalId!, date!),
    enabled: !!goalId && !!date,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed, isDefault, task }: { taskId: string; completed: boolean; isDefault?: boolean; task?: any }) => {
      // If it's a default task being checked (completed=true means we're checking it)
      if (isDefault && completed) {
        const newTask = await goalsApi.createTask(goalId!, {
          title: task.title,
          notes: task.notes,
          date: new Date(date! + 'T00:00:00Z').toISOString(),
          completed: true,
        });
        return newTask;
      }
      // If it's a regular task or unchecking, just toggle
      return tasksApi.update(taskId, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', goalId, date] });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', goalId, date] });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      setEditingTask(null);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) =>
      goalsApi.createTask(goalId!, {
        title,
        date: new Date(date! + 'T00:00:00Z').toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', goalId, date] });
      setShowAddTask(false);
      setNewTaskTitle('');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', goalId, date] });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading day details...</p>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Day not found</p>
          <Link to={`/goals/${goalId}`} className="btn btn-primary mt-4">
            Back to Goal
          </Link>
        </div>
      </AppShell>
    );
  }

  const { defaultTasks, tasks, progress } = data;
  const displayDate = parseISO(date!);

  // Merge default tasks and specific tasks into one list
  // Default tasks appear as non-checkable items, specific tasks are checkable
  const allTasks = [
    ...(defaultTasks || []).map((dt: any, index: number) => ({
      id: `default-${index}`,
      title: dt.title,
      notes: dt.notes || '',
      completed: false,
      isDefault: true,
      isRecurring: dt.isRecurring,
      recurrence: dt.recurrence,
    })),
    ...(tasks || []),
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            to={`/goals/${goalId}`}
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Back to Goal
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {format(displayDate, 'EEEE, MMMM dd, yyyy')}
          </h1>
        </div>

        <div className="card">
          <ProgressBar
            percentage={progress.percentage}
            completed={progress.completed}
            total={progress.total}
          />
        </div>

        {/* Combined Tasks Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks for This Day</h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="btn btn-primary"
            >
              + Add Task
            </button>
          </div>

          {showAddTask && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newTaskTitle.trim()) {
                    addTaskMutation.mutate(newTaskTitle);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Task title..."
                  className="input flex-1"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskTitle('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {allTasks && allTasks.length > 0 ? (
              allTasks.map((task: any) => {
                const isDefault = task.isDefault;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                      task.completed 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                        : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => {
                        toggleTaskMutation.mutate({
                          taskId: task.id,
                          completed: !task.completed,
                          isDefault: isDefault,
                          task: isDefault ? task : undefined,
                        });
                      }}
                      className="flex-shrink-0 transform hover:scale-110 transition-transform"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 shadow-md'
                            : 'border-gray-300 hover:border-blue-400 bg-white'
                        }`}
                      >
                        {task.completed && (
                          <svg
                            className="w-5 h-5 text-white animate-pulse"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </button>
                    <div className="flex-1">
                      {editingTask?.id === task.id && !isDefault ? (
                        // Edit Mode
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateTaskMutation.mutate({
                              id: task.id,
                              data: {
                                title: editingTask.title,
                                notes: editingTask.notes,
                              },
                            });
                          }}
                          className="space-y-2"
                        >
                          <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="input w-full"
                            placeholder="Task title"
                            required
                            autoFocus
                          />
                          <textarea
                            value={editingTask.notes || ''}
                            onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                            className="input w-full"
                            placeholder="Add notes..."
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm">
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTask(null)}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}
                            >
                              {task.title}
                              {isDefault && (
                                <span className="ml-2 text-xs text-purple-600 font-medium">
                                  🔄 {task.recurrence || 'daily'}
                                </span>
                              )}
                            </p>
                            {!isDefault && (
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                          )}
                        </>
                      )}
                    </div>
                    {!isDefault && !editingTask && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this task?')) {
                            deleteTaskMutation.mutate(task.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-gray-500">
                No tasks for this day yet. Add one above!
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
