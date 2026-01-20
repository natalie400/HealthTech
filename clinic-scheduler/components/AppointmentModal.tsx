'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Edit2, Trash2, XCircle, Check, Loader2 } from 'lucide-react';

interface AppointmentModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (id: number, date: string, time: string) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function AppointmentModal({ 
  appointment, 
  isOpen, 
  onClose,
  onReschedule,
  onCancel,
  onDelete
}: AppointmentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  if (!isOpen || !appointment) return null;

  // Format date safely
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'No date';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Get date string for input
  const getDateString = (dateValue: any) => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Initialize edit state when opening edit mode
  const startEditing = () => {
    setNewDate(getDateString(appointment.date));
    setNewTime(appointment.time || '');
    setIsEditing(true);
  };

  const handleSaveReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      await onReschedule(appointment.id, newDate, newTime);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Reschedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      onClose();
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    booked: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Helper for date limits
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const displayName = appointment.providerName || appointment.patientName || 'Unknown';
  const status = appointment.status || 'unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isEditing ? 'Reschedule Appointment' : 'Appointment Details'}
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* VIEW MODE */}
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3"/> Date
                  </p>
                  <p className="font-semibold text-gray-900">{formatDate(appointment.date)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> Time
                  </p>
                  <p className="font-semibold text-gray-900">{appointment.time || 'No time'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3"/> {appointment.providerName ? 'Provider' : 'Patient'}
                </p>
                <p className="font-semibold text-lg text-gray-900">{displayName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3"/> Reason
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 text-sm">
                  {appointment.reason || 'No reason provided'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {status}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                {status === 'booked' && (
                  <>
                    <button 
                      onClick={startEditing}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Edit2 className="w-4 h-4"/> Reschedule
                    </button>
                    <button 
                      onClick={() => handleAction(() => onCancel(appointment.id))}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-white border border-orange-200 text-orange-700 rounded-lg font-medium hover:bg-orange-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4"/>} Cancel
                    </button>
                  </>
                )}

                {(status === 'cancelled' || status === 'completed') && (
                  <button 
                    onClick={() => handleAction(() => onDelete(appointment.id))}
                    disabled={loading}
                    className="w-full py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>} Delete Record
                  </button>
                )}
              </div>
            </>
          )}

          {/* EDIT MODE (RESCHEDULE) */}
          {isEditing && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                Please select a new date and time for your appointment.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input 
                  type="date" 
                  min={minDateStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <select 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleSaveReschedule}
                  disabled={loading || !newDate || !newTime}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}