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
    booked: 'bg-gradient-to-r from-green-200 via-green-100 to-white text-green-900 border-green-300',
    cancelled: 'bg-gradient-to-r from-red-200 via-red-100 to-white text-red-900 border-red-300',
    completed: 'bg-gradient-to-r from-gray-200 via-gray-100 to-white text-gray-900 border-gray-300',
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="backdrop-blur-lg bg-white/70 border border-gray-100 rounded-xl p-2 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-400 relative overflow-hidden min-h-[90px] max-w-xs w-full mx-auto"
      >
        {/* Decorative gradient accent */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-100 via-transparent to-transparent rounded-bl-xl pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-base text-gray-900 tracking-tight mb-0 flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-sm shadow mr-1">👨‍⚕️</span>
              {appointment.providerName}
            </h3>
            <p className="text-xs text-gray-500 italic mb-0">{appointment.reason}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[appointment.status]} shadow-sm uppercase tracking-wide`}>
            {appointment.status}
          </span>
        </div>
        <div className="flex gap-3 text-xs text-gray-700 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-blue-500 text-sm">📅</span>
            <span className="font-medium">{appointment.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-500 text-sm">🕐</span>
            <span className="font-medium">{appointment.time}</span>
          </div>
        </div>
        {/* Click indicator */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end">
          <p className="text-[10px] text-blue-700 font-semibold tracking-wide">View details →</p>
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