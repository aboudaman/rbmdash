// services/googleSheetsService.ts

import { Task } from '../types/types';
import * as XLSX from 'xlsx';

// Google Sheet configuration
const SPREADSHEET_ID = '1iQpIO4QyXPtM0Q7Q5LCzz2sfbC3XPj_w';
const SHEET_GID = '219645058';

// Month mapping for date parsing
const MONTH_MAP: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

// Function to parse date range strings
function parseDateRange(dateRange: string | undefined): { start: Date; duration: number } | null {
    if (!dateRange || typeof dateRange !== 'string') return null;

    const cleanedRange = dateRange.replace(/\u2013|\u2014/g, '-').trim();
    if (cleanedRange === '' || !cleanedRange.includes('-')) return null;

    const matches = cleanedRange.match(/([A-Za-z]{3})\s*(\d{1,2})\s*-\s*([A-Za-z]{3})\s*(\d{1,2})/);
    if (!matches) return null;

    const [, startMonth, startDay, endMonth, endDay] = matches;
    const startMonthIndex = MONTH_MAP[startMonth];
    const endMonthIndex = MONTH_MAP[endMonth];
    if (startMonthIndex === undefined || endMonthIndex === undefined) return null;

    const currentYear = 2025;
    const startDate = new Date(currentYear, startMonthIndex, parseInt(startDay));
    const endYear = endMonthIndex < startMonthIndex ? currentYear + 1 : currentYear;
    const endDate = new Date(endYear, endMonthIndex, parseInt(endDay));

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return duration > 0 ? { start: startDate, duration } : null;
}

// Define a type for task mapping
interface TaskMapping {
    index: number;
    taskName: string;
    section: string;
    id: string;
    dependencies: string[];
}

// Main fetch function with country-specific task grouping
export async function fetchSheetData(): Promise<Task[]> {
    console.log('=== Starting fetchSheetData ===');

    try {
        // Fetch Excel data
        const xlsxUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx&gid=${SHEET_GID}`;

        const response = await fetch(xlsxUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Parse the Excel data using XLSX
        const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
            cellDates: true,
            cellStyles: true
        });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

        // Find header rows
        let mainHeaderIndex = -1;
        let taskHeaderIndex = -1;

        // Find the main header row (contains "Name of Country")
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && row.some(cell => cell === 'Name of Country')) {
                mainHeaderIndex = i;
                break;
            }
        }

        // Find the task header row (contains task names)
        for (let i = mainHeaderIndex + 1; i < Math.min(mainHeaderIndex + 5, data.length); i++) {
            const row = data[i];
            if (row && row.some(cell => cell && typeof cell === 'string' && cell.includes('Malaria Program Reviews'))) {
                taskHeaderIndex = i;
                break;
            }
        }

        if (mainHeaderIndex === -1 || taskHeaderIndex === -1) {
            throw new Error('Could not find both header rows');
        }

        // Parse the main headers
        const mainHeaders = data[mainHeaderIndex];

        // Parse the task headers
        const taskHeaders = data[taskHeaderIndex];

        // Find the indices of relevant columns
        const countryColIndex = mainHeaders.findIndex(h => h === 'Name of Country');
        const programReviewsIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Malaria Program Reviews'));
        const midtermReviewsIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Midterm Reviews of NMSPs'));
        const nationalPlanningIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('National Malaria Strategic Planning'));
        const epiStratificationIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Epi Stratificaton'));
        const subNationalIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Sub National Tailoring'));
        const coopDevelopmentIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Coop Development'));
        const addendumIndex = taskHeaders.findIndex(h => h && typeof h === 'string' && h.includes('Addendum to Strategic Plan'));

        // Process data rows
        const tasks: Task[] = [];
        const countryTaskMap: Record<string, Task[]> = {};

        for (let i = taskHeaderIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || !row.length) continue;

            const countryName = row[countryColIndex];
            if (!countryName) continue;

            console.log(`\nProcessing country: ${countryName}`);

            const countryId = countryName.toString().toLowerCase().replace(/[^a-z0-9]/g, '-');
            countryTaskMap[countryId] = [];

            // Define task mappings with column indices and original dependencies
            const taskMappings: TaskMapping[] = [
                {
                    index: programReviewsIndex,
                    taskName: 'Malaria Program Review',
                    section: 'gc8',
                    id: 'gc8-1',
                    dependencies: [],
                },
                {
                    index: midtermReviewsIndex,
                    taskName: 'NSP at Mid-Level completed?',
                    section: 'gc8',
                    id: 'gc8-2',
                    dependencies: ['gc8-1'],
                },
                {
                    index: subNationalIndex,
                    taskName: 'Sub National Tailoring',
                    section: 'gc8',
                    id: 'gc8-3',
                    dependencies: ['gc8-2'],
                },
                {
                    index: addendumIndex,
                    taskName: 'Malaria Matchbox – if priority country',
                    section: 'gc8',
                    id: 'gc8-4',
                    dependencies: ['gc8-3'],
                },
                {
                    index: nationalPlanningIndex,
                    taskName: 'Research',
                    section: 'nsp',
                    id: 'nsp-1',
                    dependencies: [],
                },
                {
                    index: epiStratificationIndex,
                    taskName: 'Costing',
                    section: 'nsp',
                    id: 'nsp-2',
                    dependencies: ['nsp-1'],
                },
                {
                    index: coopDevelopmentIndex,
                    taskName: 'Operation Plan',
                    section: 'nsp',
                    id: 'nsp-3',
                    dependencies: ['nsp-2'],
                },
            ];

            taskMappings.forEach(mapping => {
                if (mapping.index === -1 || mapping.index >= row.length) return;

                const cellValue = row[mapping.index];
                const dateRange = cellValue?.toString().trim() ?? '';
                const dateInfo = parseDateRange(dateRange);

                let task: Task;

                if (
                    !dateInfo ||
                    !dateInfo.start ||
                    isNaN(dateInfo.start.getTime()) ||
                    typeof dateInfo.duration !== 'number' ||
                    isNaN(dateInfo.duration) ||
                    dateInfo.duration <= 0
                ) {
                    // ❌ Invalid or empty — fallback to today with 20-day duration
                    const fallbackStart = new Date();
                    task = {
                        id: `${countryId}-${mapping.id}`,
                        name: mapping.taskName,
                        section: mapping.section,
                        startDate: fallbackStart,
                        duration: 20,
                        completed: false,
                        dependencies: [],
                        comments: `${countryName}: Default (20d)`
                    };
                    console.log(`⚠️ Fallback: ${mapping.taskName} using default 20d starting ${fallbackStart.toDateString()}`);
                } else {
                    // ✅ Valid range
                    task = {
                        id: `${countryId}-${mapping.id}`,
                        name: mapping.taskName,
                        section: mapping.section,
                        startDate: dateInfo.start,
                        duration: dateInfo.duration,
                        completed: false,
                        dependencies: mapping.dependencies.map(dep => `${countryId}-${dep}`),
                        comments: `${countryName}: ${dateRange}`
                    };
                }

                countryTaskMap[countryId].push(task);
            });
        }

        // Process each country's tasks and add to final task list
        Object.entries(countryTaskMap).forEach(([countryId, countryTasks]) => {
            // Only process countries with at least one valid task
            if (countryTasks.length === 0) {
                console.log(`No valid tasks for country ID: ${countryId}`);
                return;
            }

            // Print all tasks for debugging
            console.log(`Valid tasks for ${countryId}:`);
            countryTasks.forEach(task => {
                console.log(`  ${task.id}: ${task.name}, duration: ${task.duration}, dependencies: ${task.dependencies.join(', ')}`);
            });

            // Fix dependencies - only include dependencies for tasks that actually exist
            const validTaskIds = new Set(countryTasks.map(task => task.id));

            countryTasks.forEach(task => {
                const originalDeps = [...task.dependencies];
                task.dependencies = task.dependencies.filter(depId => validTaskIds.has(depId));

                if (originalDeps.length !== task.dependencies.length) {
                    console.log(`  Filtered dependencies for ${task.id}: ${originalDeps.join(', ')} -> ${task.dependencies.join(', ')}`);
                }

                tasks.push(task);
            });
        });

        // Sort tasks by country name and then by section and task ID for proper grouping
        tasks.sort((a, b) => {
            const countryA = a.comments?.split(':')[0] || '';
            const countryB = b.comments?.split(':')[0] || '';

            if (countryA !== countryB) {
                return countryA.localeCompare(countryB);
            }

            // Within same country, sort by section
            if (a.section !== b.section) {
                return a.section.localeCompare(b.section);
            }

            // Within same section, sort by ID
            return a.id.localeCompare(b.id);
        });

        console.log('=== Fetch complete ===');
        console.log('Total tasks created:', tasks.length);

        return tasks;

    } catch (error) {
        console.error('Error in fetchSheetData:', error);
        throw error;
    }
}