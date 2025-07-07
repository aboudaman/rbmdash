import React, { useState } from 'react';
import Modal from './Modal'; // Assume we have the Modal component

const TableWithProgress = () => {
    const [modalData, setModalData] = useState<any>(null);

    const data = [
        {
            country: 'Botswana',
            activity: 'Malaria MPR and NSP finalisation and launching workshop',
            status: 'Completed',
            partner: 'WHO/RBM',
            category: 'National plans and strategies',
            quarters: { Q1: 'green', Q2: 'green', Q3: 'black', Q4: null },
        },
        // Add more entries as per your requirement...
    ];

    const openModal = (countryData: any) => {
        setModalData(countryData);
    };

    return (
        <div className="p-4">
            <table className="min-w-full bg-white border-collapse">
                <thead>
                <tr>
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
                    <tr key={index}>
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
                            <div className="flex">
                                <div
                                    className={`w-4 h-4 ${item.quarters.Q1}`}
                                    title="Q1"
                                ></div>
                                <div
                                    className={`w-4 h-4 ${item.quarters.Q2}`}
                                    title="Q2"
                                ></div>
                                <div
                                    className={`w-4 h-4 ${item.quarters.Q3}`}
                                    title="Q3"
                                ></div>
                                <div
                                    className={`w-4 h-4 ${item.quarters.Q4}`}
                                    title="Q4"
                                ></div>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {modalData && (
                <Modal
                    country={modalData.country}
                    activity={modalData.activity}
                    timeline={[
                        { date: '2024 Q1', event: 'Initial workshop' },
                        { date: '2024 Q2', event: 'Mid-term review' },
                        { date: '2024 Q3', event: 'Approval phase' },
                        { date: '2024 Q4', event: 'Final report' },
                    ]}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
};

export default TableWithProgress;
