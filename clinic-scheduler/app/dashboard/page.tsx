'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentCard from '@/components/AppointmentCard';
import { appointmentsAPI } from '@/lib/api'; // CHANGED: Import real API
import { Appointment } from '@/lib/types';
import SkeletonCard from '@/components/SkeletonCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // NEW: Fetch real data from Backend
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch based on role
        const params = user.role === 'patient' 
          ? { patientId: user.id } 
          : { providerId: user.id };
          
        const response = await appointmentsAPI.getAll(params);
        setAppointments(response.data || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        toast.error('Could not load appointments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (!user) return null;

  // Show loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Filter Data locally for UI
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingAppointments = appointments.filter(
    apt => apt.date >= today && apt.status === 'booked'
  );
  
  // NOTE: In a real app, 'past' might include completed or just old dates
  const pastAppointments = appointments.filter(
    apt => apt.date < today || apt.status === 'completed'
  );

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">
                {user.role === 'patient' 
                  ? 'Manage your appointments and health information'
                  : 'View and manage your patient appointments'
                }
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 flex items-center justify-between border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <CalendarDays className="w-10 h-10 text-blue-500 opacity-80" />
              </div>

              <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 flex items-center justify-between border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-3xl font-bold">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-500 opacity-80" />
              </div>

              <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 flex items-center justify-between border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-3xl font-bold">{appointments.length}</p>
                </div>
                <BarChart2 className="w-10 h-10 text-purple-500 opacity-80" />
              </div>
            </div>

            {/* Actions Section */}
            {user.role === 'patient' && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/book-appointment" className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <span className="text-3xl">➕</span>
                    <div>
                      <p className="font-medium text-gray-900">Book Appointment</p>
                      <p className="text-sm text-gray-600">Schedule a new visit</p>
                    </div>
                  </Link>
                  <Link href="/appointments" className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                    <span className="text-3xl">📋</span>
                    <div>
                      <p className="font-medium text-gray-900">View All</p>
                      <p className="text-sm text-gray-600">See appointment history</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                    <span className="text-3xl">💬</span>
                    <div>
                      <p className="font-medium text-gray-900">Messages</p>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

             {/* Provider Actions */}
             {user.role === 'provider' && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/provider/schedule"
                    className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-3xl">📅</span>
                    <div>
                      <p className="font-medium text-gray-900">My Schedule</p>
                      <p className="text-sm text-gray-600">View detailed schedule</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                    <span className="text-3xl">⚙️</span>
                    <div>
                      <p className="font-medium text-gray-900">Availability</p>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Appointments List */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Upcoming Appointments</h2>
                {upcomingAppointments.length > 3 && (
                  <Link href="/appointments" className="text-blue-600 hover:text-blue-700 font-medium">
                    View All →
                  </Link>
                )}
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingAppointments.slice(0, 3).map(appointment => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-lg text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 text-lg mb-2">No upcoming appointments</p>
                  {user.role === 'patient' && (
                    <Link href="/book-appointment" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Book Your First Appointment
                    </Link>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}