// pages/index.tsx

'use client'
import { useState } from 'react';
import TaskList from '../components/TaskList';
import { Task, Section } from '../types/types';

const sections: Section[] = [

    { id: 'smc', name: 'SMC Campaign' },
    { id: 'itn', name: 'ITN Campaign' },
    { id: 'irs', name: 'IRS Campaign' },
];

const initialTasks: Task[] = [

    // SMC Campaign Section
    {
        id: 'smc-1',
        name: 'Macro Planning',
        section: 'smc',
        startDate: new Date(2025, 5, 1), // June 1, 2025
        duration: 45,
        dependencies: [],
        completed: false,
    },
    {
        id: 'smc-2',
        name: 'Procurement and Supply Chain Management',
        section: 'smc',
        startDate: new Date(2025, 6, 16), // After smc-1
        duration: 60,
        dependencies: ['smc-1'],
        completed: false,
    },
    {
        id: 'smc-3',
        name: 'Micro Planning',
        section: 'smc',
        startDate: new Date(2025, 7, 16), // After smc-1
        duration: 30,
        dependencies: ['smc-2'],
        completed: false,
    },
    {
        id: 'smc-4',
        name: 'Digitalization',
        section: 'smc',
        startDate: new Date(2025, 8, 16), // After smc-3
        duration: 30,
        dependencies: ['smc-3'],
        completed: false,
    },
    {
        id: 'smc-5',
        name: 'Monitoring and Evaluation',
        section: 'smc',
        startDate: new Date(2025, 9, 15), // After smc-4
        duration: 45,
        dependencies: ['smc-4'],
        completed: false,
    },

    // ITN Campaign Section
    {
        id: 'itn-1',
        name: 'Macro Planning',
        section: 'itn',
        startDate: new Date(2025, 6, 15), // July 15, 2025
        duration: 45,
        dependencies: [],
        completed: false,
    },
    {
        id: 'itn-2',
        name: 'Procurement and Supply Chain Management',
        section: 'itn',
        startDate: new Date(2025, 7, 29), // After itn-1
        duration: 60,
        dependencies: ['itn-1'],
        completed: false,
    },
    {
        id: 'itn-3',
        name: 'Micro Planning',
        section: 'itn',
        startDate: new Date(2025, 8, 29), // After itn-1
        duration: 30,
        dependencies: ['itn-2'],
        completed: false,
    },
    {
        id: 'itn-4',
        name: 'Digitalization',
        section: 'itn',
        startDate: new Date(2025, 9, 28), // After itn-3
        duration: 30,
        dependencies: ['itn-3'],
        completed: false,
    },
    {
        id: 'itn-5',
        name: 'Monitoring and Evaluation',
        section: 'itn',
        startDate: new Date(2025, 10, 28), // After itn-4
        duration: 45,
        dependencies: ['itn-4'],
        completed: false,
    },

    // IRS Campaign Section
    {
        id: 'irs-1',
        name: 'Macro Planning',
        section: 'irs',
        startDate: new Date(2025, 8, 1), // September 1, 2025
        duration: 45,
        dependencies: [],
        completed: false,
    },
    {
        id: 'irs-2',
        name: 'Procurement and Supply Chain Management',
        section: 'irs',
        startDate: new Date(2025, 9, 16), // After irs-1
        duration: 60,
        dependencies: ['irs-1'],
        completed: false,
    },
    {
        id: 'irs-3',
        name: 'Micro Planning',
        section: 'irs',
        startDate: new Date(2025, 10, 16), // After irs-1
        duration: 30,
        dependencies: ['irs-2'],
        completed: false,
    },
    {
        id: 'irs-4',
        name: 'Digitalization',
        section: 'irs',
        startDate: new Date(2025, 11, 16), // After irs-3
        duration: 30,
        dependencies: ['irs-3'],
        completed: false,
    },
    {
        id: 'irs-5',
        name: 'Monitoring and Evaluation',
        section: 'irs',
        startDate: new Date(2025, 12, 16), // After irs-4
        duration: 45,
        dependencies: ['irs-4'],
        completed: false,
    },


];

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [showTaskPanel, setShowTaskPanel] = useState<boolean>(true);
    const [activeView, setActiveView] = useState<string>('all');

    // Check if task can be completed (all dependencies are completed)
    const canCompleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;

        if (task.dependencies.length === 0) return true;

        return task.dependencies.every(depId => {
            const depTask = tasks.find(t => t.id === depId);
            return depTask?.completed === true;
        });
    };

    // Toggle task completion status
    const toggleTaskCompletion = (taskId: string) => {
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
    };

    // Update task comment
    const updateTaskComment = (taskId: string, comment: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, comments: comment } : task
            )
        );
    };
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto p-4">
                <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-700">Campaigns</h1>
                    <div>
                        <button
                            onClick={() => setShowTaskPanel(!showTaskPanel)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            {showTaskPanel ? 'Hide Task Panel' : 'Show Task Panel'}
                        </button>
                    </div>
                </header>

                <div className="mb-6 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">View Options</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveView('all')}
                            className={`px-3 py-1 rounded-full ${activeView === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            All Tasks
                        </button>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveView(section.id)}
                                className={`px-3 py-1 rounded-full ${activeView === section.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {showTaskPanel && (
                        <div className="lg:col-span-4">
                            <TaskList
                                tasks={tasks}
                                sections={sections}
                                toggleTaskCompletion={toggleTaskCompletion}
                                updateTaskComment={updateTaskComment}
                                canCompleteTask={canCompleteTask}
                                activeView={activeView}
                            />
                        </div>
                    )}
                    <div className={showTaskPanel ? "lg:col-span-8" : "lg:col-span-12"}>
                    </div>
                </div>
            </div>
        </div>
    );
}