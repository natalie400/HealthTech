'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/lib/api';
import { Appointment } from '@/lib/types';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProviderSchedule() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [view, setView] = useState<'day' | 'week'>('day');
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New State for Blocking Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockTime, setBlockTime] = useState('09:00');

  // 1. Fetch Data
  useEffect(() => {
    async function loadSchedule() {
      if (!user) return;
      try {
        const response = await appointmentsAPI.getAll({ providerId: user.id });
        setAllAppointments(response.data || []);
      } catch (error) {
        toast.error('Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    }
    loadSchedule();
  }, [user]);

  // 2. Handle Status Updates
  const handleStatusUpdate = async (id: number, newStatus: "booked" | "cancelled" | "completed" | "blocked") => {
    try {
      await appointmentsAPI.update(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      
      setAllAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // 3. Handle Blocking Time
  const handleBlockTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Create a "fake" appointment to represent the block
      const newBlock = await appointmentsAPI.create({
        patientId: user.id, // Provider books themselves
        providerId: user.id,
        date: selectedDate,
        time: blockTime,
        reason: "Unavailable / Blocked"
      });

      toast.success('Time slot blocked successfully');
      setIsBlockModalOpen(false);
      
      // Refresh list (or append locally for speed)
      const blockedApt = { ...newBlock.data, status: 'blocked', patientName: 'Unavailable' };
      setAllAppointments(prev => [...prev, blockedApt]);
      
    } catch (error) {
      toast.error('Failed to block time');
    }
  };

  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;

  // Filter by selected date
  const dayAppointments = allAppointments.filter(
    apt => apt.date === selectedDate
  );

  const getWeekAppointments = () => {
    const days = [];
    const today = new Date(selectedDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayApts = allAppointments.filter(apt => apt.date === dateStr);
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        appointments: dayApts,
      });
    }
    return days;
  };
  const weekData = getWeekAppointments();

  const stats = {
    today: dayAppointments.length,
    booked: allAppointments.filter(apt => apt.status === 'booked').length,
    completed: allAppointments.filter(apt => apt.status === 'completed').length,
    blocked: allAppointments.filter(apt => apt.status === 'blocked').length,
  };

  return (
    <ProtectedRoute requiredRole="provider">
      <div className="min-h-screen bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">My Schedule</h1>
              {/* Changed from gray-800 to black */}
              <p className="text-black font-medium">Welcome back, {user.name}</p>
              <div className="mt-4 flex items-center gap-2">
                <label className="text-sm font-bold text-black">Privacy Mode</label>
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={() => setPrivacyMode((v) => !v)}
                  className="accent-blue-600 h-4 w-4"
                />
              </div>
            </div>
            {/* Block Time Button */}
            <button 
              onClick={() => setIsBlockModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              ⛔ Block Time
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-white rounded-lg shadow p-6">
                {/* Changed labels to black font-bold */}
                <p className="text-sm font-bold text-black mb-1">Today</p><p className="text-3xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-bold text-black mb-1">Booked</p><p className="text-3xl font-bold text-green-600">{stats.booked}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-bold text-black mb-1">Completed</p><p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-bold text-black mb-1">Blocked Slots</p><p className="text-3xl font-bold text-red-500">{stats.blocked}</p>
            </div>
          </div>

          {/* Controls (Dates) */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-2">
                {/* Updated inactive buttons to be text-black instead of gray */}
                <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}>Day View</button>
                <button onClick={() => setView('week')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black border border-gray-300'}`}>Week View</button>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { const date = new Date(selectedDate); date.setDate(date.getDate() - 1); setSelectedDate(date.toISOString().split('T')[0]); }} className="p-2 hover:bg-gray-100 rounded-lg text-black font-bold border border-gray-300">← Previous</button>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-black font-medium" />
                <button onClick={() => { const date = new Date(selectedDate); date.setDate(date.getDate() + 1); setSelectedDate(date.toISOString().split('T')[0]); }} className="p-2 hover:bg-gray-100 rounded-lg text-black font-bold border border-gray-300">Next →</button>
              </div>
            </div>
          </div>

          {/* VIEW: DAY */}
          {view === 'day' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-black mb-6">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              {dayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dayAppointments.map(apt => (
                    <AppointmentItem 
                      key={apt.id} 
                      appointment={apt} 
                      onStatusChange={handleStatusUpdate} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12"><p className="text-black font-medium text-lg">No appointments or blocks scheduled</p></div>
              )}
            </div>
          )}

          {/* VIEW: WEEK */}
          {view === 'week' && (
             <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
             {weekData.map((day) => (
               <div key={day.date} className={`bg-white rounded-lg shadow overflow-hidden ${day.date === selectedDate ? 'ring-2 ring-blue-500' : ''}`}>
                 <div className="bg-gray-100 p-3 border-b border-gray-300">
                   <p className="text-xs font-bold text-black">{day.dayName}</p>
                   <p className="text-2xl font-black text-black">{day.dayNumber}</p>
                 </div>
                 <div className="p-3">
                   {day.appointments.map(apt => (
                     <div key={apt.id} className={`text-xs p-2 mb-2 rounded border ${apt.status === 'blocked' ? 'bg-gray-200 border-gray-400 text-black' : 'bg-blue-50 border-blue-200 text-black'}`}>
                       <p className="font-bold">{apt.time}</p>
                       <p className="truncate font-medium">{apt.status === 'blocked' ? 'UNAVAILABLE' : (privacyMode ? `Patient #${apt.patientId}` : apt.patientName)}</p>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
          )}
        </div>

        {/* BLOCK TIME MODAL */}
        {isBlockModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-black">Block Time Slot</h3>
              <p className="text-black mb-4">Select a time to mark as unavailable for <strong>{selectedDate}</strong>.</p>
              
              <form onSubmit={handleBlockTime}>
                <label className="block text-sm font-bold text-black mb-2">Time</label>
                <select 
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 text-black bg-white"
                >
                  {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsBlockModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-black font-bold">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">Confirm Block</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}

// Updated Item Component - NO GRAY TEXT
function AppointmentItem({ appointment, onStatusChange }: { appointment: Appointment, onStatusChange: (id: number, status: any) => Promise<void> }) {
  const isBlocked = appointment.status === 'blocked';

  const statusColors: any = {
    booked: 'bg-green-100 text-black border-green-300', // Changed text-green-800 to text-black
    completed: 'bg-gray-100 text-black border-gray-300', // Changed text-gray-800 to text-black
    cancelled: 'bg-red-100 text-black border-red-300', // Changed text-red-800 to text-black
    blocked: 'bg-gray-200 text-black border-gray-400', // Changed text-gray-600 to text-black
  };

  return (
    <div className={`border rounded-lg p-4 transition-shadow ${isBlocked ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300 hover:shadow-md'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* FORCE BLACK TEXT */}
            <span className="text-lg font-bold text-black">{appointment.time}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[appointment.status] || ''}`}>
              {isBlocked ? 'UNAVAILABLE' : appointment.status.toUpperCase()}
            </span>
          </div>
          {/* FORCE BLACK TEXT */}
          <h3 className={`text-lg font-bold text-black ${isBlocked ? 'italic' : ''}`}>
            {isBlocked ? 'Time Blocked by You' : appointment.patientName}
          </h3>
          {/* FORCE BLACK TEXT */}
          <p className="text-sm font-medium text-black mt-1">{appointment.reason}</p>
        </div>
      </div>

      {/* Actions */}
      {appointment.status === 'booked' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-300">
          <button onClick={() => onStatusChange(appointment.id, 'completed')} className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700">Complete</button>
          <button onClick={() => onStatusChange(appointment.id, 'cancelled')} className="flex-1 px-3 py-2 bg-white border border-red-600 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50">Cancel</button>
        </div>
      )}
      
      {/* Allow Unblocking */}
      {isBlocked && (
         <div className="flex gap-2 mt-4 pt-4 border-t border-gray-400">
            <button onClick={() => onStatusChange(appointment.id, 'cancelled')} className="w-full px-3 py-2 bg-white border border-gray-500 text-black text-sm font-bold rounded-lg hover:bg-gray-100">
              🔓 Unblock Time
            </button>
         </div>
      )}
    </div>
  );
}