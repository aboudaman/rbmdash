import React, { useRef, useEffect, useState } from 'react';
import { Timeline as VisTimeline } from 'vis-timeline/standalone';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'tailwindcss/tailwind.css';

interface ModalProps {
    country: string;
    activity: string;
    onClose: () => void;
}

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

const Modal: React.FC<ModalProps> = ({ country, activity, onClose }) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    let timelineInstance: any = useRef(null);

    useEffect(() => {
        setIsOpen(true); // Trigger opening animation when the modal mounts

        if (timelineRef.current) {
            if (timelineInstance.current) {
                timelineInstance.current.destroy();
            }

            const activities = [
                { event: 'National plans and strategies', iconClass: 'fas fa-file-alt', color: '#4caf50' },
                { event: 'Implementation Support', iconClass: 'fas fa-hands-helping', color: '#f44336' },
                { event: 'Bottlenecks', iconClass: 'fas fa-exclamation-circle', color: '#ff9800' },
                { event: 'Global Fund Applications', iconClass: 'fas fa-flag', color: '#3f51b5' },
            ];

            const chosenActivities = activities
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const items = chosenActivities.map((activity, index) => {
                const randomMonth = Math.ceil(Math.random() * 6);
                const startDate = new Date(2024, randomMonth - 1, Math.ceil(Math.random() * 28));
                const endDate = addDays(startDate, 20 + Math.floor(Math.random() * 40));

                const container = document.createElement('span');
                container.innerHTML = `<i class="${activity.iconClass}" title="${activity.event}" style="margin-right: 8px;"></i> ${activity.event}`;

                return {
                    id: index + 1,
                    content: container,
                    start: formatDate(startDate),
                    end: formatDate(endDate),
                    style: `background-color: ${activity.color}; color: white;`,
                };
            });

            const options = {
                width: '100%',
                height: '300px',
                stack: true,
                zoomable: true,
                zoomMin: 1000 * 60 * 60 * 24 * 7,
                zoomMax: 1000 * 60 * 60 * 24 * 365 * 10,
                start: '2024-01-01',
                end: '2024-12-31',
                format: {
                    minorLabels: { month: 'MMM', day: 'D' },
                    majorLabels: { year: 'YYYY' },
                },
                clickToUse: true,
            };

            timelineInstance.current = new VisTimeline(timelineRef.current, items, options);

            timelineInstance.current.on('select', (props) => {
                const selectedItem = items.find((item) => item.id === props.items[0]);
                if (selectedItem) {
                    setIsAnimating(false); // Reset animation
                    setTimeout(() => {
                        setSelectedEvent({
                            event: selectedItem.content.innerHTML,
                            start: selectedItem.start,
                            end: selectedItem.end,
                        });
                        setIsAnimating(true); // Trigger fly-in animation
                    }, 50);
                }
            });
        }

        return () => {
            if (timelineInstance.current) {
                timelineInstance.current.destroy();
                timelineInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
            <div
                className={`bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full relative z-10 transition-transform duration-500 ${
                    isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Details for {country}</h2>
                <p><strong>Activity:</strong> {activity}</p>

                <div className="mt-4">
                    <div ref={timelineRef}></div>
                </div>

                {selectedEvent && (
                    <div
                        className={`mt-6 p-4 bg-gray-100 rounded-lg ${
                            isAnimating ? 'animate-fly-in' : ''
                        }`}
                    >
                        <h3 className="text-lg font-bold">Selected Activity Details</h3>
                        <p><strong>Event:</strong> <span dangerouslySetInnerHTML={{ __html: selectedEvent.event }} /></p>
                        <p><strong>Start:</strong> {selectedEvent.start}</p>
                        <p><strong>End:</strong> {selectedEvent.end}</p>

                        <div className="mt-4 flex space-x-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">View Details</button>
                            {/*<button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Edit Event</button>*/}
                            {/*<button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete Event</button>*/}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => {
                        setIsOpen(false); // Trigger close animation
                        setTimeout(onClose, 300); // Close modal after animation
                    }}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
