import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Modal from './Modal'; // Import the modal component

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const randomData = () => {
    const countries = ['USA', 'France', 'Germany', 'India', 'China'];
    const activities = ['Activity A', 'Activity B', 'Activity C', 'Activity D'];
    const statuses = ['Completed', 'Ongoing', 'Not Started'];
    const partners = ['Partner A', 'Partner B', 'Partner C'];
    const categories = ['Implementation Bottleneck', 'Implementation Support', 'Resource Mobilization'];
    const years = ['2023', '2024'];

    return countries.map(country => ({
        country,
        activity: activities[Math.floor(Math.random() * activities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        partner: partners[Math.floor(Math.random() * partners.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        year: years[Math.floor(Math.random() * years.length)],
        progress: Math.floor(Math.random() * 100), // progress in percentage
        quarters: {
            Q1: Math.random() > 0.5 ? true : false,
            Q2: Math.random() > 0.5 ? true : false,
            Q3: Math.random() > 0.5 ? true : false,
            Q4: Math.random() > 0.5 ? true : false,
        },
        timeline: [
            { date: '2023 Q1', event: 'Milestone 1 reached' },
            { date: '2023 Q2', event: 'Mid-term review' },
            { date: '2023 Q3', event: 'Final approval' },
            { date: '2023 Q4', event: 'Completion' },
        ],
    }));
};

const GanttChart = () => {
    const [modalData, setModalData] = useState<any>(null);
    const data = randomData();

    const option = {
        title: {
            text: 'Gantt Chart with Progress',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const dataItem = data.find(item => item.activity === params.seriesName);
                return `<strong>${dataItem?.activity}</strong><br/>Country: ${dataItem?.country}<br/>Progress: ${dataItem?.progress}%`;
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: ['Q1', 'Q2', 'Q3', 'Q4'],
            axisLabel: { interval: 0 },
        },
        yAxis: {
            type: 'category',
            data: data.map(item => item.country),
        },
        series: data.map(item => ({
            name: item.activity,
            type: 'bar',
            stack: item.country,
            label: {
                show: true,
                position: 'inside',
                formatter: () => `${item.progress}%`,
            },
            data: [item.quarters.Q1, item.quarters.Q2, item.quarters.Q3, item.quarters.Q4].map(q => (q ? item.progress / 100 : 0)),
        })),
    };

    const handleCountryClick = (country: string) => {
        const selectedCountry = data.find(d => d.country === country);
        setModalData(selectedCountry);
    };

    return (
        <div className="p-8">
            <ReactEcharts option={option} onEvents={{ click: (e: any) => handleCountryClick(e.name) }} />
            {modalData && (
                <Modal
                    country={modalData.country}
                    activity={modalData.activity}
                    status={modalData.status}
                    partner={modalData.partner}
                    category={modalData.category}
                    year={modalData.year}
                    progress={modalData.progress}
                    timeline={modalData.timeline}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
};

export default GanttChart;
