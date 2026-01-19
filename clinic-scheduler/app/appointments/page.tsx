'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/lib/api'; 
import { Appointment } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import AppointmentCard from '@/components/AppointmentCard'; // Your existing component
import AppointmentModal from '@/components/AppointmentModal'; // Your existing component
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

export default function Appointments() {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Data
  const loadAppointments = async () => {
    if (!user) return;
    try {
      const params = user.role === 'patient' ? { patientId: user.id } : { providerId: user.id };
      const response = await appointmentsAPI.getAll(params);
      setAllAppointments(response.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [user]);

  // 2. Handlers passed to the Modal
  const handleReschedule = async (id: number, date: string, time: string) => {
    try {
      await appointmentsAPI.update(id, { date, time });
      toast.success('Appointment rescheduled successfully');
      loadAppointments(); // Refresh list
    } catch (error) {
      toast.error('Failed to reschedule');
      throw error; // Let modal know it failed
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await appointmentsAPI.delete(id);
      toast.success('Record deleted');
      setAllAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
      throw error;
    }
  };

  // Open Modal
  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredAppointments = allAppointments.filter(apt => {
    const matchesSearch = (apt.providerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (apt.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Appointments</h1>
          
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 sticky top-4 z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map(apt => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt} 
                onClick={openModal} // Opens your existing modal
              />
            ))}
          </div>

          {/* Your Existing Modal */}
          <AppointmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            appointment={selectedAppointment}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
          
        </div>
      </div>
    </ProtectedRoute>
  );
}