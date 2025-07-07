
// components/TaskList.tsx
import { useState, useEffect } from 'react';
import { Task, Section } from '../types/types';

interface TaskListProps {
    tasks: Task[];
    sections: Section[];
    toggleTaskCompletion: (taskId: string) => void;
    updateTaskComment: (taskId: string, comment: string) => void;
    canCompleteTask: (taskId: string) => boolean;
    activeView?: string;
}

const TaskList: React.FC<TaskListProps> = ({
                                               tasks,
                                               sections,
                                               toggleTaskCompletion,
                                               updateTaskComment,
                                               canCompleteTask,
                                               activeView = 'all'
                                           }) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
    );
    const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
    const [editingCommentTask, setEditingCommentTask] = useState<string | null>(null);
    const [commentText, setCommentText] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
    const [sortOption, setSortOption] = useState<'country' | 'startDate' | 'duration' | 'status'>('country');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Initialize expanded sections and countries
    useEffect(() => {
        setExpandedSections(
            sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
        );

        // Get unique countries from tasks
        const countries = Array.from(new Set(tasks.map(task =>
            task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown'
        )));

        setExpandedCountries(
            countries.reduce((acc, country) => ({ ...acc, [country]: true }), {})
        );
    }, [tasks, sections]);

    // Toggle section expansion
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Toggle country expansion
    const toggleCountry = (countryName: string) => {
        setExpandedCountries(prev => ({
            ...prev,
            [countryName]: !prev[countryName]
        }));
    };

    // Start editing a comment
    const startEditComment = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        setCommentText(task?.comments || '');
        setEditingCommentTask(taskId);
    };

    // Save comment
    const saveComment = () => {
        if (editingCommentTask) {
            updateTaskComment(editingCommentTask, commentText);
            setEditingCommentTask(null);
        }
    };

    // Helper function to ensure date comparison works properly
    const getTaskDate = (date: Date | string): number => {
        if (date instanceof Date) {
            return date.getTime();
        }
        return new Date(date).getTime();
    };

    // Filter and sort tasks
    const getProcessedTasks = () => {
        let filteredTasks = [...tasks];

        // Filter by active view (section)
        if (activeView !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.section === activeView);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task =>
                task.name.toLowerCase().includes(searchLower) ||
                task.comments?.toLowerCase().includes(searchLower) ||
                task.id.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (filterStatus === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (filterStatus === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }

        // Sort tasks
        filteredTasks.sort((a, b) => {
            let compareResult = 0;

            switch (sortOption) {
                case 'country':
                    const countryA = a.comments?.split(':')[0] || a.id.split('-')[0] || 'Unknown';
                    const countryB = b.comments?.split(':')[0] || b.id.split('-')[0] || 'Unknown';
                    compareResult = countryA.localeCompare(countryB);
                    break;
                case 'startDate':
                    compareResult = getTaskDate(a.startDate) - getTaskDate(b.startDate);
                    break;
                case 'duration':
                    compareResult = a.duration - b.duration;
                    break;
                case 'status':
                    compareResult = Number(a.completed) - Number(b.completed);
                    break;
            }

            return sortDirection === 'asc' ? compareResult : -compareResult;
        });

        return filteredTasks;
    };

    // Group tasks by country
    const tasksByCountry = getProcessedTasks().reduce((acc, task) => {
        const countryName = task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown';
        if (!acc[countryName]) {
            acc[countryName] = [];
        }
        acc[countryName].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    // Get unique countries
    const countries = Object.keys(tasksByCountry).sort();

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setSortOption('country');
        setSortDirection('asc');
    };

    // Toggle sort direction when clicking the same sort option
    const handleSortChange = (option: 'country' | 'startDate' | 'duration' | 'status') => {
        if (sortOption === option) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortOption(option);
            setSortDirection('asc');
        }
    };

    // Calculate task stats
    const getTaskStats = () => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const readyTasks = tasks.filter(task => !task.completed && canCompleteTask(task.id)).length;
        const blockedTasks = totalTasks - completedTasks - readyTasks;

        return {
            total: totalTasks,
            completed: completedTasks,
            ready: readyTasks,
            blocked: blockedTasks,
            completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    };

    const stats = getTaskStats();

    // Format date safely
    const formatDate = (date: Date | string): string => {
        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return String(date);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            {/* Header with stats */}
            <div className="mb-4 border-b pb-3">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-indigo-700">
                        {activeView === 'all' ? 'Tasks' : `${sections.find(s => s.id === activeView)?.name} Tasks`}
                    </h2>
                    <div className="text-sm font-medium bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full">
                        {stats.completionPercentage}% Complete
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="bg-gray-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold text-gray-800">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold text-green-800">{stats.completed}</div>
                        <div className="text-xs text-green-600">Completed</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold text-blue-800">{stats.ready}</div>
                        <div className="text-xs text-blue-600">Ready</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-md text-center">
                        <div className="text-lg font-semibold text-amber-800">{stats.blocked}</div>
                        <div className="text-xs text-amber-600">Blocked</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-4 space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="flex border rounded-md overflow-hidden">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-2 py-1 text-xs ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('completed')}
                                className={`px-2 py-1 text-xs ${filterStatus === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-2 py-1 text-xs ${filterStatus === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <div className="flex border rounded-md overflow-hidden">
                        <button
                            onClick={() => handleSortChange('country')}
                            className={`px-2 py-1 text-xs ${sortOption === 'country' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Country {sortOption === 'country' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSortChange('startDate')}
                            className={`px-2 py-1 text-xs ${sortOption === 'startDate' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Date {sortOption === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSortChange('duration')}
                            className={`px-2 py-1 text-xs ${sortOption === 'duration' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Duration {sortOption === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSortChange('status')}
                            className={`px-2 py-1 text-xs ${sortOption === 'status' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Status {sortOption === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks list */}
            <div className="overflow-y-auto max-h-[calc(100vh-340px)] pr-1">
                {countries.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p>No tasks found matching your filters</p>
                        <button
                            onClick={resetFilters}
                            className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    countries.map(countryName => {
                        const countryTasks = tasksByCountry[countryName];
                        const isExpanded = expandedCountries[countryName] !== false; // Default to expanded

                        if (countryTasks.length === 0) return null;

                        return (
                            <div key={countryName} className="mb-4 border border-gray-200 rounded-lg shadow-sm">
                                {/* Country Header */}
                                <div
                                    className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-t-lg cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors"
                                    onClick={() => toggleCountry(countryName)}
                                >
                                    <div className="flex items-center">
                                        <span className={`mr-2 transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`}>
                                            <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </span>
                                        <h3 className="font-bold text-blue-900">{countryName}</h3>
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        {countryTasks.length} task{countryTasks.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-2">
                                        {/* Get sections for this country */}
                                        {sections.map(section => {
                                            const sectionTasks = countryTasks.filter(task => task.section === section.id);
                                            if (sectionTasks.length === 0) return null;

                                            const isSectionExpanded = expandedSections[section.id] !== false;

                                            return (
                                                <div key={`${countryName}-${section.id}`} className="mb-3 border border-gray-100 rounded-md">
                                                    <div
                                                        className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 rounded-t-md cursor-pointer hover:from-indigo-100 hover:to-indigo-200 transition-colors"
                                                        onClick={() => toggleSection(section.id)}
                                                    >
                                                        <div className="flex items-center">
                                                            <span className={`mr-2 transition-transform duration-200 ${isSectionExpanded ? 'transform rotate-90' : ''}`}>
                                                                <svg className="w-3 h-3 text-indigo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                                </svg>
                                                            </span>
                                                            <h4 className="font-medium text-indigo-800">{section.name}</h4>
                                                        </div>
                                                        <div className="text-xs text-indigo-600">
                                                            {sectionTasks.length} task{sectionTasks.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>

                                                    {isSectionExpanded && (
                                                        <div className="p-2">
                                                            {sectionTasks.map(task => (
                                                                <div
                                                                    key={task.id}
                                                                    className={`border-b border-gray-100 py-3 px-2 hover:bg-gray-50 transition-colors rounded-md my-1 ${task.completed ? 'bg-green-50' : !canCompleteTask(task.id) ? 'bg-amber-50' : 'bg-blue-50'}`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={task.completed}
                                                                                onChange={() => toggleTaskCompletion(task.id)}
                                                                                disabled={!canCompleteTask(task.id)}
                                                                                className={`mr-3 h-5 w-5 rounded ${
                                                                                    task.completed
                                                                                        ? 'accent-green-600 border-green-600'
                                                                                        : !canCompleteTask(task.id)
                                                                                            ? 'accent-red-600 border-red-400'
                                                                                            : 'accent-blue-600 border-blue-400'
                                                                                }`}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex flex-wrap items-center">
                                                                                <span className={`${task.completed ? 'line-through text-gray-500' : 'font-medium text-gray-800'}`}>
                                                                                    {task.name}
                                                                                </span>
                                                                                {!canCompleteTask(task.id) && !task.completed && (
                                                                                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                                                                        Dependencies pending
                                                                                    </span>
                                                                                )}
                                                                                {task.completed && (
                                                                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                                                                        Completed
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-2">
                                                                                <div className="flex items-center">
                                                                                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                                                    </svg>
                                                                                    {formatDate(task.startDate)}
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                                    </svg>
                                                                                    {task.duration} days
                                                                                </div>
                                                                            </div>

                                                                            {task.dependencies && task.dependencies.length > 0 && (
                                                                                <div className="text-xs text-gray-600 mt-2 flex items-center flex-wrap">
                                                                                    <span className="font-medium mr-2">Dependencies:</span>
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        {task.dependencies.map(depId => {
                                                                                            const depTask = tasks.find(t => t.id === depId);
                                                                                            return (
                                                                                                <span
                                                                                                    key={depId}
                                                                                                    className={`inline-block px-2 py-0.5 rounded-md text-xs ${
                                                                                                        depTask?.completed
                                                                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                                                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                                                                    }`}
                                                                                                    title={depTask?.name || depId}
                                                                                                >
                                                                                                    {depTask?.name || depId}
                                                                                                </span>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Comment section */}
                                                                    <div className="mt-3 pl-8 pr-2">
                                                                        {editingCommentTask === task.id ? (
                                                                            <div className="bg-white border border-indigo-200 rounded-md shadow-sm">
                                                                                <textarea
                                                                                    value={commentText}
                                                                                    onChange={(e) => setCommentText(e.target.value)}
                                                                                    className="w-full p-3 rounded-t-md text-sm border-b border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                                    rows={3}
                                                                                    placeholder="Add your comments here..."
                                                                                />
                                                                                <div className="flex justify-end p-2 bg-gray-50 rounded-b-md">
                                                                                    <button
                                                                                        onClick={() => setEditingCommentTask(null)}
                                                                                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md mr-2 hover:bg-gray-100 transition-colors"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={saveComment}
                                                                                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                                                                    >
                                                                                        Save
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                {task.comments ? (
                                                                                    <div className="text-sm bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                                                                        <p className="text-gray-800">
                                                                                            {task.comments.split(':')[1]?.trim() || task.comments}
                                                                                        </p>
                                                                                        <div className="mt-2 flex justify-end">
                                                                                            <button
                                                                                                onClick={() => startEditComment(task.id)}
                                                                                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                                                                                            >
                                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                                                                </svg>
                                                                                                Edit
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => startEditComment(task.id)}
                                                                                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                                                                                    >
                                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                                                        </svg>
                                                                                        Add note
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom action buttons */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                <button
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    onClick={() => {
                        // Expand all
                        const allCountries = Object.keys(tasksByCountry);
                        const newExpandedCountries = allCountries.reduce((acc, country) => ({ ...acc, [country]: true }), {});
                        setExpandedCountries(newExpandedCountries);

                        const newExpandedSections = sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {});
                        setExpandedSections(newExpandedSections);
                    }}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    Expand all
                </button>

                <button
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    onClick={() => {
                        // Collapse all
                        const allCountries = Object.keys(tasksByCountry);
                        const newExpandedCountries = allCountries.reduce((acc, country) => ({ ...acc, [country]: false }), {});
                        setExpandedCountries(newExpandedCountries);

                        const newExpandedSections = sections.reduce((acc, section) => ({ ...acc, [section.id]: false }), {});
                        setExpandedSections(newExpandedSections);
                    }}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16l-5-5 5-5m14 10l5-5-5-5"></path>
                    </svg>
                    Collapse all
                </button>
            </div>
        </div>
    );
};

export default TaskList;