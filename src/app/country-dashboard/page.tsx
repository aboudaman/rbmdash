'use client';

import React, { useState } from 'react';
import GanttChart, { GanttDataItem } from '../components/GanttUniversal';

const allCountries = [
    'Cameroon', 'Zambia', 'Nigeria', 'Senegal', 'Ghana', 'Uganda', 'Ethiopia',
    'Rwanda', 'Kenya', 'Tanzania', 'Mozambique', 'Malawi', 'Chad', 'Benin',
    'Burkina Faso', 'Sierra Leone', 'Gambia', 'Eritrea', 'Namibia', 'Guinea'
];

const getRandomTimeline = (year: number, seedOffset: number): GanttDataItem[] => {
    return allCountries.map((country, i) => {
        const offset = (i + seedOffset) % 9;
        const startMonth = 1 + offset;
        const duration = 1 + ((i + seedOffset) % 3);
        const start = new Date(year, startMonth - 1, 1);
        const end = new Date(year, startMonth - 1 + duration, 1);
        return {
            country,
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    });
};

const interventions: Record<string, { data: GanttDataItem[]; color: string }> = {
    'Epi Stratification Timelines': {
        data: getRandomTimeline(2025, 0),
        color: '#1b9e77'
    },
    'Sub National Tailoring Timelines': {
        data: getRandomTimeline(2024, 2),
        color: '#d95f02'
    },
    'Mid Term Review Timelines': {
        data: getRandomTimeline(2026, 4),
        color: '#7570b3'
    },
    'Malaria Program Review Timelines': {
        data: getRandomTimeline(2027, 6),
        color: '#e7298a'
    },
    'Coop Development Timelines': {
        data: getRandomTimeline(2025, 8),
        color: '#66a61e'
    }
};

const DashboardPage = () => {
    const keys = Object.keys(interventions);
    const [selected, setSelected] = useState(keys[0]);

    const { data, color } = interventions[selected];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl px-6 py-8 md:px-10 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">
                          Country Support Dashboard Strategic Malaria Activities
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Explore national timelines for strategic malaria activities
                        </p>
                    </div>

                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="text-sm md:text-base border border-gray-300 focus:border-blue-500 rounded-md px-4 py-2 shadow-sm transition duration-150"
                    >
                        {keys.map((key) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rounded-md border border-gray-100 shadow-inner bg-gray-50 p-4">
                    <GanttChart title={selected} data={data} color={color} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
