import React from 'react';
import Head from 'next/head';

const GanttPage: React.FC = () => {
    return (
        <>
            <Head>
                <title>Project Management Dashboard - JSCharting Gantt</title>
                <meta
                    name="description"
                    content="Interactive Gantt chart for project management with JSCharting"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header Section */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Project Management Dashboard
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Track project progress with interactive Gantt charts
                                </p>
                            </div>

                            <div className="flex space-x-4">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    Export Chart
                                </button>
                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">12</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-yellow-600">8</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">4</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Gantt Chart */}

                    {/* Additional Information */}
                    {/*<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">*/}
                    {/*    /!* Project Timeline *!/*/}
                    {/*    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">*/}
                    {/*        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>*/}
                    {/*        <div className="space-y-4">*/}
                    {/*            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">*/}
                    {/*                <div>*/}
                    {/*                    <p className="font-medium text-blue-900">Project Start</p>*/}
                    {/*                    <p className="text-sm text-blue-600">January 1, 2024</p>*/}
                    {/*                </div>*/}
                    {/*                <div className="bg-blue-100 p-2 rounded-full">*/}
                    {/*                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">*/}
                    {/*                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />*/}
                    {/*                    </svg>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}

                    {/*            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">*/}
                    {/*                <div>*/}
                    {/*                    <p className="font-medium text-green-900">Expected Launch</p>*/}
                    {/*                    <p className="text-sm text-green-600">May 15, 2024</p>*/}
                    {/*                </div>*/}
                    {/*                <div className="bg-green-100 p-2 rounded-full">*/}
                    {/*                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">*/}
                    {/*                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />*/}
                    {/*                    </svg>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}

                    {/*            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">*/}
                    {/*                <div>*/}
                    {/*                    <p className="font-medium text-purple-900">Support Period</p>*/}
                    {/*                    <p className="text-sm text-purple-600">Until June 30, 2024</p>*/}
                    {/*                </div>*/}
                    {/*                <div className="bg-purple-100 p-2 rounded-full">*/}
                    {/*                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">*/}
                    {/*                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />*/}
                    {/*                    </svg>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}

                    {/*    /!* Team Resources *!/*/}
                    {/*    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">*/}
                    {/*        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Resources</h3>*/}
                    {/*        <div className="space-y-3">*/}
                    {/*            {[*/}
                    {/*                { name: 'Project Manager', tasks: 5, utilization: 85 },*/}
                    {/*                { name: 'Frontend Developer', tasks: 8, utilization: 92 },*/}
                    {/*                { name: 'Backend Developer', tasks: 6, utilization: 78 },*/}
                    {/*                { name: 'UI/UX Designer', tasks: 4, utilization: 65 },*/}
                    {/*                { name: 'QA Engineer', tasks: 7, utilization: 88 },*/}
                    {/*            ].map((member, index) => (*/}
                    {/*                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">*/}
                    {/*                    <div className="flex items-center space-x-3">*/}
                    {/*                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">*/}
                    {/*                            {member.name.split(' ').map(n => n[0]).join('')}*/}
                    {/*                        </div>*/}
                    {/*                        <div>*/}
                    {/*                            <p className="font-medium text-gray-900">{member.name}</p>*/}
                    {/*                            <p className="text-sm text-gray-500">{member.tasks} active tasks</p>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}
                    {/*                    <div className="text-right">*/}
                    {/*                        <p className="text-sm font-medium text-gray-900">{member.utilization}%</p>*/}
                    {/*                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">*/}
                    {/*                            <div*/}
                    {/*                                className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"*/}
                    {/*                                style={{ width: `${member.utilization}%` }}*/}
                    {/*                            />*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            ))}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                © 2024 Project Management Dashboard. Powered by JSCharting.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    Documentation
                                </a>
                                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    Support
                                </a>
                                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    API
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
};

export default GanttPage;