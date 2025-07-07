// pages/index.tsx

'use client'
import { useState, useEffect, useCallback } from 'react';
import GanttChart from '../components/GanttChart';
import TaskList from '../components/TaskList';
import { Task, Section } from '../types/types';
import { fetchSheetData } from '../services/googleSheetsService';

const sections: Section[] = [
    { id: 'gc8', name: 'GC8' },
    { id: 'nsp', name: 'NSP' },
    { id: 'mtr', name: 'MTR' },
];

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeView, setActiveView] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'split' | 'gantt' | 'list'>('split');
    const [showCompleted, setShowCompleted] = useState<boolean>(true);
    const [filterCountry, setFilterCountry] = useState<string | null>(null);

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const loadedTasks = await fetchSheetData();
            setTasks(loadedTasks);
            setError(null);
        } catch (err) {
            setError('Failed to load task data from Google Sheets. Please ensure the sheet is publicly accessible.');
            console.error('Error loading task data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Check if task can be completed (all dependencies are completed)
    const canCompleteTask = useCallback((taskId: string): boolean => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;

        if (task.dependencies.length === 0) return true;

        return task.dependencies.every(depId => {
            const depTask = tasks.find(t => t.id === depId);
            return depTask?.completed === true;
        });
    }, [tasks]);

    // Toggle task completion status
    const toggleTaskCompletion = useCallback((taskId: string): void => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId) {
                    // Only allow completion if dependencies are completed
                    if (!task.completed && !canCompleteTask(taskId)) {
                        alert("Cannot complete this task until all dependencies are completed.");
                        return task;
                    }
                    return { ...task, completed: !task.completed };
                }
                return task;
            })
        );
    }, [canCompleteTask]);

    // Update task comment
    const updateTaskComment = useCallback((taskId: string, comment: string): void => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, comments: comment } : task
            )
        );
    }, []);

    // Filter tasks based on activeView, showCompleted, and filterCountry
    const filteredTasks = tasks.filter(task => {
        // Filter by section
        if (activeView !== 'all' && task.section !== activeView) {
            return false;
        }

        // Filter by completion status
        if (!showCompleted && task.completed) {
            return false;
        }

        // Filter by country
        if (filterCountry) {
            const taskCountry = task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown';
            if (taskCountry !== filterCountry) {
                return false;
            }
        }

        return true;
    });

    // Get unique countries
    const countrySet = new Set<string>(tasks.map(task =>
        task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown'
    ));
    const countries = Array.from(countrySet).sort();

    // Calculate stats
    const getStats = (): { total: number; completed: number; completionPercentage: number } => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            total: totalTasks,
            completed: completedTasks,
            completionPercentage
        };
    };

    const stats = getStats();

    // Loading state
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading task data from Google Sheets...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <div className="text-red-600 mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto p-4">
                {/* Header */}
                <header className="bg-white shadow-md rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-2 md:mb-0">Country Support Dependencies</h1>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={loadData}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </button>
                            <button
                                onClick={() => {
                                    // Export tasks data as JSON
                                    const dataStr = JSON.stringify(tasks, null, 2);
                                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                                    const exportFileDefaultName = 'tasks_export.json';

                                    const linkElement = document.createElement('a');
                                    linkElement.setAttribute('href', dataUri);
                                    linkElement.setAttribute('download', exportFileDefaultName);
                                    linkElement.click();
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center text-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex items-center mb-3 md:mb-0">
                            <div className="mr-4">
                                <span className="text-sm text-gray-500">Total Tasks:</span>
                                <span className="ml-1 font-medium text-gray-800">{stats.total}</span>
                            </div>
                            <div className="mr-4">
                                <span className="text-sm text-gray-500">Completed:</span>
                                <span className="ml-1 font-medium text-green-600">{stats.completed}</span>
                            </div>
                            <div>
                                <div className="bg-gray-200 rounded-full h-2.5 w-40 overflow-hidden">
                                    <div
                                        className="bg-green-600 h-2.5"
                                        style={{ width: `${stats.completionPercentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500">{stats.completionPercentage}% complete</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex border rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={`px-3 py-1 text-sm flex items-center ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Split
                                </button>
                                <button
                                    onClick={() => setViewMode('gantt')}
                                    className={`px-3 py-1 text-sm flex items-center ${viewMode === 'gantt' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Gantt
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 text-sm flex items-center ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="mb-6 bg-white shadow-md rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-700 font-medium">Section:</span>
                            <div className="flex flex-wrap border rounded-md overflow-hidden">
                                <button
                                    onClick={() => setActiveView('all')}
                                    className={`px-3 py-1 text-sm ${activeView === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    All
                                </button>
                                {sections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveView(section.id)}
                                        className={`px-3 py-1 text-sm ${activeView === section.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {section.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 font-medium">Country:</span>
                                <select
                                    value={filterCountry || ''}
                                    onChange={(e) => setFilterCountry(e.target.value || null)}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Countries</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showCompleted"
                                    checked={showCompleted}
                                    onChange={() => setShowCompleted(!showCompleted)}
                                    className="mr-2 h-4 w-4 accent-indigo-600 rounded"
                                />
                                <label htmlFor="showCompleted" className="text-sm text-gray-700">
                                    Show Completed
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content based on view mode */}
                <div className={`grid gap-6 ${
                    viewMode === 'split'
                        ? 'grid-cols-1 lg:grid-cols-12'
                        : 'grid-cols-1'
                }`}>
                    {/* Task List Panel */}
                    {(viewMode === 'split' || viewMode === 'list') && (
                        <div className={viewMode === 'split' ? 'lg:col-span-4' : 'lg:col-span-12'}>
                            <TaskList
                                tasks={filteredTasks}
                                sections={sections}
                                toggleTaskCompletion={toggleTaskCompletion}
                                updateTaskComment={updateTaskComment}
                                canCompleteTask={canCompleteTask}
                                activeView={activeView}
                            />
                        </div>
                    )}

                    {/* Gantt Chart Panel */}
                    {(viewMode === 'split' || viewMode === 'gantt') && (
                        <div className={viewMode === 'split' ? 'lg:col-span-8' : 'lg:col-span-12'}>
                            <GanttChart
                                tasks={filteredTasks}
                                sections={sections}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}