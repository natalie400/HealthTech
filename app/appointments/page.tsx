'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentCard from '@/components/AppointmentCard';
import { getAppointmentsByPatient } from '@/lib/mockData';
import { Appointment } from '@/lib/types';
import ProtectedRoute  from '@/components/ProtectedRoute';
export default function Appointments() {
  
  // Get current user
  const { user } = useAuth();
  // Get all appointments for the logged-in patient
  const allAppointments = user ? getAppointmentsByPatient(user.id) : [];
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'provider'>('date');

  // Filter appointments based on search and status
  const filteredAppointments = allAppointments.filter(apt => {
    // Check if search term matches provider name or reason
    const matchesSearch = 
      apt.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if status matches filter
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first
    } else {
      return a.providerName.localeCompare(b.providerName); // Alphabetical
    }
  });

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Appointments
        </h1>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-3 items-center">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-xs font-semibold text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Provider or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-transparent text-gray-900 placeholder-gray-400 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-transparent text-gray-900 text-xs"
              >
                <option value="all">All</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort" className="block text-xs font-semibold text-gray-700 mb-1">
                Sort
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'provider')}
                className="w-full px-2 py-1 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-transparent text-gray-900 text-xs"
              >
                <option value="date">Date</option>
                <option value="provider">Provider</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-900">
            Showing {sortedAppointments.length} of {allAppointments.length} appointments
          </div>
        </div>

        {/* Appointments Grid */}
        {sortedAppointments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-900 text-lg">No appointments found</p>
            <p className="text-gray-700 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}