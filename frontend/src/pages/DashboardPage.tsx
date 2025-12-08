import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ProgressBar from '../components/ProgressBar';
import { goalsApi, templatesApi, tasksApi, Goal } from '../lib/api';
import { format, differenceInDays } from 'date-fns';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showViewTemplatesModal, setShowViewTemplatesModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    deadline: '',
    template: '',
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    deadline: '',
    template: '',
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    notes: '',
    goalId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    defaultTasks: [{ title: '', notes: '', isRecurring: false, recurrence: '' }],
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  });

  const { data: todayTasksData } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: goalsApi.getTodayTasks,
  });

  console.log('Today Tasks Data:', todayTasksData);

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.getAll,
  });

  console.log('Templates Data:', templatesData);
  console.log('Show View Templates Modal:', showViewTemplatesModal);

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      goalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      setShowEditGoalModal(false);
      setEditingGoal(null);
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        deadline: '',
        template: '',
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setShowTemplateModal(false);
      setTemplateForm({
        name: '',
        description: '',
        category: '',
        defaultTasks: [{ title: '', notes: '', isRecurring: false, recurrence: '' }],
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: any }) => 
      templatesApi.update(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      setEditingTemplate(null);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (name: string) => templatesApi.delete(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { title: string; notes: string; date: string; goalId: string }) => 
      goalsApi.createTask(data.goalId, {
        title: data.title,
        notes: data.notes,
        date: data.date,
        completed: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        notes: '',
        goalId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template = templatesData?.templates?.find(
      (t: any) => t.name === formData.template
    );

    createGoalMutation.mutate({
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate + 'T00:00:00Z').toISOString(),
      deadline: new Date(formData.deadline + 'T00:00:00Z').toISOString(),
      template: formData.template || undefined,
      defaultTasks: template?.defaultTasks,
    });
  };

  const goals = goalsData?.goals || [];
  const todayTasks = Array.isArray(todayTasksData) ? todayTasksData : (todayTasksData?.tasks || []);

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed, isDefault, task }: { id: string; completed: boolean; isDefault?: boolean; task?: any }) => {
      // If it's a default task being checked (completed=true means we're checking it)
      if (isDefault && completed) {
        const newTask = await goalsApi.createTask(task.goalId, {
          title: task.title,
          notes: task.notes,
          date: task.date,
          completed: true,
        });
        return newTask;
      }
      // If it's a regular task or unchecking, just toggle
      return tasksApi.update(id, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl">☀️</span>
              My Day
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create New Task
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <span>➕</span>
              New Goal
            </button>
          </div>
        </div>

        {/* Today's Tasks Section - Main Focus */}
        <div className="card bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 shadow-xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <span className="text-3xl">✅</span>
              Today's Tasks
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-lg text-gray-700 font-medium">
                {todayTasks.filter((t: any) => t.completed).length} of {todayTasks.length} completed
              </p>
              <div className="flex-1">
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${todayTasks.length > 0 ? (todayTasks.filter((t: any) => t.completed).length / todayTasks.length * 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <span className="text-6xl mb-4 block">🎉</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tasks for today!
              </h3>
              <p className="text-gray-600">
                Enjoy your free day or create a new goal to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 ${
                    task.completed
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  <button
                    onClick={() =>
                      toggleTaskMutation.mutate({ 
                        id: task.id, 
                        completed: !task.completed,
                        isDefault: task.isDefault,
                        task: task.isDefault ? task : undefined,
                      })
                    }
                    className="flex-shrink-0 transform hover:scale-110 transition-transform mt-1"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 shadow-md'
                          : 'border-gray-400 hover:border-blue-500 bg-white'
                      }`}
                    >
                      {task.completed && (
                        <svg
                          className="w-5 h-5 text-white"
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
                    {editingTask?.id === task.id && !task.isDefault ? (
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
                          <p className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          {!task.isDefault && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this task?')) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <Link
                            to={`/goals/${task.goalId}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            📂 {task.goalTitle}
                          </Link>
                          {task.isRecurring && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                              🔄 {task.recurrence || 'daily'}
                            </span>
                          )}
                          {task.isDefault && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                              ⭐ Default Task
                            </span>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{task.notes}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Goals Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              My Goals
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('View Templates clicked!');
                  setShowViewTemplatesModal(true);
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <span>👁️</span>
                View Templates
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <span>📝</span>
                Create Template
              </button>
            </div>
          </div>

          {goalsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 card">
              <span className="text-6xl mb-4 block">🎯</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No goals yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first goal to start tracking your progress
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal: Goal) => {
                const today = new Date();
                const startDate = new Date(goal.startDate);
                const deadline = new Date(goal.deadline);
                const totalDays = differenceInDays(deadline, startDate) + 1;
                const daysElapsed = Math.max(0, Math.min(differenceInDays(today, startDate) + 1, totalDays));
                const daysRemaining = Math.max(0, differenceInDays(deadline, today));
                const timeProgress = Math.round((daysElapsed / totalDays) * 100);

                return (
                  <div key={goal.id} className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <Link
                        to={`/goals/${goal.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {goal.title}
                      </Link>
                      {goal.description && (
                        <p className="text-gray-600 mt-2">{goal.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between items-center">
                        <p>
                          <span className="font-medium">Start:</span>{' '}
                          {format(startDate, 'MMM dd, yyyy')}
                        </p>
                        <p>
                          <span className="font-medium">Deadline:</span>{' '}
                          {format(deadline, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Total: {totalDays} days</span>
                        <span className={`font-medium ${daysRemaining === 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {daysRemaining === 0 ? '⚠️ Due today!' : `${daysRemaining} days left`}
                        </span>
                      </div>
                      {goal.template && (
                        <p>
                          <span className="font-medium">Template:</span> {goal.template}
                        </p>
                      )}
                    </div>

                    {/* Today's Progress */}
                    {goal.progress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Today's Progress</span>
                          <span className="text-xs text-gray-500">
                            {goal.progress.completed}/{goal.progress.total} tasks
                          </span>
                        </div>
                        <ProgressBar
                          percentage={goal.progress.percentage}
                          completed={goal.progress.completed}
                          total={goal.progress.total}
                        />
                      </div>
                    )}

                    {/* Days Remaining Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Time Progress</span>
                        <span className="text-xs text-gray-500">
                          Day {daysElapsed} of {totalDays}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              timeProgress >= 90 ? 'bg-red-500' :
                              timeProgress >= 70 ? 'bg-orange-500' :
                              timeProgress >= 50 ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${timeProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{timeProgress}% elapsed</span>
                          <span className={`text-xs font-medium ${
                            daysRemaining === 0 ? 'text-red-600' :
                            daysRemaining <= 3 ? 'text-orange-600' :
                            'text-blue-600'
                          }`}>
                            {daysRemaining === 0 ? 'Last day!' : `${daysRemaining}d remaining`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/goals/${goal.id}`}
                        className="btn btn-primary flex-1"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setEditFormData({
                            title: goal.title,
                            description: goal.description || '',
                            startDate: format(new Date(goal.startDate), 'yyyy-MM-dd'),
                            deadline: format(new Date(goal.deadline), 'yyyy-MM-dd'),
                            template: goal.template || '',
                          });
                          setShowEditGoalModal(true);
                        }}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this goal?')) {
                            deleteGoalMutation.mutate(goal.id);
                          }
                        }}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template (Optional)
                </label>
                <select
                  className="input"
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                >
                  <option value="">-- Select Template --</option>
                  {templatesData?.templates?.map((template: any) => (
                    <option key={template.id} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={createGoalMutation.isPending}
                >
                  {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoalModal && editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Goal</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateGoalMutation.mutate({
                  id: editingGoal.id,
                  data: editFormData,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="e.g., Learn Guitar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, startDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={editFormData.deadline}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  className="input"
                  value={editFormData.template}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, template: e.target.value })
                  }
                >
                  <option value="">No Template</option>
                  {templatesData?.templates?.map((template: any) => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                      {template.category ? ` (${template.category})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Changing template will update the default tasks for this goal
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={updateGoalMutation.isPending}
                >
                  {updateGoalMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditGoalModal(false);
                    setEditingGoal(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>✅</span>
                Create New Task
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTaskMutation.mutate(taskForm);
              }}
              className="p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Goal *
                  </label>
                  <select
                    required
                    className="input"
                    value={taskForm.goalId}
                    onChange={(e) => setTaskForm({ ...taskForm, goalId: e.target.value })}
                  >
                    <option value="">Choose a goal...</option>
                    {goals?.map((goal: Goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                    placeholder="Add any notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Templates Modal */}
      {showViewTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📚</span>
                All Templates
              </h3>
              <button
                onClick={() => {
                  setShowViewTemplatesModal(false);
                  setEditingTemplate(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {templatesData?.templates && templatesData.templates.length > 0 ? (
                <div className="space-y-4">
                  {templatesData.templates.map((template: any) => (
                    <div key={template.name} className="card border-2">
                      {editingTemplate?.name === template.name ? (
                        // Edit Mode
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateTemplateMutation.mutate({
                              name: template.name,
                              data: {
                                description: editingTemplate.description,
                                category: editingTemplate.category,
                                defaultTasks: editingTemplate.defaultTasks,
                              },
                            });
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Template Name
                            </label>
                            <input
                              type="text"
                              value={template.name}
                              disabled
                              className="input bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={editingTemplate.description || ''}
                              onChange={(e) =>
                                setEditingTemplate({
                                  ...editingTemplate,
                                  description: e.target.value,
                                })
                              }
                              className="input"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={editingTemplate.category || ''}
                              onChange={(e) =>
                                setEditingTemplate({
                                  ...editingTemplate,
                                  category: e.target.value,
                                })
                              }
                              className="input"
                              placeholder="e.g., Fitness, Work, Personal"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Default Tasks
                            </label>
                            <div className="space-y-3">
                              {editingTemplate.defaultTasks.map((task: any, index: number) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={task.title}
                                      onChange={(e) => {
                                        const newTasks = [...editingTemplate.defaultTasks];
                                        newTasks[index].title = e.target.value;
                                        setEditingTemplate({
                                          ...editingTemplate,
                                          defaultTasks: newTasks,
                                        });
                                      }}
                                      placeholder="Task title"
                                      className="input flex-1"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTasks = editingTemplate.defaultTasks.filter(
                                          (_: any, i: number) => i !== index
                                        );
                                        setEditingTemplate({
                                          ...editingTemplate,
                                          defaultTasks: newTasks,
                                        });
                                      }}
                                      className="btn btn-secondary"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                  <textarea
                                    value={task.notes || ''}
                                    onChange={(e) => {
                                      const newTasks = [...editingTemplate.defaultTasks];
                                      newTasks[index].notes = e.target.value;
                                      setEditingTemplate({
                                        ...editingTemplate,
                                        defaultTasks: newTasks,
                                      });
                                    }}
                                    placeholder="Task notes (optional)"
                                    className="input"
                                    rows={2}
                                  />
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={task.isRecurring}
                                        onChange={(e) => {
                                          const newTasks = [...editingTemplate.defaultTasks];
                                          newTasks[index].isRecurring = e.target.checked;
                                          if (!e.target.checked) {
                                            newTasks[index].recurrence = '';
                                          }
                                          setEditingTemplate({
                                            ...editingTemplate,
                                            defaultTasks: newTasks,
                                          });
                                        }}
                                        className="rounded"
                                      />
                                      <span className="text-sm text-gray-700">Recurring</span>
                                    </label>
                                    {task.isRecurring && (
                                      <select
                                        value={task.recurrence || ''}
                                        onChange={(e) => {
                                          const newTasks = [...editingTemplate.defaultTasks];
                                          newTasks[index].recurrence = e.target.value;
                                          setEditingTemplate({
                                            ...editingTemplate,
                                            defaultTasks: newTasks,
                                          });
                                        }}
                                        className="input flex-1"
                                        required
                                      >
                                        <option value="">Select recurrence</option>
                                        <option value="daily">Daily</option>
                                        <option value="mon,tue,wed,thu,fri">Weekdays</option>
                                        <option value="sat,sun">Weekends</option>
                                        <option value="mon">Mondays</option>
                                        <option value="tue">Tuesdays</option>
                                        <option value="wed">Wednesdays</option>
                                        <option value="thu">Thursdays</option>
                                        <option value="fri">Fridays</option>
                                        <option value="sat">Saturdays</option>
                                        <option value="sun">Sundays</option>
                                      </select>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    defaultTasks: [
                                      ...editingTemplate.defaultTasks,
                                      { title: '', notes: '', isRecurring: false, recurrence: '' },
                                    ],
                                  });
                                }}
                                className="btn btn-secondary w-full"
                              >
                                + Add Task
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button type="submit" className="btn btn-primary flex-1">
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTemplate(null)}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        // View Mode
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{template.name}</h4>
                              {template.description && (
                                <p className="text-gray-600 mt-1">{template.description}</p>
                              )}
                              {template.category && (
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {template.category}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingTemplate(template)}
                                className="btn btn-primary"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete template "${template.name}"? This will not affect existing goals using this template.`)) {
                                    deleteTemplateMutation.mutate(template.name);
                                  }
                                }}
                                className="btn btn-danger"
                                title="Delete template"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h5 className="font-semibold text-gray-700 mb-2">Default Tasks:</h5>
                            <div className="space-y-2">
                              {(Array.isArray(template.defaultTasks) ? template.defaultTasks : JSON.parse(template.defaultTasks)).map((task: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{task.title}</span>
                                    {task.isRecurring && (
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                        🔄 {task.recurrence}
                                      </span>
                                    )}
                                  </div>
                                  {task.notes && (
                                    <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📚</span>
                  <p className="text-gray-600 mb-4">No templates yet</p>
                  <button
                    onClick={() => {
                      setShowViewTemplatesModal(false);
                      setShowTemplateModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    Create Your First Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📝</span>
                Create Custom Template
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTemplateMutation.mutate({
                  name: templateForm.name,
                  description: templateForm.description,
                  category: templateForm.category,
                  defaultTasks: templateForm.defaultTasks.filter(t => t.title.trim()),
                });
              }}
              className="p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., Morning Routine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    placeholder="Describe what this template is for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    placeholder="e.g., Fitness, Work, Study"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Default Tasks *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateForm({
                          ...templateForm,
                          defaultTasks: [...templateForm.defaultTasks, { title: '', notes: '', isRecurring: false, recurrence: '' }],
                        });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Task
                    </button>
                  </div>
                  <div className="space-y-3">
                    {templateForm.defaultTasks.map((task, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="space-y-3">
                          <input
                            type="text"
                            required
                            className="input"
                            value={task.title}
                            onChange={(e) => {
                              const newTasks = [...templateForm.defaultTasks];
                              newTasks[index].title = e.target.value;
                              setTemplateForm({ ...templateForm, defaultTasks: newTasks });
                            }}
                            placeholder="Task title"
                          />
                          <textarea
                            className="input"
                            rows={2}
                            value={task.notes}
                            onChange={(e) => {
                              const newTasks = [...templateForm.defaultTasks];
                              newTasks[index].notes = e.target.value;
                              setTemplateForm({ ...templateForm, defaultTasks: newTasks });
                            }}
                            placeholder="Task notes (optional)"
                          />
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={task.isRecurring}
                                onChange={(e) => {
                                  const newTasks = [...templateForm.defaultTasks];
                                  newTasks[index].isRecurring = e.target.checked;
                                  setTemplateForm({ ...templateForm, defaultTasks: newTasks });
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">Recurring</span>
                            </label>
                            {task.isRecurring && (
                              <input
                                type="text"
                                className="input flex-1"
                                value={task.recurrence}
                                onChange={(e) => {
                                  const newTasks = [...templateForm.defaultTasks];
                                  newTasks[index].recurrence = e.target.value;
                                  setTemplateForm({ ...templateForm, defaultTasks: newTasks });
                                }}
                                placeholder="e.g., daily, mon,wed,fri"
                              />
                            )}
                            {templateForm.defaultTasks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newTasks = templateForm.defaultTasks.filter((_, i) => i !== index);
                                  setTemplateForm({ ...templateForm, defaultTasks: newTasks });
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={createTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
