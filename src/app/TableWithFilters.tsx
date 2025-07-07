import React, { useState } from 'react';
import Modal from './Modal'; // Import the modal component


interface TimelineEvent {
    date: string;
    event: string;
    progress: number;
}

interface CountryData {
    country: string;
    activity: string;
    status: string;
    partner: string;
    category: string;
    quarters: { Q1: string | null; Q2: string | null; Q3: string | null; Q4: string | null };
    timeline: TimelineEvent[];
}

const TableWithFilters = () => {
    interface TimelineEvent {
      date: string;
      event: string;
      progress: number;
    }

    interface CountryData {
      country: string;
      activity: string;
      status: string;
      partner: string;
      category: string;
      quarters: { Q1: string | null; Q2: string | null; Q3: string | null; Q4: string | null };
      timeline: TimelineEvent[];
    }

    const [modalData, setModalData] = useState<CountryData | null>(null);

    // Expanded data with more countries and timelines
    const data = [
        {
            country: 'Botswana',
            activity: 'Malaria MPR and NSP finalisation and launching workshop',
            status: 'New',
            partner: 'WHO/RBM',
            category: 'National plans and strategies',
            quarters: { Q1: 'green', Q2: 'green', Q3: 'black', Q4: null },
            timeline: [
                { date: '2024 Q1', event: 'Workshop Completed', progress: 100 },
                { date: '2024 Q2', event: 'Review', progress: 80 },
                { date: '2024 Q3', event: 'Approval', progress: 50 },
                { date: '2024 Q4', event: 'Final Reporting', progress: 20 },
            ],
        },
        {
            country: 'Burundi',
            activity: 'ITNs mass campaign planning',
            status: 'Completed',
            partner: 'RBM/AMP',
            category: 'Implementation Support',
            quarters: { Q1: 'green', Q2: null, Q3: 'green', Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Initial Planning', progress: 100 },
                { date: '2024 Q2', event: 'Logistics Setup', progress: 70 },
                { date: '2024 Q3', event: 'Mid-term Review', progress: 60 },
                { date: '2024 Q4', event: 'Final Approval', progress: 30 },
            ],
        },
        {
            country: 'Kenya',
            activity: 'Conduct malaria programme review of current malaria strategic plan',
            status: 'Ongoing',
            partner: 'WHO/RBM',
            category: 'National plans and strategies',
            quarters: { Q1: 'green', Q2: 'green', Q3: 'black', Q4: null },
            timeline: [
                { date: '2024 Q1', event: 'Initial Review', progress: 90 },
                { date: '2024 Q2', event: 'Mid-term Progress', progress: 60 },
                { date: '2024 Q3', event: 'Approval Meeting', progress: 40 },
                { date: '2024 Q4', event: 'Final Submission', progress: 20 },
            ],
        },
        {
            country: 'Comoros',
            activity: 'Developing a document for the Grant Cycle 7',
            status: 'Requested',
            partner: 'RBM',
            category: 'Resource Mobilization',
            quarters: { Q1: 'green', Q2: 'red', Q3: null, Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Initial Proposal', progress: 80 },
                { date: '2024 Q2', event: 'Budget Planning', progress: 40 },
                { date: '2024 Q3', event: 'Fund Allocation', progress: 0 },
                { date: '2024 Q4', event: 'Grant Agreement', progress: 0 },
            ],
        },
        {
            country: 'Madagascar',
            activity: 'ITNs mass campaign planning',
            status: 'Completed',
            partner: 'RBM/AMP',
            category: 'Implementation Support',
            quarters: { Q1: 'green', Q2: null, Q3: 'green', Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Campaign Kickoff', progress: 100 },
                { date: '2024 Q2', event: 'Logistics Setup', progress: 70 },
                { date: '2024 Q3', event: 'Mid-term Review', progress: 50 },
                { date: '2024 Q4', event: 'Final Evaluation', progress: 30 },
            ],
        },
        {
            country: 'Malawi',
            activity: 'Mass LLIN distribution campaign planning',
            status: 'Completed',
            partner: 'RBM/AMP',
            category: 'Implementation Support',
            quarters: { Q1: 'green', Q2: 'green', Q3: 'green', Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Initial Distribution', progress: 100 },
                { date: '2024 Q2', event: 'Mid-year Review', progress: 80 },
                { date: '2024 Q3', event: 'Ongoing Campaign', progress: 60 },
                { date: '2024 Q4', event: 'Final Reporting', progress: 40 },
            ],
        },
        {
            country: 'Nigeria',
            activity: 'Develop malaria strategic plan',
            status: 'Ongoing',
            partner: 'WHO/RBM',
            category: 'National plans and strategies',
            quarters: { Q1: 'green', Q2: 'green', Q3: 'green', Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Initial Workshop', progress: 90 },
                { date: '2024 Q2', event: 'Data Collection', progress: 70 },
                { date: '2024 Q3', event: 'Strategy Finalization', progress: 50 },
                { date: '2024 Q4', event: 'Final Report', progress: 30 },
            ],
        },
        {
            country: 'Tanzania',
            activity: 'Microscopy training for malaria diagnosis',
            status: 'Completed',
            partner: 'WHO/RBM',
            category: 'National plans and strategies',
            quarters: { Q1: 'green', Q2: null, Q3: 'green', Q4: 'black' },
            timeline: [
                { date: '2024 Q1', event: 'Training Completed', progress: 100 },
                { date: '2024 Q2', event: 'Evaluation Setup', progress: 80 },
                { date: '2024 Q3', event: 'Certification', progress: 60 },
                { date: '2024 Q4', event: 'Final Review', progress: 40 },
            ],
        },
    ];

    const openModal = (countryData: CountryData) => {
        setModalData(countryData);
    };

    return (
        <div className="p-4">
            {/* Filter buttons */}
            <div className="flex space-x-4 mb-6">
                <button className="bg-gray-100 px-4 py-2 rounded-md">Country</button>
                <button className="bg-gray-100 px-4 py-2 rounded-md">Activity</button>
                <button className="bg-gray-100 px-4 py-2 rounded-md">Status</button>
                <button className="bg-gray-100 px-4 py-2 rounded-md">Partner</button>
                <button className="bg-gray-100 px-4 py-2 rounded-md">Category</button>
            </div>

            {/* Table */}
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Country</th>
                    <th className="border px-4 py-2">Activity</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Partner</th>
                    <th className="border px-4 py-2">Category</th>
                    <th className="border px-4 py-2">2024</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td
                            className="border px-4 py-2 cursor-pointer text-blue-500"
                            onClick={() => openModal(item)}
                        >
                            {item.country}
                        </td>
                        <td className="border px-4 py-2">{item.activity}</td>
                        <td className="border px-4 py-2">{item.status}</td>
                        <td className="border px-4 py-2">{item.partner}</td>
                        <td className="border px-4 py-2">{item.category}</td>
                        <td className="border px-4 py-2">
                            <div className="flex space-x-2">
                                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                                    <div
                                        key={quarter}
                                        className={`w-6 h-6 ${
                                            quarter in item.quarters && item.quarters[quarter as keyof typeof item.quarters] ? 
                                            item.quarters[quarter as keyof typeof item.quarters] : 'bg-gray-300'
                                        }`}
                                        title={quarter}
                                    >
                                        {quarter in item.quarters && item.quarters[quarter as keyof typeof item.quarters] === 'black' && (
                                            <span role="img" aria-label="flag">
                                                    🚩
                                                </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal for timeline details */}
            {modalData && (
                <Modal
                    country={modalData.country}
                    activity={modalData.activity}
                    timeline={modalData.timeline}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
};

export default TableWithFilters;
