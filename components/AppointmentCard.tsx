'use client';

import { useState } from 'react';
import { Appointment } from '@/lib/types';
import AppointmentModal from './AppointmentModal';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusColors = {
    booked: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
      >
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
        
        <div className="flex gap-4 text-sm text-gray-600 mt-3">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🕐</span>
            <span>{appointment.time}</span>
          </div>
        </div>

        {/* Click indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-blue-600 font-medium">Click for details →</p>
        </div>
      </div>

      {/* Modal */}
      <AppointmentModal
        appointment={appointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}