'use client';

import { useState, useEffect } from 'react';
import AppointmentCard from '@/components/AppointmentCard';
import AppointmentModal from '@/components/AppointmentModal';
import { appointmentsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

export default function Appointments() {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'provider'>('date');
  
  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast, showToast, hideToast } = useToast();

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const params = user.role === 'patient'
        ? { patientId: user.id }
        : { providerId: user.id };

      const response = await appointmentsAPI.getAll(params);

      if (response.success) {
        setAllAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAllAppointments([]);
      showToast('Failed to load appointments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card click - open modal
  const handleCardClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Handle reschedule
  const handleReschedule = async (id: number, date: string, time: string) => {
    try {
      await appointmentsAPI.update(id, { date, time });
      showToast('Appointment rescheduled successfully!', 'success');
      await fetchAppointments(); // Refresh list
    } catch (error) {
      showToast('Failed to reschedule appointment', 'error');
    }
  };

  // Handle cancel
  const handleCancel = async (id: number) => {
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      showToast('Appointment cancelled', 'success');
      await fetchAppointments(); // Refresh list
    } catch (error) {
      showToast('Failed to cancel appointment', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await appointmentsAPI.delete(id);
      showToast('Appointment deleted', 'success');
      await fetchAppointments(); // Refresh list
    } catch (error) {
      showToast('Failed to delete appointment', 'error');
    }
  };

  // Filter appointments
  const filteredAppointments = allAppointments.filter(apt => {
    if (!apt) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (apt.providerName && apt.providerName.toLowerCase().includes(searchLower)) ||
      (apt.patientName && apt.patientName.toLowerCase().includes(searchLower)) ||
      (apt.reason && apt.reason.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (!a || !b) return 0;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    } else {
      const nameA = a.providerName || '';
      const nameB = b.providerName || '';
      return nameA.localeCompare(nameB);
    }
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading appointments..." />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            My Appointments
          </h1>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search Input */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by provider or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'provider')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="provider">Provider Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {sortedAppointments.length} of {allAppointments.length} appointments
            </div>
          </div>

          {/* Appointments Grid */}
          {sortedAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedAppointments.map((appointment, index) => (
                <AppointmentCard 
                  key={appointment?.id || index} 
                  appointment={appointment}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No appointments found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Appointment Modal */}
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />

        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </ProtectedRoute>
  );
}