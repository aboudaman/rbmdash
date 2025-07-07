// components/GanttChartInteractions.tsx
import { useEffect, useRef, useState } from 'react';
import { Task, Section } from '../types/types';

interface GanttChartInteractionsProps {
    tasks: Task[];
    sections: Section[];
    onTaskClick: (taskId: string | null) => void;
}

const GanttChartInteractions: React.FC<GanttChartInteractionsProps> = ({
                                                                           tasks,
                                                                           sections,
                                                                           onTaskClick
                                                                       }) => {
    const [hoveredTask, setHoveredTask] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Calculate task positions
    const getTaskPositions = () => {
        if (!containerRef.current) return [];

        const canvas = containerRef.current.previousSibling as HTMLCanvasElement;
        if (!canvas) return [];

        const leftColWidth = 200; // Same as in GanttChart
        const headerHeight = 70;
        const rowHeight = 40;
        const countryHeaderHeight = 40;
        const sectionPadding = 20;

        // Group tasks by country
        const tasksByCountry: Record<string, Task[]> = {};
        tasks.forEach(task => {
            const countryName = task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown';
            if (!tasksByCountry[countryName]) {
                tasksByCountry[countryName] = [];
            }
            tasksByCountry[countryName].push(task);
        });

        const countries = Object.keys(tasksByCountry).sort();

        // Calculate time scale
        const timeRange = {
            start: new Date(Math.min(...tasks.map(task => task.startDate.getTime()))),
            end: new Date(Math.max(...tasks.map(task => {
                const endDate = new Date(task.startDate);
                endDate.setDate(endDate.getDate() + task.duration);
                return endDate.getTime();
            })))
        };

        // Add padding to the dates
        timeRange.start.setMonth(timeRange.start.getMonth() - 1);
        timeRange.end.setMonth(timeRange.end.getMonth() + 2);

        const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
        const dayWidth = (canvas.width - leftColWidth) / days;

        // Calculate all task positions
        const taskPositions: {
            id: string;
            x: number;
            y: number;
            width: number;
            height: number;
            task: Task;
        }[] = [];

        let currentY = headerHeight;

        countries.forEach(country => {
            currentY += countryHeaderHeight;

            // Group tasks by section for this country
            const countryTasks = tasksByCountry[country];
            const sectionIds = [...new Set(countryTasks.map(task => task.section))].sort();

            // Process sections
            sectionIds.forEach(sectionId => {
                currentY += rowHeight; // Section header

                // Get tasks for this section in this country
                const sectionTasks = countryTasks.filter(task => task.section === sectionId)
                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                // Add task positions
                sectionTasks.forEach(task => {
                    const startX = leftColWidth + ((task.startDate.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
                    const width = task.duration * dayWidth;

                    taskPositions.push({
                        id: task.id,
                        x: startX,
                        y: currentY,
                        width,
                        height: rowHeight,
                        task
                    });

                    currentY += rowHeight;
                });

                currentY += sectionPadding;
            });
        });

        return taskPositions;
    };

    // Get hovered task information
    const getHoveredTaskInfo = (e: MouseEvent) => {
        if (!containerRef.current) return null;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + containerRef.current.scrollLeft - dragOffset.x;
        const y = e.clientY - rect.top + containerRef.current.scrollTop - dragOffset.y;

        const taskPositions = getTaskPositions();
        const hoveredTask = taskPositions.find(pos =>
            x >= pos.x &&
            x <= pos.x + pos.width &&
            y >= pos.y &&
            y <= pos.y + pos.height
        );

        return hoveredTask ? hoveredTask : null;
    };

    // Mouse move handler for hover effects
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            if (dragStart) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;
                setDragOffset({ x: dx, y: dy });

                if (containerRef.current) {
                    containerRef.current.style.cursor = 'grabbing';
                    containerRef.current.scrollLeft -= e.movementX;
                    containerRef.current.scrollTop -= e.movementY;
                }
            }
            return;
        }

        const hoveredTaskInfo = getHoveredTaskInfo(e);

        if (hoveredTaskInfo) {
            setHoveredTask(hoveredTaskInfo.task.id);
            setTooltipPos({
                x: e.clientX,
                y: e.clientY
            });

            if (containerRef.current) {
                containerRef.current.style.cursor = 'pointer';
            }
        } else {
            setHoveredTask(null);

            if (containerRef.current) {
                containerRef.current.style.cursor = 'default';
            }
        }
    };

    // Mouse click handler
    const handleClick = (e: MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);
            if (containerRef.current) {
                containerRef.current.style.cursor = 'default';
            }
            return;
        }

        const hoveredTaskInfo = getHoveredTaskInfo(e);

        if (hoveredTaskInfo) {
            onTaskClick(hoveredTaskInfo.task.id);
        } else {
            onTaskClick(null);
        }
    };

    // Mouse down handler for panning
    const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return; // Only handle left click

        const hoveredTaskInfo = getHoveredTaskInfo(e);

        if (!hoveredTaskInfo) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });

            if (containerRef.current) {
                containerRef.current.style.cursor = 'grabbing';
            }
        }
    };

    // Mouse up handler
    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragStart(null);

            if (containerRef.current) {
                containerRef.current.style.cursor = 'default';
            }
        }
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
        setHoveredTask(null);
        setIsDragging(false);
        setDragStart(null);
    };

    // Add event listeners
    useEffect(() => {
        const currentRef = containerRef.current;

        if (currentRef) {
            currentRef.addEventListener('mousemove', handleMouseMove);
            currentRef.addEventListener('click', handleClick);
            currentRef.addEventListener('mousedown', handleMouseDown);
            currentRef.addEventListener('mouseup', handleMouseUp);
            currentRef.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('mousemove', handleMouseMove);
                currentRef.removeEventListener('click', handleClick);
                currentRef.removeEventListener('mousedown', handleMouseDown);
                currentRef.removeEventListener('mouseup', handleMouseUp);
                currentRef.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [tasks, isDragging, dragStart]);

    // Render tooltip
    const renderTooltip = () => {
        if (!hoveredTask) return null;

        const task = tasks.find(t => t.id === hoveredTask);
        if (!task) return null;

        const endDate = new Date(task.startDate);
        endDate.setDate(endDate.getDate() + task.duration);

        const section = sections.find(s => s.id === task.section);
        const country = task.comments?.split(':')[0] || task.id.split('-')[0] || 'Unknown';

        // Check dependencies
        const allDependenciesMet = task.dependencies.length === 0 ||
            task.dependencies.every(depId => {
                const depTask = tasks.find(t => t.id === depId);
                return depTask?.completed === true;
            });

        let statusColor = task.completed
            ? 'bg-green-100 border-green-300 text-green-800'
            : allDependenciesMet
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-amber-100 border-amber-300 text-amber-800';

        return (
            <div
                ref={tooltipRef}
                className="absolute z-50 bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm"
                style={{
                    left: tooltipPos.x + 10,
                    top: tooltipPos.y + 10,
                    maxWidth: '300px'
                }}
            >
                <div className="font-bold text-gray-800 border-b pb-1 mb-2">{task.name}</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Country:</div>
                    <div className="font-medium">{country}</div>

                    <div className="text-gray-600">Section:</div>
                    <div className="font-medium">{section?.name || 'Unknown'}</div>

                    <div className="text-gray-600">Start Date:</div>
                    <div className="font-medium">{task.startDate.toLocaleDateString()}</div>

                    <div className="text-gray-600">End Date:</div>
                    <div className="font-medium">{endDate.toLocaleDateString()}</div>

                    <div className="text-gray-600">Duration:</div>
                    <div className="font-medium">{task.duration} days</div>

                    <div className="text-gray-600">Status:</div>
                    <div className="font-medium">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
                            {task.completed
                                ? 'Completed'
                                : allDependenciesMet
                                    ? 'Ready'
                                    : 'Waiting on Dependencies'}
                        </span>
                    </div>
                </div>

                {task.dependencies.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-gray-600 mb-1">Dependencies:</div>
                        <div className="flex flex-wrap gap-1">
                            {task.dependencies.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                return (
                                    <span
                                        key={depId}
                                        className={`text-xs px-2 py-0.5 rounded ${
                                            depTask?.completed
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                        }`}
                                    >
                                        {depTask?.name || depId}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {task.comments && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-gray-600 mb-1">Note:</div>
                        <div className="text-gray-800">
                            {task.comments?.split(':')[1]?.trim() || task.comments}
                        </div>
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-500 italic">
                    Click for more details
                </div>
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        >
            {hoveredTask && renderTooltip()}
        </div>
    );
};

export default GanttChartInteractions;