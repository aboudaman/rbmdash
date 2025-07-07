'use client';

import React, { useEffect, useRef, useState } from 'react';

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
    const chartInstance = useRef<any>(null);
    const [isJSCLoaded, setIsJSCLoaded] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // Comprehensive project data
    const ganttData: GanttTask[] = [
        // Project Planning Phase
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

        // Design Phase
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

        // Development Phase
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

        // Testing Phase
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

        // Deployment
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
            id: 'launch',
            name: 'Official Launch',
            start: '2024-05-15',
            end: '2024-05-15',
            milestone: true,
            dependencies: ['deployment'],
            color: '#FF6B6B',
            critical: true,
            priority: 'critical',
            notes: 'Public launch and announcement'
        }
    ];

    useEffect(() => {
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (!isJSCLoaded) {
                console.warn('Loading timeout - JSCharting may not be available');
                setLoadingTimeout(true);
            }
        }, 10000); // 10 second timeout

        // Check if JSCharting is already available
        const checkJSCharting = () => {
            console.log('Checking for JSCharting...');
            console.log('Window JSC:', (window as any).JSC);

            if ((window as any).JSC && typeof (window as any).JSC.Chart === 'function') {
                console.log('✅ JSCharting found!');
                setIsJSCLoaded(true);
                clearTimeout(timeout);
                return true;
            }
            return false;
        };

        // Try immediate check
        if (checkJSCharting()) {
            return () => clearTimeout(timeout);
        }

        // If not found, try loading from CDN
        console.log('JSCharting not found, attempting to load from CDN...');

        // Check if script already exists
        let existingScript = document.querySelector('script[src*="jscharting.js"]');

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://code.jscharting.com/latest/jscharting.js';
            script.async = true;

            script.onload = () => {
                console.log('JSCharting script loaded');
                // Check multiple times with delays
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    console.log(`Check attempt ${attempts}`);

                    if (checkJSCharting()) {
                        clearInterval(checkInterval);
                    } else if (attempts >= 20) {
                        console.error('Failed to find JSC after 20 attempts');
                        setLoadingError('JSCharting script loaded but JSC object not available');
                        clearInterval(checkInterval);
                    }
                }, 200);
            };

            script.onerror = (error) => {
                console.error('Failed to load JSCharting script:', error);
                setLoadingError('Failed to load JSCharting from CDN');
                clearTimeout(timeout);
            };

            document.head.appendChild(script);
            existingScript = script;
        } else {
            console.log('JSCharting script already exists, waiting for JSC...');
            // Script exists, just wait for JSC
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (checkJSCharting()) {
                    clearInterval(checkInterval);
                } else if (attempts >= 20) {
                    setLoadingError('JSCharting script present but JSC not available');
                    clearInterval(checkInterval);
                }
            }, 200);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        // Initialize chart once JSCharting is loaded
        if (isJSCLoaded && chartRef.current && !chartInstance.current) {
            try {
                const JSC = (window as any).JSC;
                console.log('Initializing chart...');

                // Comprehensive Gantt chart with more tasks and dependencies
                const chartConfig = {
                    type: 'horizontal column',

                    title: {
                        label: {
                            text: 'Web Application Development Project - Complete Gantt Chart',
                            style: {
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#2d3748'
                            }
                        }
                    },

                    legend: {
                        visible: true,
                        position: 'bottom'
                    },

                    toolbar: {
                        visible: true,
                        items: ['zoom-in', 'zoom-out', 'fullscreen', 'export-image']
                    },

                    defaultPoint: {
                        events: {
                            click: function(this: any) {
                                const deps = this.attributes?.dependencies || 'None';
                                const resources = this.attributes?.resources || 'Unassigned';
                                alert(`📋 Task: ${this.name}\n` +
                                    `📅 Start: ${this.y[0]}\n` +
                                    `📅 End: ${this.y[1]}\n` +
                                    `📊 Progress: ${Math.round((this.complete || 0) * 100)}%\n` +
                                    `👥 Resources: ${resources}\n` +
                                    `🔗 Dependencies: ${deps}`);
                            }
                        },

                        states: {
                            hover: {
                                opacity: 0.8,
                                outline: { width: 2, color: '#3182ce' }
                            }
                        }
                    },

                    // Configure timeline axis (horizontal - X axis)
                    xAxis: {
                        scale: { type: 'time' },
                        interval: { unit: 'week', multiplier: 2 },
                        formatString: 'MMM dd',
                        label: { text: '2024 Project Timeline' }
                    },

                    // Configure task names axis (vertical - Y axis)
                    yAxis: {
                        label: { text: 'Project Tasks' }
                    },

                    // Comprehensive task breakdown with dependencies
                    series: [
                        {
                            name: 'Project Initiation',
                            color: '#dc2626',
                            points: [
                                {
                                    name: 'Project Charter & Kickoff',
                                    x: 'Project Charter & Kickoff',
                                    y: ['1/1/2024', '1/3/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Project Manager, Stakeholders',
                                        dependencies: 'None'
                                    },
                                    marker: { visible: true, type: 'diamond', size: 10 }
                                },
                                {
                                    name: 'Stakeholder Identification',
                                    x: 'Stakeholder Identification',
                                    y: ['1/4/2024', '1/8/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Project Manager, Business Analyst',
                                        dependencies: 'Project Charter & Kickoff'
                                    }
                                },
                                {
                                    name: 'Project Scope Definition',
                                    x: 'Project Scope Definition',
                                    y: ['1/9/2024', '1/15/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Business Analyst, Product Owner',
                                        dependencies: 'Stakeholder Identification'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'Requirements & Analysis',
                            color: '#7c3aed',
                            points: [
                                {
                                    name: 'Business Requirements Gathering',
                                    x: 'Business Requirements Gathering',
                                    y: ['1/16/2024', '1/26/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Business Analyst, Stakeholders',
                                        dependencies: 'Project Scope Definition'
                                    }
                                },
                                {
                                    name: 'Technical Requirements Analysis',
                                    x: 'Technical Requirements Analysis',
                                    y: ['1/27/2024', '2/5/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Technical Lead, System Architect',
                                        dependencies: 'Business Requirements Gathering'
                                    }
                                },
                                {
                                    name: 'User Story Creation',
                                    x: 'User Story Creation',
                                    y: ['2/6/2024', '2/12/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Product Owner, UX Designer',
                                        dependencies: 'Technical Requirements Analysis'
                                    }
                                },
                                {
                                    name: 'Architecture Design',
                                    x: 'Architecture Design',
                                    y: ['2/13/2024', '2/20/2024'],
                                    complete: 0.95,
                                    attributes: {
                                        resources: 'System Architect, Senior Developer',
                                        dependencies: 'User Story Creation'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'UI/UX Design',
                            color: '#2563eb',
                            points: [
                                {
                                    name: 'User Research & Personas',
                                    x: 'User Research & Personas',
                                    y: ['2/21/2024', '2/28/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'UX Researcher, UX Designer',
                                        dependencies: 'User Story Creation'
                                    }
                                },
                                {
                                    name: 'Information Architecture',
                                    x: 'Information Architecture',
                                    y: ['2/29/2024', '3/7/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'UX Designer, Information Architect',
                                        dependencies: 'User Research & Personas'
                                    }
                                },
                                {
                                    name: 'Wireframe Creation',
                                    x: 'Wireframe Creation',
                                    y: ['3/8/2024', '3/18/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'UX Designer, UI Designer',
                                        dependencies: 'Information Architecture'
                                    }
                                },
                                {
                                    name: 'High-Fidelity UI Design',
                                    x: 'High-Fidelity UI Design',
                                    y: ['3/19/2024', '3/29/2024'],
                                    complete: 0.90,
                                    attributes: {
                                        resources: 'UI Designer, Graphic Designer',
                                        dependencies: 'Wireframe Creation'
                                    }
                                },
                                {
                                    name: 'Interactive Prototype',
                                    x: 'Interactive Prototype',
                                    y: ['3/30/2024', '4/8/2024'],
                                    complete: 0.75,
                                    attributes: {
                                        resources: 'UX Designer, Frontend Developer',
                                        dependencies: 'High-Fidelity UI Design'
                                    }
                                },
                                {
                                    name: 'Design System Creation',
                                    x: 'Design System Creation',
                                    y: ['4/9/2024', '4/16/2024'],
                                    complete: 0.60,
                                    attributes: {
                                        resources: 'UI Designer, Frontend Developer',
                                        dependencies: 'Interactive Prototype'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'Backend Development',
                            color: '#059669',
                            points: [
                                {
                                    name: 'Database Design',
                                    x: 'Database Design',
                                    y: ['4/17/2024', '4/24/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Database Administrator, Backend Developer',
                                        dependencies: 'Architecture Design'
                                    }
                                },
                                {
                                    name: 'Server Infrastructure Setup',
                                    x: 'Server Infrastructure Setup',
                                    y: ['4/25/2024', '5/2/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'DevOps Engineer, System Administrator',
                                        dependencies: 'Database Design'
                                    }
                                },
                                {
                                    name: 'API Development',
                                    x: 'API Development',
                                    y: ['5/3/2024', '5/20/2024'],
                                    complete: 0.80,
                                    attributes: {
                                        resources: 'Backend Developer, API Developer',
                                        dependencies: 'Server Infrastructure Setup'
                                    }
                                },
                                {
                                    name: 'Authentication System',
                                    x: 'Authentication System',
                                    y: ['5/21/2024', '5/28/2024'],
                                    complete: 0.70,
                                    attributes: {
                                        resources: 'Security Engineer, Backend Developer',
                                        dependencies: 'API Development'
                                    }
                                },
                                {
                                    name: 'Data Validation & Security',
                                    x: 'Data Validation & Security',
                                    y: ['5/29/2024', '6/5/2024'],
                                    complete: 0.40,
                                    attributes: {
                                        resources: 'Security Engineer, Backend Developer',
                                        dependencies: 'Authentication System'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'Frontend Development',
                            color: '#0ea5e9',
                            points: [
                                {
                                    name: 'Development Environment Setup',
                                    x: 'Development Environment Setup',
                                    y: ['4/17/2024', '4/22/2024'],
                                    complete: 1.0,
                                    attributes: {
                                        resources: 'Frontend Developer, DevOps Engineer',
                                        dependencies: 'Design System Creation'
                                    }
                                },
                                {
                                    name: 'Component Library Development',
                                    x: 'Component Library Development',
                                    y: ['4/23/2024', '5/10/2024'],
                                    complete: 0.85,
                                    attributes: {
                                        resources: 'Frontend Developer, UI Developer',
                                        dependencies: 'Development Environment Setup'
                                    }
                                },
                                {
                                    name: 'Page Templates & Views',
                                    x: 'Page Templates & Views',
                                    y: ['5/11/2024', '5/25/2024'],
                                    complete: 0.60,
                                    attributes: {
                                        resources: 'Frontend Developer, React Developer',
                                        dependencies: 'Component Library Development'
                                    }
                                },
                                {
                                    name: 'API Integration',
                                    x: 'API Integration',
                                    y: ['5/26/2024', '6/8/2024'],
                                    complete: 0.30,
                                    attributes: {
                                        resources: 'Full Stack Developer, Frontend Developer',
                                        dependencies: 'Page Templates & Views, API Development'
                                    }
                                },
                                {
                                    name: 'State Management',
                                    x: 'State Management',
                                    y: ['6/9/2024', '6/16/2024'],
                                    complete: 0.20,
                                    attributes: {
                                        resources: 'Senior Frontend Developer',
                                        dependencies: 'API Integration'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'Testing & Quality Assurance',
                            color: '#f59e0b',
                            points: [
                                {
                                    name: 'Test Plan Creation',
                                    x: 'Test Plan Creation',
                                    y: ['6/17/2024', '6/21/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'QA Lead, Test Manager',
                                        dependencies: 'State Management'
                                    }
                                },
                                {
                                    name: 'Unit Testing',
                                    x: 'Unit Testing',
                                    y: ['6/22/2024', '6/30/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'Developers, QA Engineer',
                                        dependencies: 'Test Plan Creation'
                                    }
                                },
                                {
                                    name: 'Integration Testing',
                                    x: 'Integration Testing',
                                    y: ['7/1/2024', '7/10/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'QA Engineer, Test Automation',
                                        dependencies: 'Unit Testing'
                                    }
                                },
                                {
                                    name: 'User Acceptance Testing',
                                    x: 'User Acceptance Testing',
                                    y: ['7/11/2024', '7/20/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'End Users, QA Lead, Product Owner',
                                        dependencies: 'Integration Testing'
                                    }
                                },
                                {
                                    name: 'Performance Testing',
                                    x: 'Performance Testing',
                                    y: ['7/21/2024', '7/25/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'Performance Engineer, QA Team',
                                        dependencies: 'User Acceptance Testing'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'Deployment & Launch',
                            color: '#dc2626',
                            points: [
                                {
                                    name: 'Production Environment Setup',
                                    x: 'Production Environment Setup',
                                    y: ['7/26/2024', '7/30/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'DevOps Engineer, System Administrator',
                                        dependencies: 'Performance Testing'
                                    }
                                },
                                {
                                    name: 'Production Deployment',
                                    x: 'Production Deployment',
                                    y: ['7/31/2024', '8/5/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'DevOps Team, Release Manager',
                                        dependencies: 'Production Environment Setup'
                                    }
                                },
                                {
                                    name: 'User Training & Documentation',
                                    x: 'User Training & Documentation',
                                    y: ['8/6/2024', '8/12/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'Technical Writer, Training Specialist',
                                        dependencies: 'Production Deployment'
                                    }
                                },
                                {
                                    name: 'Go-Live & Official Launch',
                                    x: 'Go-Live & Official Launch',
                                    y: ['8/15/2024', '8/15/2024'],
                                    complete: 0.0,
                                    attributes: {
                                        resources: 'Project Manager, Marketing Team',
                                        dependencies: 'User Training & Documentation'
                                    },
                                    marker: { visible: true, type: 'diamond', size: 12 }
                                }
                            ]
                        }
                    ]
                };

                console.log('Creating chart with config:', chartConfig);

                try {
                    chartInstance.current = new JSC.Chart(chartRef.current, chartConfig);
                    console.log('✅ Chart created successfully');

                } catch (createError) {
                    console.error('❌ Chart creation failed:', createError);
                    setLoadingError(`Chart creation failed: ${createError}`);
                }

            } catch (error) {
                console.error('❌ Error initializing chart:', error);
                setLoadingError(`Chart initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return () => {
            if (chartInstance.current && typeof chartInstance.current.dispose === 'function') {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [isJSCLoaded]);

    // Show different states
    if (loadingTimeout && !isJSCLoaded) {
        return (
            <div className="w-full p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Timeout</h3>
                        <p className="text-gray-600 mb-4">
                            JSCharting is taking too long to load. This might be due to:
                        </p>
                        <div className="text-left max-w-md mx-auto space-y-2 text-sm">
                            <div>• Network connectivity issues</div>
                            <div>• Corporate firewall blocking CDN</div>
                            <div>• Browser security settings</div>
                            <div>• JSCharting CDN is down</div>
                        </div>
                        <div className="mt-6 space-x-4">
                            <button
                                onClick={() => {
                                    setLoadingTimeout(false);
                                    setLoadingError(null);
                                    window.location.reload();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Professional Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Project Management Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Interactive Gantt Chart for Web Application Development Project
                    </p>
                </div>

                {!isJSCLoaded && !loadingError && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <strong>Loading JSCharting...</strong>
                            <span className="ml-2 text-xs">This should take less than 10 seconds</span>
                        </div>
                    </div>
                )}

                {loadingError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="mb-2">
                            <strong>Error:</strong> {loadingError}
                        </div>
                        <button
                            onClick={() => {
                                setLoadingError(null);
                                setIsJSCLoaded(false);
                                window.location.reload();
                            }}
                            className="bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors text-xs"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {isJSCLoaded && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        <strong>✅ JSCharting loaded!</strong> Try all the interactive features below.
                    </div>
                )}

                {/* Professional Chart Container */}
                <div
                    ref={chartRef}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl shadow-lg"
                    style={{ height: '650px', minHeight: '650px' }}
                >
                    {!isJSCLoaded && !loadingError && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading chart library...</p>
                                <p className="text-xs text-gray-400 mt-2">Check console for details</p>
                            </div>
                        </div>
                    )}
                    {loadingError && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-4">
                                <div className="text-red-500 mb-4">
                                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 font-medium">Chart Error</p>
                                <p className="text-sm text-gray-600 mt-1">{loadingError}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Professional Features Overview */}
                {isJSCLoaded && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Interactive Features */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Interactive Features</h3>
                            </div>
                            <div className="space-y-3 text-sm text-blue-800">
                                <div className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span><strong>Click:</strong> View detailed task information</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span><strong>Double-click:</strong> Open task editor</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span><strong>Right-click:</strong> Access task actions</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span><strong>Hover:</strong> Enhanced visual feedback</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Elements */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-green-900">Visual Elements</h3>
                            </div>
                            <div className="space-y-3 text-sm text-green-800">
                                <div className="flex items-center">
                                    <div className="w-4 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded mr-3 shadow-sm"></div>
                                    <span>Regular Tasks</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded mr-3 shadow-sm"></div>
                                    <span>Critical Path</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded mr-3 shadow-sm transform rotate-45"></div>
                                    <span>Milestones</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded mr-3 shadow-sm"></div>
                                    <span>Summary Tasks</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Stats */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-purple-900">Project Metrics</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{ganttData.length}</div>
                                    <div className="text-sm text-purple-700">Total Tasks</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {ganttData.filter(t => (t.progress || 0) === 100).length}
                                    </div>
                                    <div className="text-sm text-purple-700">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {ganttData.filter(t => t.critical).length}
                                    </div>
                                    <div className="text-sm text-purple-700">Critical</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {ganttData.filter(t => t.milestone).length}
                                    </div>
                                    <div className="text-sm text-purple-700">Milestones</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Action Panel */}
                {/*{isJSCLoaded && (*/}
                {/*    <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">*/}
                {/*        <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Project Management Features</h3>*/}
                {/*        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">📊 Progress Tracking</h4>*/}
                {/*                <p className="text-sm text-gray-600">Visual progress bars show completion status for all tasks with professional styling.</p>*/}
                {/*            </div>*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">🔗 Task Dependencies</h4>*/}
                {/*                <p className="text-sm text-gray-600">Click any task to see its dependencies and prerequisite tasks.</p>*/}
                {/*            </div>*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">⚡ Critical Path</h4>*/}
                {/*                <p className="text-sm text-gray-600">Red tasks highlight the critical path that determines project completion.</p>*/}
                {/*            </div>*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">💎 Milestone Tracking</h4>*/}
                {/*                <p className="text-sm text-gray-600">Diamond markers highlight key project milestones and deliverables.</p>*/}
                {/*            </div>*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">👥 Resource Management</h4>*/}
                {/*                <p className="text-sm text-gray-600">View assigned team members and resources for each task in detailed popups.</p>*/}
                {/*            </div>*/}
                {/*            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">*/}
                {/*                <h4 className="font-medium text-gray-800 mb-2">🎯 Priority Levels</h4>*/}
                {/*                <p className="text-sm text-gray-600">Color-coded priority system helps identify high-impact tasks requiring attention.</p>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </div>
    );
};

export default GanttChartComponent;