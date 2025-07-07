// types.ts
export interface Task {
    id: string;
    name: string;
    section: string;
    startDate: Date;
    duration: number; // in days
    dependencies: string[];
    completed: boolean;
    comments?: string;
}

export interface Section {
    id: string;
    name: string;
}