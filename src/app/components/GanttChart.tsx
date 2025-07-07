// components/GanttChart.tsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { Task, Section } from '../types/types';
import GanttChartInteractions from './GanttChartInteractions';

interface GanttChartProps {
    tasks: Task[];
    sections: Section[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, sections }) => {
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<{ start: Date; end: Date } | null>(null);
    const [viewMode, setViewMode] = useState<'quarters' | 'months' | 'weeks'>('quarters');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Professional color palette
    const colors = {
        primary: '#0d366b',      // Dark blue for headers
        secondary: '#1a73e8',    // Bright blue for action items
        completed: '#34a853',    // Green for completed tasks
        pending: '#ea4335',      // Red for pending dependencies
        neutral: '#5f6368',      // Gray for inactive items
        lightBg: '#f8f9fa',      // Light background
        border: '#dadce0',       // Border color
        text: '#202124',         // Primary text
    };

    // Group tasks by country with memoization
    const tasksByCountry = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        tasks.forEach(task => {
            const country = task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown';
            if (!grouped[country]) grouped[country] = [];
            grouped[country].push(task);
        });
        return grouped;
    }, [tasks]);

    // Update time range based on tasks
    useEffect(() => {
        if (tasks.length === 0) {
            setTimeRange(null);
            return;
        }

        const startDates = tasks.map(task => task.startDate);
        const endDates = tasks.map(task => {
            const endDate = new Date(task.startDate);
            endDate.setDate(endDate.getDate() + task.duration);
            return endDate;
        });

        const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

        // Add padding to dates
        minDate.setMonth(minDate.getMonth() - 1);
        maxDate.setMonth(maxDate.getMonth() + 2);

        setTimeRange({ start: minDate, end: maxDate });
    }, [tasks]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                canvasRef.current.width = containerRef.current.offsetWidth;
                drawChart();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Zoom controls
    const zoomIn = () => {
        if (tasks.length === 0 || timeRange === null) return;

        const current = timeRange;
        const rangeDays = Math.ceil((current.end.getTime() - current.start.getTime()) / (1000 * 60 * 60 * 24));
        const newRangeDays = Math.max(rangeDays / 2, 30);

        const centerDate = new Date((current.start.getTime() + current.end.getTime()) / 2);
        const newStart = new Date(centerDate);
        const newEnd = new Date(centerDate);

        newStart.setDate(newStart.getDate() - Math.floor(newRangeDays / 2));
        newEnd.setDate(newEnd.getDate() + Math.ceil(newRangeDays / 2));

        setTimeRange({ start: newStart, end: newEnd });
        setViewMode('weeks');
    };

    const zoomOut = () => {
        if (tasks.length === 0 || timeRange === null) return;

        const current = timeRange;
        const rangeDays = Math.ceil((current.end.getTime() - current.start.getTime()) / (1000 * 60 * 60 * 24));
        const newRangeDays = rangeDays * 2;

        const centerDate = new Date((current.start.getTime() + current.end.getTime()) / 2);
        const newStart = new Date(centerDate);
        const newEnd = new Date(centerDate);

        newStart.setDate(newStart.getDate() - Math.floor(newRangeDays / 2));
        newEnd.setDate(newEnd.getDate() + Math.ceil(newRangeDays / 2));

        setTimeRange({ start: newStart, end: newEnd });

        if (newRangeDays > 180) {
            setViewMode('quarters');
        }
    };

    // Format date labels based on view mode
    const formatDateLabel = (date: Date) => {
        if (viewMode === 'quarters') {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${quarter} ${date.getFullYear()}`;
        } else if (viewMode === 'weeks') {
            return `Week ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    };

    // Draw the chart
    const drawChart = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Display "No Data" message when there are no tasks or timeRange is null
        if (tasks.length === 0 || timeRange === null) {
            canvas.height = 200; // Set a reasonable height

            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#6b7280'; // Gray text
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('No Data', canvas.width / 2, canvas.height / 2);

            return;
        }

        // Set dimensions
        const rowHeight = 40;
        const headerHeight = 70;
        const sectionPadding = 20;
        const countryHeaderHeight = 40;
        const leftColWidth = 200;

        // Calculate days in range
        const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
        const dayWidth = (canvas.width - leftColWidth) / days;

        // Get countries and sort them
        const countries = Object.keys(tasksByCountry).sort();

        // Calculate total height needed
        let totalRows = 0;
        countries.forEach(country => {
            totalRows++; // For country header
            const sections = new Set(tasksByCountry[country].map(t => t.section));
            totalRows += tasksByCountry[country].length + sections.size;
        });

        // Set canvas height
        canvas.height = headerHeight + totalRows * rowHeight + countries.length * countryHeaderHeight;

        // Draw header
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, headerHeight);

        // Draw header border
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(canvas.width, headerHeight);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add title
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Timeline', 20, 30);

        // Draw time units
        let timeUnitWidth: number;
        let currentDate = new Date(timeRange.start);

        if (viewMode === 'quarters') {
            currentDate = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1);
            timeUnitWidth = dayWidth * 90; // Approx quarter
        } else if (viewMode === 'weeks') {
            const dayOfWeek = currentDate.getDay();
            currentDate.setDate(currentDate.getDate() - dayOfWeek);
            timeUnitWidth = dayWidth * 7; // Week
        } else {
            currentDate.setDate(1); // Start from 1st of month
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            timeUnitWidth = dayWidth * daysInMonth;
        }

        // Draw time units
        while (currentDate < timeRange.end) {
            let nextDate = new Date(currentDate);

            if (viewMode === 'quarters') {
                nextDate.setMonth(nextDate.getMonth() + 3);
            } else if (viewMode === 'weeks') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }

            const startX = leftColWidth + ((currentDate.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
            let endX = leftColWidth + ((nextDate.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
            endX = Math.min(endX, canvas.width);
            const width = endX - startX;

            // Draw background
            ctx.fillStyle = currentDate.getMonth() % 2 === 0 ? colors.lightBg : '#f1f3f4';
            ctx.fillRect(startX, headerHeight, width, canvas.height - headerHeight);

            // Draw divider
            ctx.beginPath();
            ctx.moveTo(startX, 0);
            ctx.lineTo(startX, canvas.height);
            ctx.strokeStyle = '#e6e6e6';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw time label
            ctx.fillStyle = colors.primary;
            ctx.font = 'bold 14px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatDateLabel(currentDate), startX + width / 2, 30);

            // Move to next time unit
            currentDate = nextDate;
        }

        // Draw today marker if visible
        const today = new Date();
        if (today >= timeRange.start && today <= timeRange.end) {
            const todayX = leftColWidth + ((today.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;

            ctx.beginPath();
            ctx.moveTo(todayX, headerHeight - 15);
            ctx.lineTo(todayX, canvas.height);
            ctx.strokeStyle = '#ff6d01';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ff6d01';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("TODAY", todayX, headerHeight - 20);
        }

        // Draw left column background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, headerHeight, leftColWidth, canvas.height - headerHeight);

        // Process countries and tasks
        let currentY = headerHeight;

        countries.forEach(country => {
            // Draw country header
            ctx.fillStyle = '#e8eaf6';
            ctx.fillRect(0, currentY, canvas.width, countryHeaderHeight);

            ctx.beginPath();
            ctx.moveTo(0, currentY);
            ctx.lineTo(canvas.width, currentY);
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = colors.primary;
            ctx.font = 'bold 16px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(country, 20, currentY + countryHeaderHeight/2 + 6);

            currentY += countryHeaderHeight;

            // Process sections
            const countryTasks = tasksByCountry[country];

            // Get campaign order based on your specification
            const campaignOrder = ['gc8', 'nsp', 'smc', 'itn', 'irs', 'mtr'];

            // Sort sections according to campaign order
            const sectionIds = [...new Set(countryTasks.map(task => task.section))];
            sectionIds.sort((a, b) => {
                const aIndex = campaignOrder.findIndex(c => a.toLowerCase().includes(c));
                const bIndex = campaignOrder.findIndex(c => b.toLowerCase().includes(c));
                return (aIndex >= 0 ? aIndex : 999) - (bIndex >= 0 ? bIndex : 999);
            });

            sectionIds.forEach(sectionId => {
                const section = sections.find(s => s.id === sectionId);
                if (!section) return;

                // Draw section header
                ctx.fillStyle = '#f1f8e9';
                ctx.fillRect(0, currentY, canvas.width, rowHeight);

                ctx.beginPath();
                ctx.moveTo(0, currentY);
                ctx.lineTo(canvas.width, currentY);
                ctx.strokeStyle = '#7cb342';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = '#33691e';
                ctx.font = 'bold 14px Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(section.name, 20, currentY + rowHeight/2 + 5);

                currentY += rowHeight;

                // Process tasks within section
                const sectionTasks = countryTasks
                    .filter(task => task.section === sectionId)
                    .sort((a, b) => {
                        // Handle custom task ordering based on your sequence
                        // This matches the sequence you provided
                        const taskSequence = [
                            'program review',
                            'mid-level',
                            'tailoring',
                            'matchbox',
                            'research',
                            'costing',
                            'operation plan',
                            'monitoring and evaluation',
                            'procurement',
                            'supply management',
                            'macro planning',
                            'procurement and supply chain',
                            'micro planning',
                            'digitalization',
                            'monitoring',
                            'case management',
                            'vector control',
                            'community rights'
                        ];

                        const getTaskPriority = (task: Task) => {
                            const name = task.name.toLowerCase();
                            for (let i = 0; i < taskSequence.length; i++) {
                                if (name.includes(taskSequence[i])) {
                                    return i;
                                }
                            }
                            return 999;
                        };

                        const priorityA = getTaskPriority(a);
                        const priorityB = getTaskPriority(b);

                        if (priorityA !== priorityB) {
                            return priorityA - priorityB;
                        }

                        // If same priority, sort by start date
                        return a.startDate.getTime() - b.startDate.getTime();
                    });

                sectionTasks.forEach(task => {
                    // Zebra striping
                    ctx.fillStyle = sectionTasks.indexOf(task) % 2 === 0 ? '#ffffff' : '#f5f5f5';
                    ctx.fillRect(0, currentY, canvas.width, rowHeight);

                    // Task positioning
                    const startX = leftColWidth + ((task.startDate.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
                    const width = task.duration * dayWidth;

                    // Draw task name
                    ctx.fillStyle = colors.text;
                    ctx.font = '13px Arial, sans-serif';
                    ctx.textAlign = 'left';

                    // Truncate if needed
                    let taskName = task.name;
                    if (ctx.measureText(taskName).width > leftColWidth - 30) {
                        while (ctx.measureText(taskName + '...').width > leftColWidth - 30) {
                            taskName = taskName.slice(0, -1);
                        }
                        taskName += '...';
                    }

                    ctx.fillText(taskName, 30, currentY + rowHeight/2 + 5);

                    // Check dependencies status
                    const allDependenciesMet = task.dependencies.length === 0 ||
                        task.dependencies.every(depId => {
                            const depTask = tasks.find(t => t.id === depId);
                            return depTask?.completed === true;
                        });

                    // Draw task bar with appropriate color
                    let color;
                    if (task.completed) {
                        color = '#4caf50'; // Green for completed
                    } else if (allDependenciesMet) {
                        color = '#2196f3'; // Blue for ready
                    } else {
                        color = '#9e9e9e'; // Gray for pending
                    }

                    // Draw bar with rounded corners
                    const barHeight = rowHeight - 16;
                    const cornerRadius = 4;

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(startX + cornerRadius, currentY + 8);
                    ctx.lineTo(startX + width - cornerRadius, currentY + 8);
                    ctx.arcTo(startX + width, currentY + 8, startX + width, currentY + 8 + cornerRadius, cornerRadius);
                    ctx.lineTo(startX + width, currentY + 8 + barHeight - cornerRadius);
                    ctx.arcTo(startX + width, currentY + 8 + barHeight, startX + width - cornerRadius, currentY + 8 + barHeight, cornerRadius);
                    ctx.lineTo(startX + cornerRadius, currentY + 8 + barHeight);
                    ctx.arcTo(startX, currentY + 8 + barHeight, startX, currentY + 8 + barHeight - cornerRadius, cornerRadius);
                    ctx.lineTo(startX, currentY + 8 + cornerRadius);
                    ctx.arcTo(startX, currentY + 8, startX + cornerRadius, currentY + 8, cornerRadius);
                    ctx.closePath();
                    ctx.fill();

                    // Add duration for longer tasks
                    if (width > 80) {
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 12px Arial, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${task.duration}d`, startX + width / 2, currentY + rowHeight/2 + 5);
                    }

                    // Render dependencies in sequence
                    if (task.dependencies.length > 0) {
                        // Sort dependencies based on the sequence
                        const sortedDependencies = [...task.dependencies].sort((depIdA, depIdB) => {
                            const depTaskA = tasks.find(t => t.id === depIdA);
                            const depTaskB = tasks.find(t => t.id === depIdB);

                            if (!depTaskA || !depTaskB) return 0;

                            // Sort based on campaign sequence
                            const getCampaignPriority = (task: Task) => {
                                const id = task.section.toLowerCase();
                                for (let i = 0; i < campaignOrder.length; i++) {
                                    if (id.includes(campaignOrder[i])) {
                                        return i;
                                    }
                                }
                                return 999;
                            };

                            const campPriorityA = getCampaignPriority(depTaskA);
                            const campPriorityB = getCampaignPriority(depTaskB);

                            if (campPriorityA !== campPriorityB) {
                                return campPriorityA - campPriorityB;
                            }

                            // If same campaign, sort by task sequence
                            const getTaskPriority = (task: Task) => {
                                const taskSequence = [
                                    'program review',
                                    'mid-level',
                                    'tailoring',
                                    'matchbox',
                                    'research',
                                    'costing',
                                    'operation',
                                    'monitoring',
                                    'procurement',
                                    'supply',
                                    'macro',
                                    'micro',
                                    'digital',
                                    'case',
                                    'vector',
                                    'community'
                                ];

                                const name = task.name.toLowerCase();
                                for (let i = 0; i < taskSequence.length; i++) {
                                    if (name.includes(taskSequence[i])) {
                                        return i;
                                    }
                                }
                                return 999;
                            };

                            return getTaskPriority(depTaskA) - getTaskPriority(depTaskB);
                        });

                        // Draw the sorted dependencies with sequential numbering
                        sortedDependencies.forEach((depId, index) => {
                            const depTask = tasks.find(t => t.id === depId);
                            if (!depTask) return;

                            // Calculate dependency positions
                            const depEndX = leftColWidth + ((depTask.startDate.getTime() +
                                (depTask.duration * 24 * 60 * 60 * 1000) -
                                timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;

                            // Stagger sequential dependencies
                            const offset = index * 3;

                            // Draw sequential dependency with improved visibility
                            ctx.beginPath();
                            ctx.moveTo(depEndX, currentY - rowHeight/2);
                            ctx.lineTo(startX, currentY + rowHeight/2 - offset);

                            // Style based on completion status and sequence
                            ctx.strokeStyle = depTask.completed ? '#4caf50' : '#ea4335';
                            ctx.lineWidth = 1.5;
                            if (!depTask.completed) ctx.setLineDash([4, 2]);
                            ctx.stroke();
                            ctx.setLineDash([]);

                            // Add sequential number label
                            ctx.fillStyle = depTask.completed ? '#4caf50' : '#ea4335';
                            ctx.font = 'bold 10px Arial, sans-serif';
                            ctx.fillText(`${index + 1}`, (depEndX + startX) / 2,
                                (currentY - rowHeight/2 + currentY + rowHeight/2) / 2 - 5);

                            // Arrow at end
                            const arrowSize = 5;
                            ctx.beginPath();
                            ctx.moveTo(startX, currentY + rowHeight/2 - offset);
                            ctx.lineTo(startX - arrowSize, (currentY + rowHeight/2 - offset) - arrowSize);
                            ctx.lineTo(startX - arrowSize, (currentY + rowHeight/2 - offset) + arrowSize);
                            ctx.closePath();
                            ctx.fill();
                        });
                    }

                    currentY += rowHeight;
                });

                currentY += sectionPadding;
            });
        });
    };

    // Draw chart when dependencies change
    useEffect(() => {
        drawChart();
    }, [tasks, sections, timeRange, viewMode]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-xl font-semibold text-indigo-700">Gantt Chart Timeline</h2>
                <div className="flex items-center gap-3">
                    <div className="flex border rounded-md overflow-hidden">
                        <button
                            onClick={() => setViewMode('quarters')}
                            className={`px-3 py-1 text-sm ${viewMode === 'quarters' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            disabled={tasks.length === 0 || timeRange === null}
                        >
                            Quarters
                        </button>
                        <button
                            onClick={() => setViewMode('months')}
                            className={`px-3 py-1 text-sm ${viewMode === 'months' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            disabled={tasks.length === 0 || timeRange === null}
                        >
                            Months
                        </button>
                        <button
                            onClick={() => setViewMode('weeks')}
                            className={`px-3 py-1 text-sm ${viewMode === 'weeks' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            disabled={tasks.length === 0 || timeRange === null}
                        >
                            Weeks
                        </button>
                    </div>
                    <div className="flex border rounded-md overflow-hidden ml-2">
                        <button
                            onClick={zoomIn}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                            title="Zoom in"
                            disabled={tasks.length === 0 || timeRange === null}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </button>
                        <button
                            onClick={zoomOut}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                            title="Zoom out"
                            disabled={tasks.length === 0 || timeRange === null}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-white border rounded-md flex justify-between items-center">
                <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center">
                        <div className="w-4 h-3 bg-green-500 rounded-sm mr-1"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-3 bg-blue-500 rounded-sm mr-1"></div>
                        <span>Ready</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-3 bg-gray-500 rounded-sm mr-1"></div>
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-0.5 bg-green-500 mr-1"></div>
                        <span>Completed Dependency</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-0.5 border-t border-dashed border-red-500 mr-1"></div>
                        <span>Pending Dependency</span>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {tasks.length > 0 ?
                        `${tasks.length} tasks across ${Object.keys(tasksByCountry).length} countries` :
                        'No data available'}
                </div>
            </div>

            <div className="relative overflow-x-auto" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    width={1500}
                    height={Math.max(600, tasks.length * 50 + 100)}
                    className="min-w-full border rounded-md shadow-inner"
                />
                <GanttChartInteractions
                    tasks={tasks}
                    sections={sections}
                    onTaskClick={setSelectedTask}
                />
            </div>

            {selectedTask && (
                <div className="mt-4 p-4 bg-white rounded-md border border-indigo-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <h3 className="font-bold text-indigo-800 text-lg">
                            {tasks.find(t => t.id === selectedTask)?.name}
                        </h3>
                        <button
                            onClick={() => setSelectedTask(null)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Start Date:</span> {tasks.find(t => t.id === selectedTask)?.startDate.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Duration:</span> {tasks.find(t => t.id === selectedTask)?.duration} days
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    tasks.find(t => t.id === selectedTask)?.completed
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {tasks.find(t => t.id === selectedTask)?.completed ? 'Completed' : 'In Progress'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Section:</span> {sections.find(s => s.id === tasks.find(t => t.id === selectedTask)?.section)?.name}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Country:</span> {tasks.find(t => t.id === selectedTask)?.comments?.split(':')[0] || 'Unknown'}
                            </p>
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">Dependencies:</span>
                                <div className="ml-2 flex flex-wrap gap-1 mt-1">
                                    {tasks.find(t => t.id === selectedTask)?.dependencies.length
                                        ? tasks.find(t => t.id === selectedTask)?.dependencies.map(depId => {
                                            const depTask = tasks.find(t => t.id === depId);
                                            return (
                                                <span key={depId}
                                                      className={`inline-block px-2 py-1 rounded-md text-xs ${
                                                          depTask?.completed
                                                              ? 'bg-green-100 text-green-800 border border-green-200'
                                                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                      }`}
                                                      title={depTask?.name}
                                                >
                                                {depTask?.name || depId}
                                            </span>
                                            );
                                        })
                                        : <span className="text-gray-500">None</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {tasks.find(t => t.id === selectedTask)?.comments && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium block mb-1">Note:</span>
                                <span className="bg-gray-50 p-3 rounded-md border border-gray-100 block">
                                    {tasks.find(t => t.id === selectedTask)?.comments?.split(':')[1]?.trim() || tasks.find(t => t.id === selectedTask)?.comments}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Edit Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GanttChart;