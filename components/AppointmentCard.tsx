'use client';

import { Appointment } from '@/lib/types';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusColors = {
    booked: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const handleCancel = () => {
    alert(`Cancel appointment with ${appointment.providerName}?`);
    // Later we'll connect this to real functionality
  };

  const handleReschedule = () => {
    alert(`Reschedule appointment with ${appointment.providerName}?`);
    // Later we'll connect this to real functionality
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {appointment.providerName}
          </h3>
          <p className="text-sm text-gray-600">{appointment.reason}</p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="flex gap-4 text-sm text-gray-600 mt-3 mb-4">
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🕐</span>
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* Action Buttons - Only show for booked appointments */}
      {appointment.status === 'booked' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleReschedule}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-white border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}