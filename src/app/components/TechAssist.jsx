import React, { useState, useMemo } from 'react';
import {
    Calendar, Filter, AlertTriangle, CheckCircle, Clock, Pause, XCircle, Users,
    Download, RefreshCw, FileText, Zap, Target, Eye, EyeOff, Layers, ChevronDown
} from 'lucide-react';

const TechAssistPM = () => {
    // const [activeView, setActiveView] = useState('gantt');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);
    const [currentTimeView, setCurrentTimeView] = useState('quarter');
    const [showDependencies, setShowDependencies] = useState(true);
    const [activeCampaign, setActiveCampaign] = useState('GF8');
    const [expandedCountries, setExpandedCountries] = useState({});

    const toggleCountryExpansion = (country) => {
        setExpandedCountries(prev => ({
            ...prev,
            [country]: !prev[country]
        }));
    };

    // const navigationTabs = [
    //     { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    //     { id: 'gantt', icon: Calendar, label: 'Gantt Chart', active: true },
    //     { id: 'requests', icon: FileText, label: 'Country Requests' },
    //     { id: 'tasks', icon: Target, label: 'Tasks & Roadmaps' },
    //     { id: 'partners', icon: Users, label: 'Partners' },
    //     { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    //     { id: 'settings', icon: Settings, label: 'Settings' }
    // ];

    const statusFilters = [
        { id: 'all', icon: Layers, color: 'bg-gray-100 text-gray-700' },
        { id: 'completed', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
        { id: 'progress', icon: Clock, color: 'bg-blue-100 text-blue-700' },
        { id: 'pending', icon: Pause, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'blocked', icon: XCircle, color: 'bg-red-100 text-red-700' },
        { id: 'new', icon: Zap, color: 'bg-blue-100 text-blue-700' },
        { id: 'orphaned', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' }
    ];

    const timeViewOptions = [
        { id: 'quarter', label: 'Quarter' },
        { id: 'month', label: 'Month' },
        { id: 'week', label: 'Week' },
        { id: 'day', label: 'Day' }
    ];

    const projects = [
        {
            id: 1,
            name: 'Malaria Outbreak Response Emergency',
            country: 'Botswana',
            resource: 'RBM',
            duration: '20d',
            completion: 100,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            status: 'completed',
            category: 'Implementation bottlenecks',
            partner: 'RBM',
            dependencies: [],
            dependsOn: [],
            quarter: 1,
            month: 1
        },
        {
            id: 2,
            name: 'Developing scenarios for malaria technical assistance',
            country: 'Botswana',
            resource: 'To be confirmed',
            duration: '15d',
            completion: 0,
            startDate: '2025-01-15',
            endDate: '2025-03-31',
            status: 'new',
            category: 'Implementation bottlenecks',
            partner: 'To be confirmed',
            dependencies: [3, 4],
            dependsOn: [1],
            quarter: 1,
            month: 1
        },
        {
            id: 3,
            name: 'Insecticide-Treated Net Distribution',
            country: 'Kenya',
            resource: 'PMI',
            duration: '30d',
            completion: 50,
            startDate: '2025-04-01',
            endDate: '2025-06-30',
            status: 'progress',
            category: 'Vector control',
            partner: 'PMI',
            dependencies: [4],
            dependsOn: [],
            quarter: 2,
            month: 4
        },
        {
            id: 4,
            name: 'Seasonal Malaria Chemoprevention',
            country: 'Uganda',
            resource: 'Global Fund',
            duration: '25d',
            completion: 0,
            startDate: '2025-07-01',
            endDate: '2025-09-30',
            status: 'pending',
            category: 'Chemoprevention',
            partner: 'Global Fund',
            dependencies: [5],
            dependsOn: [3],
            quarter: 3,
            month: 7
        },
        {
            id: 5,
            name: 'Malaria Case Management Training',
            country: 'Nigeria',
            resource: 'WHO',
            duration: '40d',
            completion: 0,
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            status: 'new',
            category: 'Case management',
            partner: 'WHO',
            dependencies: [],
            dependsOn: [4],
            quarter: 4,
            month: 10
        },
        {
            id: 6,
            name: 'Indoor Residual Spraying Campaign',
            country: 'Ghana',
            resource: 'To be confirmed',
            duration: '35d',
            completion: 0,
            startDate: '2025-04-01',
            endDate: '2025-09-30',
            status: 'orphaned',
            category: 'Vector control',
            partner: 'To be confirmed',
            dependencies: [],
            dependsOn: [],
            quarter: 2,
            month: 4
        }
    ];

    const campaignDependencies = {
        'GF8': {
            name: 'Global Fund Round 8',
            color: 'bg-indigo-100 text-indigo-800',
            dependencies: [
                { id: 'gf8-1', name: 'Malaria Program Review', stage: 'Assessment', status: 'ready', duration: '20d' },
                { id: 'gf8-2', name: 'NSP at Mid-Level completion', stage: 'Planning', status: 'ready', duration: '15d' }
            ]
        },
        'NSP': {
            name: 'National Strategic Plan',
            color: 'bg-purple-100 text-purple-800',
            dependencies: [
                { id: 'nsp-1', name: 'Research', stage: 'Research', status: 'progress', duration: '45d', comment: 'Change to NSP can be proposed based on research result' }
            ]
        }
    };

    // const getCountryDependencies = (country) => {
    //     const countryDeps = [];
    //     Object.entries(campaignDependencies).forEach(([campaign, data]) => {
    //         data.dependencies.forEach(dep => {
    //             countryDeps.push({
    //                 ...dep,
    //                 campaign,
    //                 campaignName: data.name,
    //                 campaignColor: data.color,
    //                 country
    //             });
    //         });
    //     });
    //     return countryDeps;
    // };

    const getStatusIcon = (status) => {
        const icons = {
            completed: <CheckCircle className="w-4 h-4 text-green-600" />,
            progress: <Clock className="w-4 h-4 text-blue-600" />,
            pending: <Pause className="w-4 h-4 text-yellow-600" />,
            blocked: <XCircle className="w-4 h-4 text-red-600" />,
            new: <Zap className="w-4 h-4 text-blue-600" />,
            ready: <CheckCircle className="w-4 h-4 text-blue-600" />,
            orphaned: <AlertTriangle className="w-4 h-4 text-orange-600" />
        };
        return icons[status] || <Clock className="w-4 h-4 text-gray-600" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-600',
            progress: 'bg-blue-600',
            pending: 'bg-yellow-600',
            blocked: 'bg-red-600',
            new: 'bg-blue-600',
            ready: 'bg-blue-600',
            orphaned: 'bg-orange-600'
        };
        return colors[status] || 'bg-gray-600';
    };

    const getCountryFlag = (country) => {
        const flags = {
            'Botswana': '🇧🇼',
            'Kenya': '🇰🇪',
            'Uganda': '🇺🇬',
            'Nigeria': '🇳🇬',
            'Ghana': '🇬🇭'
        };
        return flags[country] || '🏳️';
    };

    const renderDependencyArrows = (project) => {
        if (!showDependencies || !project.dependencies.length) return null;
        return (
            <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-500 z-10" title={`Depends on: ${project.dependencies.join(', ')}`}>
                <div className="absolute -right-1 top-1/2 w-0 h-0 border-l-4 border-l-purple-500 border-t-4 border-b-4 border-transparent transform -translate-y-1/2" />
            </div>
        );
    };

    const filteredProjects = useMemo(() => {
        return projects
            .filter(project => activeFilter === 'all' || project.status === activeFilter)
            .filter(project => showCompleted || project.status !== 'completed')
            .sort((a, b) => {
                const priorityOrder = { 'new': 0, 'orphaned': 1, 'progress': 2, 'pending': 3, 'completed': 4, 'blocked': 5 };
                return priorityOrder[a.status] - priorityOrder[b.status];
            });
    }, [activeFilter, showCompleted]);

    const groupedProjects = useMemo(() => {
        return filteredProjects.reduce((acc, project) => {
            if (!acc[project.country]) {
                acc[project.country] = [];
            }
            acc[project.country].push(project);
            return acc;
        }, {});
    }, [filteredProjects]);

    const getTimelineHeaders = () => {
        if (currentTimeView === 'quarter') {
            return ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
        } else if (currentTimeView === 'month') {
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }
        return ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    };

    const renderTimelineBar = (project) => {
        const headers = getTimelineHeaders();
        const isQuarterView = currentTimeView === 'quarter';
        // const unitCount = isQuarterView ? 4 : 12;
        const unitKey = isQuarterView ? 'quarter' : 'month';
        const startUnit = project[unitKey] - 1;
        const durationDays = parseInt(project.duration);
        const unitWidth = durationDays / (isQuarterView ? 90 : 30);

        return headers.map((header, index) => {
            const isActive = isQuarterView ? index + 1 === project.quarter : index + 1 === project.month;
            const isInProgress = project.status === 'progress' && index >= startUnit && index < startUnit + Math.ceil(unitWidth);
            return (
                <div key={header} className="relative bg-gray-200 rounded h-6">
                    {project.status === 'completed' && isActive && (
                        <div className={`absolute inset-0 ${getStatusColor(project.status)} rounded`} />
                    )}
                    {(project.status === 'new' || project.status === 'orphaned') && isActive && (
                        <div className={`absolute inset-0 ${getStatusColor(project.status)} rounded opacity-80 animate-pulse`} />
                    )}
                    {isInProgress && (
                        <div className={`absolute inset-0 ${getStatusColor(project.status)} rounded opacity-70`} style={{ width: `${(unitWidth % 1) * 100}%` }} />
                    )}
                    {isActive && !['completed', 'new', 'orphaned', 'progress'].includes(project.status) && (
                        <div className={`absolute inset-0 ${getStatusColor(project.status)} rounded`} />
                    )}
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Implementation Support Requests</h1>
                            <p className="text-sm text-gray-600">IS Monitoring</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" aria-label="Print report">
                            <Download className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar Navigation */}
                {/*<div className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">*/}
                {/*    /!*<div className="p-4">*!/*/}
                {/*    /!*    <nav className="space-y-2">*!/*/}
                {/*    /!*        {navigationTabs.map((tab) => {*!/*/}
                {/*    /!*            const Icon = tab.icon;*!/*/}
                {/*    /!*            return (*!/*/}
                {/*    /!*                <button*!/*/}
                {/*    /!*                    key={tab.id}*!/*/}
                {/*    /!*                    onClick={() => setActiveView(tab.id)}*!/*/}
                {/*    /!*                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${*!/*/}
                {/*    /!*                        activeView === tab.id*!/*/}
                {/*    /!*                            ? 'bg-blue-50 text-blue-700 border border-blue-200'*!/*/}
                {/*    /!*                            : 'text-gray-700 hover:bg-gray-50'*!/*/}
                {/*    /!*                    } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}*!/*/}
                {/*    /!*                    aria-label={`Switch to ${tab.label} view`}*!/*/}
                {/*    /!*                >*!/*/}
                {/*    /!*                    <Icon className="w-5 h-5" />*!/*/}
                {/*    /!*                    <span className="font-medium">{tab.label}</span>*!/*/}
                {/*    /!*                </button>*!/*/}
                {/*    /!*            );*!/*/}
                {/*    /!*        })}*!/*/}
                {/*    /!*    </nav>*!/*/}
                {/*    /!*</div>*!/*/}

                {/*    /!* Filter Section *!/*/}
                {/*    /!*<div className="p-4 border-t border-gray-200">*!/*/}
                {/*    /!*    <div className="flex items-center space-x-2 mb-3">*!/*/}
                {/*    /!*        <Filter className="w-4 h-4 text-gray-600" />*!/*/}
                {/*    /!*        <span className="text-sm font-medium text-gray-700">Filter by Country</span>*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    /!*    <div className="relative">*!/*/}
                {/*    /!*        <select*!/*/}
                {/*    /!*            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"*!/*/}
                {/*    /!*            aria-label="Filter by country"*!/*/}
                {/*    /!*        >*!/*/}
                {/*    /!*            <option>All Countries</option>*!/*/}
                {/*    /!*            {Object.keys(groupedProjects).map(country => (*!/*/}
                {/*    /!*                <option key={country}>{country}</option>*!/*/}
                {/*    /!*            ))}*!/*/}
                {/*    /!*        </select>*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    /!*    <div className="mt-4 relative">*!/*/}
                {/*    /!*        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />*!/*/}
                {/*    /!*        <input*!/*/}
                {/*    /!*            type="text"*!/*/}
                {/*    /!*            placeholder="Search..."*!/*/}
                {/*    /!*            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"*!/*/}
                {/*    /!*            aria-label="Search projects"*!/*/}
                {/*    /!*        />*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    /!*</div>*!/*/}
                {/*</div>*/}

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Page Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Gantt Chart</h2>
                                <p className="text-sm text-gray-600">Unified timeline view of requests, tasks, and dependencies</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {timeViewOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setCurrentTimeView(option.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            currentTimeView === option.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        aria-label={`View by ${option.label}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icon-based Filters */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <div className="flex items-center space-x-2">
                                        {statusFilters.map((filter) => {
                                            const Icon = filter.icon;
                                            return (
                                                <button
                                                    key={filter.id}
                                                    onClick={() => setActiveFilter(filter.id)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        activeFilter === filter.id
                                                            ? filter.color
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                                    aria-label={`Filter by ${filter.id} status`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowDependencies(!showDependencies)}
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                                        showDependencies
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-600'
                                    } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    aria-label={showDependencies ? 'Hide dependencies' : 'Show dependencies'}
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Dependencies</span>
                                </button>

                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label={showCompleted ? 'Hide completed tasks' : 'Show completed tasks'}
                                >
                                    {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    <span>Completed</span>
                                </button>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{filteredProjects.length} items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gantt Chart Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                        {/* Chart Header */}
                        <div className="bg-blue-50 p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Current View: {timeViewOptions.find(opt => opt.id === currentTimeView)?.label}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors" aria-label="Refresh data">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh Data</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors" aria-label="Export data">
                                        <FileText className="w-4 h-4" />
                                        <span>Export Data</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chart Content */}
                        <div className="min-w-[1000px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                                <div className="col-span-2">Country</div>
                                <div className="col-span-3">Activity</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1">Partner</div>
                                <div className="col-span-1">Category</div>
                                <div className="col-span-4">
                                    <div className="text-center mb-2">2025</div>
                                    <div className={`grid ${currentTimeView === 'quarter' ? 'grid-cols-4' : 'grid-cols-12'} gap-2 text-xs text-gray-600`}>
                                        {getTimelineHeaders().map(header => (
                                            <div key={header} className="text-center">{header}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Project Rows Grouped by Country */}
                            {Object.entries(groupedProjects).map(([country, countryProjects]) => (
                                <div key={country} className="border-b border-gray-200">
                                    <div className="bg-gray-100 p-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getCountryFlag(country)}</span>
                                            <h3 className="text-sm font-semibold text-gray-800">{country}</h3>
                                        </div>
                                    </div>
                                    {countryProjects.map((project) => (
                                        <div key={project.id} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 relative transition-colors">
                                            <div className="col-span-2"></div>
                                            <div className="col-span-3">
                                                <div className="text-sm text-gray-900 font-medium">{project.name}</div>
                                                {project.dependsOn.length > 0 && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <Zap className="w-3 h-3 text-purple-500" />
                                                        <span className="text-xs text-purple-600">
                                                            Depends on: {project.dependsOn.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(project.status)}
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            project.status === 'new' ? 'bg-purple-100 text-purple-800' :
                                                                project.status === 'orphaned' ? 'bg-orange-100 text-orange-800' :
                                                                    project.status === 'progress' ? 'bg-blue-100 text-blue-800' :
                                                                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                {(project.status === 'new' || project.status === 'orphaned') && (
                                                    <button className="mt-1 flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" aria-label="Claim task">
                                                        <Users className="w-3 h-3" />
                                                        <span>Claim</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-3 h-3 text-gray-500" />
                                                    <div className="text-sm text-gray-900">{project.partner}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-1">
                                                <div className="flex items-center space-x-1">
                                                    <Target className="w-3 h-3 text-gray-500" />
                                                    <div className="text-sm text-gray-700">{project.category}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-4 relative">
                                                <div className={`grid ${currentTimeView === 'quarter' ? 'grid-cols-4' : 'grid-cols-12'} gap-2 h-6`}>
                                                    {renderTimelineBar(project)}
                                                </div>
                                                {renderDependencyArrows(project)}
                                            </div>
                                        </div>
                                    ))}
                                    {showDependencies && (
                                        <div className="bg-white p-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Zap className="w-5 h-5 text-purple-600" />
                                                    <h4 className="text-sm font-semibold text-gray-800">Campaign Dependencies</h4>
                                                </div>
                                                <button
                                                    onClick={() => toggleCountryExpansion(country)}
                                                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    aria-label={expandedCountries[country] ? `Collapse ${country} dependencies` : `Expand ${country} dependencies`}
                                                >
                                                    <span>{expandedCountries[country] ? 'Collapse' : 'Expand'}</span>
                                                    <ChevronDown className={`w-4 h-4 transform ${expandedCountries[country] ? 'rotate-180' : ''} transition-transform`} />
                                                </button>
                                            </div>
                                            {expandedCountries[country] && (
                                                <div className="transition-all duration-300 ease-in-out">
                                                    <div className="flex border-b border-gray-200 mb-3">
                                                        {Object.entries(campaignDependencies).map(([key]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setActiveCampaign(key)}
                                                                className={`px-4 py-2 text-sm font-medium border-r border-gray-200 hover:bg-gray-50 ${
                                                                    activeCampaign === key ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                                                                } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                                                aria-label={`View ${key} campaign`}
                                                            >
                                                                {key}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-900 mb-3">Dependencies & Stages</h5>
                                                            <div className="space-y-2">
                                                                {Object.entries(campaignDependencies).filter(([key]) => key === activeCampaign).map(([campaignKey, campaign]) => (
                                                                    <div key={campaignKey} className="mb-4">
                                                                        <div className={`px-3 py-1 rounded-lg inline-block mb-2 ${campaign.color}`}>
                                                                            {campaign.name}
                                                                        </div>
                                                                        {campaign.dependencies.map(dep => (
                                                                            <div key={dep.id} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500" aria-label={`Select ${dep.name}`} />
                                                                                        <span className="text-sm text-gray-900">{dep.name}</span>
                                                                                    </div>
                                                                                    {dep.comment && (
                                                                                        <p className="text-xs text-gray-500 ml-6 mt-1">{dep.comment}</p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 ml-4">
                                                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                                        {dep.stage}
                                                                                    </span>
                                                                                    {getStatusIcon(dep.status)}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-900 mb-3">Timeline View</h5>
                                                            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                                                                <div className="mb-4">
                                                                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                                        <span>Q1 2025</span>
                                                                        <span>Q2 2025</span>
                                                                        <span>Q3 2025</span>
                                                                        <span>Q4 2025</span>
                                                                    </div>
                                                                    <div className="relative h-2 bg-gray-200 rounded">
                                                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500"></div>
                                                                        <span className="absolute left-1/2 -top-5 text-xs text-orange-500 transform -translate-x-1/2">TODAY</span>
                                                                    </div>
                                                                </div>
                                                                {Object.entries(campaignDependencies).filter(([key]) => key === activeCampaign).map(([campaignKey, campaign]) => (
                                                                    <div key={campaignKey} className="mb-4">
                                                                        <div className="text-xs font-medium text-gray-700 mb-2">{campaignKey}</div>
                                                                        <div className="space-y-1">
                                                                            {campaign.dependencies.map((dep, idx) => (
                                                                                <div key={dep.id} className="flex items-center">
                                                                                    <div className="w-24 text-xs text-gray-600 truncate">{dep.name}</div>
                                                                                    <div className="flex-1 ml-2">
                                                                                        <div
                                                                                            className={`h-4 rounded text-white text-xs flex items-center justify-center ${getStatusColor(dep.status)}`}
                                                                                            style={{
                                                                                                width: `${parseInt(dep.duration) * 2}px`,
                                                                                                marginLeft: `${idx * 20}px`
                                                                                            }}
                                                                                        >
                                                                                            {dep.duration}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-4 p-3 bg-gray-50 rounded shadow-inner">
                                                                <div className="text-xs font-medium text-gray-700 mb-2">Status Legend</div>
                                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                                    <div className="flex items-center space-x-1">
                                                                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                                                                        <span>Completed</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                                                        <span>In Progress</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                                                                        <span>Pending</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechAssistPM;