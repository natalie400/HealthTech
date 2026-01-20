'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/lib/api'; // CHANGED
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

  // 2. Handle Status Updates (Real API Call)
  const handleStatusUpdate = async (id: number, newStatus: "booked" | "cancelled" | "completed") => {
    try {
      await appointmentsAPI.update(id, { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      
      // Update local state to reflect change immediately
      setAllAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;

  // Filter by selected date
  const dayAppointments = allAppointments.filter(
    apt => apt.date === selectedDate
  );

  // Get week view data
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
  
  // Calculate Stats
  const stats = {
    today: dayAppointments.length,
    thisWeek: allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return aptDate >= new Date() && aptDate <= weekFromNow;
    }).length,
    booked: allAppointments.filter(apt => apt.status === 'booked').length,
    completed: allAppointments.filter(apt => apt.status === 'completed').length,
  };

  return (
    <ProtectedRoute requiredRole="provider">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
            <div className="mt-4 flex items-center gap-2">
              <label htmlFor="privacy-toggle" className="text-sm font-medium text-gray-700">Privacy Mode</label>
              <input
                id="privacy-toggle"
                type="checkbox"
                checked={privacyMode}
                onChange={() => setPrivacyMode((v) => !v)}
                className="accent-blue-600 h-4 w-4"
              />
              <span className="text-xs text-gray-500">{privacyMode ? 'ON (names hidden)' : 'OFF (names visible)'}</span>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             {/* Today */}
             <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-600 mb-1">Today</p><p className="text-3xl font-bold text-blue-600">{stats.today}</p></div>
                <div className="text-4xl">📅</div>
              </div>
            </div>
            {/* Week */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-600 mb-1">This Week</p><p className="text-3xl font-bold text-purple-600">{stats.thisWeek}</p></div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
            {/* Booked */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-600 mb-1">Booked</p><p className="text-3xl font-bold text-green-600">{stats.booked}</p></div>
                <div className="text-4xl">✓</div>
              </div>
            </div>
            {/* Completed */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-600 mb-1">Completed</p><p className="text-3xl font-bold text-gray-600">{stats.completed}</p></div>
                <div className="text-4xl">✔️</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-2">
                <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Day View</button>
                <button onClick={() => setView('week')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Week View</button>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { const date = new Date(selectedDate); date.setDate(date.getDate() - 1); setSelectedDate(date.toISOString().split('T')[0]); }} className="p-2 hover:bg-gray-100 rounded-lg">← Previous</button>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => { const date = new Date(selectedDate); date.setDate(date.getDate() + 1); setSelectedDate(date.toISOString().split('T')[0]); }} className="p-2 hover:bg-gray-100 rounded-lg">Next →</button>
                <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Today</button>
              </div>
            </div>
          </div>

          {/* Views */}
          {view === 'day' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              </div>
              <div className="p-6">
                {dayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {dayAppointments.map(apt => (
                      <AppointmentItem 
                        key={apt.id} 
                        appointment={apt} 
                        onStatusChange={handleStatusUpdate} // Pass handler
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12"><div className="text-6xl mb-4">📭</div><p className="text-gray-600">No appointments scheduled</p></div>
                )}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekData.map((day) => (
                <div key={day.date} className={`bg-white rounded-lg shadow overflow-hidden ${day.date === selectedDate ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="bg-gray-50 p-3 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-600">{day.dayName}</p>
                    <p className="text-2xl font-bold text-gray-900">{day.dayNumber}</p>
                  </div>
                  <div className="p-3">
                    {day.appointments.length > 0 ? (
                      <div className="space-y-2">
                        {day.appointments.map(apt => (
                          <div key={apt.id} className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="font-medium text-blue-900">{apt.time}</p>
                            <p className={`text-blue-700 truncate ${privacyMode ? 'blur-sm select-none' : ''}`}>{privacyMode ? `Patient #${apt.patientId}` : apt.patientName}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400 text-center py-4">No appointments</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Updated Appointment Item to accept Handler
function AppointmentItem({ appointment, onStatusChange }: { appointment: Appointment, onStatusChange: (id: number, status: "booked" | "cancelled" | "completed") => Promise<void> }) {
  const statusColors: any = {
    booked: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-semibold text-gray-900">{appointment.time}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status] || ''}`}>
              {appointment.status}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">{appointment.patientName}</h3>
          <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
        </div>
      </div>

      {appointment.status === 'booked' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onStatusChange(appointment.id, 'completed')}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark Complete
          </button>
          <button
            onClick={() => onStatusChange(appointment.id, 'cancelled')}
            className="flex-1 px-3 py-2 bg-white border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}