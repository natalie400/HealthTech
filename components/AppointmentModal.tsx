'use client';

import { useState } from 'react';
import Modal from './Modal';
import { Appointment } from '@/lib/types';

interface AppointmentModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({ appointment, isOpen, onClose }: AppointmentModalProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleReschedule = async () => {
    setIsRescheduling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Rescheduling functionality coming soon!');
    setIsRescheduling(false);
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    setIsCancelling(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Appointment cancelled!');
    setIsCancelling(false);
    onClose();
  };

  const statusColors = {
    booked: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details" size="md">
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${statusColors[appointment.status]}`}>
            {appointment.status.toUpperCase()}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Provider</p>
            <p className="text-lg font-semibold text-gray-900">{appointment.providerName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Patient</p>
            <p className="text-lg font-semibold text-gray-900">{appointment.patientName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Time</p>
            <p className="text-lg font-semibold text-gray-900">{appointment.time}</p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Reason for Visit</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900">{appointment.reason}</p>
          </div>
        </div>

        {/* Actions */}
        {appointment.status === 'booked' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReschedule}
              disabled={isRescheduling}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 px-4 py-3 bg-white border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}