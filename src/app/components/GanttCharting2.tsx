'use client';

import React, { useEffect, useRef, useState } from 'react';

// Type definitions for JSCharting Library
interface JSChartAxisConfig {
    scale?: string;
    interval?: {
        unit: string;
        multiplier: number;
    };
    formatString?: string;
    label?: string | {
        text: string;
        style?: {
            fontSize: string;
            fontWeight: string;
        };
    };
    crosshair?: {
        enabled: boolean;
        gridLine?: {
            width: number;
            color: string;
            dashStyle: string;
        };
    };
    defaultTick?: {
        padding?: number[];
        label?: {
            style?: {
                fontSize: string;
            };
        };
    };
}

interface JSChartAnnotation {
    label: {
        text: string;
        style: {
            fontSize: string;
            fontWeight: string;
            color: string;
        };
    };
    position: string;
}

interface JSChartEventArgs {
    point: {
        id: string;
        name: string;
        attributes: Record<string, unknown>;
    };
}

interface JSChartEventSender {
    [key: string]: unknown;
}

type JSChartEventCallback = (sender: JSChartEventSender, args: JSChartEventArgs) => void;

interface JSChartPointInstance {
    id: string;
    name: string;
    attributes: Record<string, unknown>;
    options: (newOptions: Record<string, unknown>) => void;
}

interface JSChartSeriesInstance {
    on: (event: string, callback: JSChartEventCallback) => void;
    points: () => JSChartPointInstance[];
}

interface JSChartInstance {
    dispose: () => void;
    series: (index?: number) => JSChartSeriesInstance | JSChartSeriesInstance[];
}

interface JSChartPoint {
    id: string;
    name: string;
    x: [string, string];
    y: string;
    z: number;
    attributes: {
        progress: number;
        resources: string;
        priority: string;
        notes: string;
        critical: boolean;
        milestone: boolean;
        dependencies: string[];
        parent?: string;
    };
    color: string;
    marker?: {
        size?: number;
        type?: string;
    };
    outline?: {
        width: number;
        color?: string;
    };
}

interface JSChartSeries {
    name: string;
    points: JSChartPoint[];
}

interface JSChartConfig {
    type: string;
    title: {
        label: {
            text: string;
            style: {
                fontSize: string;
                fontWeight: string;
                color: string;
            };
        };
    };
    legend: {
        visible: boolean;
        position: string;
    };
    toolbar: {
        visible: boolean;
        items: string[];
    };
    defaultPoint: {
        tooltip: {
            enabled: boolean;
            template: string;
        };
        states: {
            hover: {
                opacity: number;
                outline: {
                    width: number;
                    color: string;
                };
            };
            select: {
                opacity: number;
                outline: {
                    width: number;
                    color: string;
                };
            };
        };
    };
    xAxis: JSChartAxisConfig;
    yAxis: JSChartAxisConfig;
    annotations: JSChartAnnotation[];
    series: JSChartSeries[];
    mouseTracking: boolean;
    defaultSeries: {
        mouseTracking: boolean;
        states: {
            hover: {
                enabled: boolean;
            };
            select: {
                enabled: boolean;
            };
        };
    };
}

interface JSChartingLibrary {
    chart: (container: HTMLElement, config: JSChartConfig) => JSChartInstance;
}

// Type definitions for JSCharting Gantt data
interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
    resources?: string[];
    parent?: string;
    color?: string;
    milestone?: boolean;
    critical?: boolean;
    type?: 'task' | 'milestone' | 'summary';
    dependencies?: string[];
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
}

const GanttChartComponent: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<JSChartInstance | null>(null);
    const [isJSCLoaded, setIsJSCLoaded] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    // Comprehensive fake project data
    const ganttData: GanttTask[] = [
        {
            id: 'proj-start',
            name: 'Project Kickoff',
            start: '2024-01-01',
            end: '2024-01-01',
            milestone: true,
            color: '#FF6B6B',
            critical: true,
            priority: 'critical',
            notes: 'Official project launch meeting'
        },
        {
            id: 'planning',
            name: 'Project Planning',
            start: '2024-01-02',
            end: '2024-01-15',
            progress: 100,
            type: 'summary',
            color: '#4ECDC4',
            resources: ['Project Manager', 'Business Analyst'],
            priority: 'high'
        },
        {
            id: 'requirements',
            name: 'Requirements Gathering',
            start: '2024-01-02',
            end: '2024-01-08',
            parent: 'planning',
            progress: 100,
            resources: ['Business Analyst', 'Stakeholders'],
            notes: 'Collect and document all functional requirements',
            priority: 'high'
        },
        {
            id: 'analysis',
            name: 'Technical Analysis',
            start: '2024-01-09',
            end: '2024-01-15',
            parent: 'planning',
            progress: 100,
            dependencies: ['requirements'],
            resources: ['Tech Lead', 'Architect'],
            priority: 'medium'
        },
        {
            id: 'design',
            name: 'Design Phase',
            start: '2024-01-16',
            end: '2024-02-05',
            progress: 90,
            type: 'summary',
            color: '#45B7D1',
            dependencies: ['planning'],
            resources: ['UI/UX Designer', 'Frontend Lead'],
            priority: 'high'
        },
        {
            id: 'wireframes',
            name: 'Wireframe Creation',
            start: '2024-01-16',
            end: '2024-01-22',
            parent: 'design',
            progress: 100,
            resources: ['UI/UX Designer'],
            notes: 'Low-fidelity wireframes for all screens'
        },
        {
            id: 'mockups',
            name: 'High-Fidelity Mockups',
            start: '2024-01-23',
            end: '2024-01-30',
            parent: 'design',
            progress: 95,
            dependencies: ['wireframes'],
            resources: ['UI/UX Designer', 'Graphic Designer'],
            priority: 'medium'
        },
        {
            id: 'prototype',
            name: 'Interactive Prototype',
            start: '2024-01-31',
            end: '2024-02-05',
            parent: 'design',
            progress: 75,
            dependencies: ['mockups'],
            resources: ['UI/UX Designer'],
            critical: true,
            priority: 'high'
        },
        {
            id: 'development',
            name: 'Development Phase',
            start: '2024-02-06',
            end: '2024-04-15',
            progress: 65,
            type: 'summary',
            color: '#96CEB4',
            dependencies: ['design'],
            resources: ['Development Team'],
            priority: 'critical'
        },
        {
            id: 'backend-setup',
            name: 'Backend Infrastructure',
            start: '2024-02-06',
            end: '2024-02-20',
            parent: 'development',
            progress: 100,
            resources: ['Backend Developer', 'DevOps Engineer'],
            notes: 'Database setup, API framework, cloud infrastructure',
            priority: 'critical'
        },
        {
            id: 'api-development',
            name: 'API Development',
            start: '2024-02-21',
            end: '2024-03-15',
            parent: 'development',
            progress: 80,
            dependencies: ['backend-setup'],
            resources: ['Backend Developer', 'Senior Developer'],
            critical: true,
            priority: 'high'
        },
        {
            id: 'frontend-setup',
            name: 'Frontend Setup',
            start: '2024-02-06',
            end: '2024-02-12',
            parent: 'development',
            progress: 100,
            resources: ['Frontend Developer'],
            notes: 'React setup, build tools, component library'
        },
        {
            id: 'ui-components',
            name: 'UI Components',
            start: '2024-02-13',
            end: '2024-03-01',
            parent: 'development',
            progress: 90,
            dependencies: ['frontend-setup', 'prototype'],
            resources: ['Frontend Developer', 'UI Developer'],
            priority: 'medium'
        },
        {
            id: 'integration',
            name: 'Frontend-Backend Integration',
            start: '2024-03-02',
            end: '2024-03-25',
            parent: 'development',
            progress: 60,
            dependencies: ['ui-components', 'api-development'],
            resources: ['Full Stack Developer', 'Frontend Developer'],
            critical: true,
            priority: 'high'
        },
        {
            id: 'mobile-responsive',
            name: 'Mobile Responsiveness',
            start: '2024-03-26',
            end: '2024-04-05',
            parent: 'development',
            progress: 40,
            dependencies: ['integration'],
            resources: ['Frontend Developer'],
            priority: 'medium'
        },
        {
            id: 'performance',
            name: 'Performance Optimization',
            start: '2024-04-06',
            end: '2024-04-15',
            parent: 'development',
            progress: 20,
            dependencies: ['mobile-responsive'],
            resources: ['Senior Developer', 'Performance Specialist'],
            priority: 'high'
        },
        {
            id: 'testing',
            name: 'Testing Phase',
            start: '2024-03-16',
            end: '2024-04-30',
            progress: 35,
            type: 'summary',
            color: '#FECA57',
            dependencies: ['api-development'],
            resources: ['QA Team'],
            priority: 'high'
        },
        {
            id: 'unit-testing',
            name: 'Unit Testing',
            start: '2024-03-16',
            end: '2024-04-01',
            parent: 'testing',
            progress: 70,
            resources: ['Developers', 'QA Engineer'],
            notes: 'Automated unit tests for all components'
        },
        {
            id: 'integration-testing',
            name: 'Integration Testing',
            start: '2024-04-02',
            end: '2024-04-15',
            parent: 'testing',
            progress: 45,
            dependencies: ['unit-testing', 'integration'],
            resources: ['QA Engineer', 'Test Automation'],
            critical: true,
            priority: 'high'
        },
        {
            id: 'user-testing',
            name: 'User Acceptance Testing',
            start: '2024-04-16',
            end: '2024-04-25',
            parent: 'testing',
            progress: 10,
            dependencies: ['integration-testing'],
            resources: ['QA Lead', 'End Users'],
            priority: 'critical'
        },
        {
            id: 'security-testing',
            name: 'Security Testing',
            start: '2024-04-20',
            end: '2024-04-30',
            parent: 'testing',
            progress: 0,
            dependencies: ['user-testing'],
            resources: ['Security Specialist'],
            critical: true,
            priority: 'critical'
        },
        {
            id: 'deployment',
            name: 'Deployment & Launch',
            start: '2024-05-01',
            end: '2024-05-15',
            progress: 0,
            type: 'summary',
            color: '#FF9FF3',
            dependencies: ['testing', 'development'],
            resources: ['DevOps Team'],
            priority: 'critical'
        },
        {
            id: 'staging-deploy',
            name: 'Staging Deployment',
            start: '2024-05-01',
            end: '2024-05-05',
            parent: 'deployment',
            progress: 0,
            resources: ['DevOps Engineer'],
            notes: 'Deploy to staging environment for final testing'
        },
        {
            id: 'prod-deploy',
            name: 'Production Deployment',
            start: '2024-05-06',
            end: '2024-05-10',
            parent: 'deployment',
            progress: 0,
            dependencies: ['staging-deploy'],
            resources: ['DevOps Engineer', 'Release Manager'],
            critical: true,
            priority: 'critical'
        },
        {
            id: 'launch',
            name: 'Official Launch',
            start: '2024-05-15',
            end: '2024-05-15',
            milestone: true,
            dependencies: ['prod-deploy'],
            color: '#FF6B6B',
            critical: true,
            priority: 'critical',
            notes: 'Public launch and announcement'
        },
        {
            id: 'post-launch',
            name: 'Post-Launch Support',
            start: '2024-05-16',
            end: '2024-06-30',
            progress: 0,
            color: '#A8E6CF',
            dependencies: ['launch'],
            resources: ['Support Team', 'Developers'],
            priority: 'medium'
        }
    ];

    // Validate Gantt data
    const validateGanttData = (data: GanttTask[]) => {
        data.forEach(task => {
            if (!task.start || !task.end || isNaN(Date.parse(task.start)) || isNaN(Date.parse(task.end))) {
                console.error(`Invalid date for task ${task.name}: start=${task.start}, end=${task.end}`);
                throw new Error(`Invalid date for task ${task.name}`);
            }
        });
    };

    // Load JSCharting library dynamically
    useEffect(() => {
        let isMounted = true;

        const loadJSCharting = async () => {
            try {
                const JSC = await import('jscharting');
                if (isMounted) {
                    setIsJSCLoaded(true);
                }
            } catch (error) {
                if (isMounted) {
                    setLoadingError('Failed to load JSCharting library. Please ensure jscharting is installed via npm.');
                    console.error('JSCharting load error:', error);
                }
            }
        };

        loadJSCharting();

        return () => {
            isMounted = false;
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    // Initialize chart when JSCharting is loaded
    useEffect(() => {
        if (!isJSCLoaded || !chartRef.current) return;

        const initializeChart = async () => {
            try {
                validateGanttData(ganttData);
                const JSC = await import('jscharting');
                if (!chartRef.current) {
                    setLoadingError('Chart container not found. Please ensure the component is rendered.');
                    return;
                }

                // Ensure the div has dimensions
                chartRef.current.style.minHeight = '500px';
                chartRef.current.style.minWidth = '100%';

                // Map ganttData to JSCharting points
                const points: JSChartPoint[] = ganttData.map((task) => ({
                    id: task.id,
                    name: task.name,
                    x: [task.start, task.end],
                    y: task.name,
                    z: task.progress || 0,
                    attributes: {
                        progress: task.progress || 0,
                        resources: task.resources?.join(', ') || '',
                        priority: task.priority || 'medium',
                        notes: task.notes || '',
                        critical: !!task.critical,
                        milestone: !!task.milestone,
                        dependencies: task.dependencies || [],
                        parent: task.parent
                    },
                    color: task.color || '#4B5EAA',
                    marker: task.milestone
                        ? { type: 'diamond', size: 12 }
                        : undefined,
                    outline: task.critical
                        ? { width: 2, color: '#FF4D4D' }
                        : { width: 1, color: '#000000' }
                }));

                const config: JSChartConfig = {
                    type: 'gantt',
                    title: {
                        label: {
                            text: 'Project Timeline',
                            style: {
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1A202C'
                            }
                        }
                    },
                    legend: {
                        visible: false,
                        position: 'top'
                    },
                    toolbar: {
                        visible: true,
                        items: ['export', 'zoom', 'pan']
                    },
                    defaultPoint: {
                        tooltip: {
                            enabled: true,
                            template: `
                                <b>{%name}</b><br/>
                                Start: {%xStart}<br/>
                                End: {%xEnd}<br/>
                                Progress: {%z}%<br/>
                                Resources: {point.attributes.resources}<br/>
                                Priority: {point.attributes.priority}<br/>
                                Notes: {point.attributes.notes}
                            `
                        },
                        states: {
                            hover: {
                                opacity: 0.9,
                                outline: {
                                    width: 2,
                                    color: '#3182CE'
                                }
                            },
                            select: {
                                opacity: 1,
                                outline: {
                                    width: 3,
                                    color: '#DD6B20'
                                }
                            }
                        }
                    },
                    xAxis: {
                        scale: 'time',
                        interval: {
                            unit: 'day',
                            multiplier: 7
                        },
                        formatString: 'MMM dd, yyyy',
                        label: {
                            text: 'Timeline',
                            style: {
                                fontSize: '14px',
                                fontWeight: '500'
                            }
                        },
                        crosshair: {
                            enabled: true,
                            gridLine: {
                                width: 1,
                                color: '#A0AEC0',
                                dashStyle: 'dash'
                            }
                        }
                    },
                    yAxis: {
                        label: {
                            text: 'Tasks',
                            style: {
                                fontSize: '14px',
                                fontWeight: '500'
                            }
                        },
                        defaultTick: {
                            padding: [5, 10],
                            label: {
                                style: {
                                    fontSize: '12px'
                                }
                            }
                        }
                    },
                    annotations: [
                        {
                            label: {
                                text: 'Today',
                                style: {
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#E53E3E'
                                }
                            },
                            position: `x=${new Date().toISOString().split('T')[0]},y=0`
                        }
                    ],
                    series: [
                        {
                            name: 'Tasks',
                            points
                        }
                    ],
                    mouseTracking: true,
                    defaultSeries: {
                        mouseTracking: true,
                        states: {
                            hover: { enabled: true },
                            select: { enabled: true }
                        }
                    }
                };

                chartInstance.current = JSC.chart(chartRef.current, config);

                // Add click event for interactivity
                const series = chartInstance.current.series(0) as JSChartSeriesInstance;
                series.on('pointClick', (sender, args) => {
                    console.log(`Clicked task: ${args.point.name} (ID: ${args.point.id})`);
                    const newProgress = Math.min((args.point.attributes.progress as number || 0) + 10, 100);
                    args.point.options({
                        z: newProgress,
                        attributes: {
                            ...args.point.attributes,
                            progress: newProgress
                        }
                    });
                });
            } catch (error) {
                setLoadingError(`Failed to initialize chart. Error: ${error.message}`);
                console.error('Chart initialization error:', error);
            }
        };

        initializeChart();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [isJSCLoaded]);

    // Function to update task progress
    const updateTaskProgress = (taskId: string, newProgress: number): void => {
        if (chartInstance.current) {
            const series = chartInstance.current.series(0) as JSChartSeriesInstance;
            const point = series.points().find((p: JSChartPointInstance) => p.id === taskId);
            if (point) {
                point.options({
                    z: newProgress,
                    attributes: {
                        ...point.attributes,
                        progress: newProgress
                    }
                });
                console.log(`Updated task ${taskId} progress to ${newProgress}%`);
            }
        }
    };

    // Demo: Example button to update a task's progress
    const handleUpdateProgress = () => {
        updateTaskProgress('prototype', Math.floor(Math.random() * 100));
    };

    return (
        <div className="w-full p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Advanced Gantt Chart with JSCharting
    </h2>
    <p className="text-gray-600 mb-2">
        Interactive project timeline with progress tracking, dependencies, and resource management
    </p>

    {!isJSCLoaded && !loadingError && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
            <div>
                <strong>Loading JSCharting...</strong> Initializing chart library.
    </div>
    <button
        onClick={() => {
        setLoadingError(null);
        setIsJSCLoaded(false);
        window.location.reload();
    }}
        className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
            >
            Retry
            </button>
            </div>
            </div>
    )}

    {/*{loadingError && (*/}
    {/*    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">*/}
    {/*        <div className="mb-2">*/}
    {/*            <strong>JSCharting Loading Failed:</strong> {loadingError}*/}
    {/*        </div>*/}
    {/*        <div className="space-y-2 text-xs">*/}
    {/*            <div>*/}
    {/*                <strong>Install Dependency:</strong>{' '}*/}
    {/*                <code className="bg-red-100 px-1 rounded">*/}
    {/*                    npm install jscharting*/}
    {/*                </code>*/}
    {/*            </div>*/}
    {/*            <div>*/}
    {/*                <strong>Check Documentation:</strong>{' '}*/}
    {/*                <a*/}
    {/*                    href="https://jscharting.com/"*/}
    {/*                    target="_blank"*/}
    {/*                    rel="noopener noreferrer"*/}
    {/*                    className="text-blue-600 underline"*/}
    {/*                >*/}
    {/*                    JSCharting Docs*/}
    {/*                </a>*/}
    {/*            </div>*/}
    {/*            <div className="pt-2">*/}
    {/*                <button*/}
    {/*                    onClick={() => {*/}
    {/*                        setLoadingError(null);*/}
    {/*                        setIsJSCLoaded(false);*/}
    {/*                        window.location.reload();*/}
    {/*                    }}*/}
    {/*                    className="bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"*/}
    {/*                >*/}
    {/*                    Try Again*/}
    {/*                </button>*/}
    {/*            </div>*/}
    {/*        </div>*/}
    {/*    </div>*/}
    {/*)}*/}

    {isJSCLoaded && (
        <div className="text-sm font-semibold text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <strong>✔ JSCharting loaded successfully!</strong> Chart is ready for interaction.
    </div>
    )}
    </div>

    {/* Chart Container */}
    <div
        ref={chartRef}
    className={`w-full bg-white border border-gray-200 rounded-lg ${!isJSCLoaded ? 'flex items-center justify-center' : ''}`}
    style={{ height: '500px' }}
>
    {!isJSCLoaded && !loadingError && (
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading chart...</p>
    </div>
    )}
    {/*{loadingError && (*/}
    {/*    <div className="text-center">*/}
    {/*        <div className="text-red-500 mb-4">*/}
    {/*            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
    {/*                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />*/}
    {/*            </svg>*/}
    {/*        </div>*/}
    {/*        <p className="text-red-600 text-sm">Failed to load chart</p>*/}
    {/*        <p className="text-gray-400 text-xs mt-2">Please check console for details or retry</p>*/}
    {/*    </div>*/}
    {/*)}*/}
    </div>

    {/* Control Panel */}
    {/*<div className="mt-6 p-4 bg-gray-100 rounded-lg">*/}
    {/*    <h3 className="text-lg font-semibold text-gray-700 mb-3">Chart Features Demonstrated:</h3>*/}
    {/*    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">*/}
    {/*        <div className="flex items-center">*/}
    {/*            <div className="w-3 h-3 bg-blue-500 rounded-lg mr-2"></div>*/}
    {/*            <span>Regular Tasks</span>*/}
    {/*        </div>*/}
    {/*        <div className="flex items-center">*/}
    {/*            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>*/}
    {/*            <span>Critical Path</span>*/}
    {/*        </div>*/}
    {/*        <div className="flex items-center">*/}
    {/*            <div className="w-3 h-3 bg-yellow-400 rounded mr-2" style={{ transform: 'rotate(45deg)' }}></div>*/}
    {/*            <span>Milestones</span>*/}
    {/*        </div>*/}
    {/*        <div className="flex items-center">*/}
    {/*            <div className="w-3 h-3 bg-green-600 rounded-lg mr-2"></div>*/}
    {/*            <span>Completed Tasks</span>*/}
    {/*        </div>*/}
    {/*    </div>*/}

    {/*    <div className="mt-4 text-xs text-gray-600">*/}
    {/*        <div>*/}
    {/*            <p><strong>Interactive Features:</strong> Hover for task details, click to update progress, zoom/pan, export options</p>*/}
    {/*            <p><strong>Data Features:</strong> Progress tracking, resource assignment, task dependencies, priority levels</p>*/}
    {/*        </div>*/}

    {/*        <div className="mt-4">*/}
    {/*            <button*/}
    {/*                onClick={handleUpdateProgress}*/}
    {/*                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"*/}
    {/*            >*/}
    {/*                Update Prototype Progress (Demo)*/}
    {/*            </button>*/}
    {/*        </div>*/}
    {/*    </div>*/}
    {/*</div>*/}
    </div>
    </div>
);
};

export default GanttChartComponent;