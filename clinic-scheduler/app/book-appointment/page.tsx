
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { appointmentsAPI, usersAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast'; // Using the standard toast library
import { Calendar, Clock, User, FileText, Loader2 } from 'lucide-react';

// --- 1. VALIDATION SCHEMA ---
const bookingSchema = z.object({
  providerId: z.string().min(1, 'Please select a specialist'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be less than 200 characters'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

type Provider = {
  id: number;
  name: string;
  email: string;
};

export default function BookAppointment() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for data
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // --- 2. FORM SETUP ---
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Watch values for auto-save and UI logic
  const formValues = watch();
  const watchProvider = watch('providerId');
  const watchDate = watch('date');

  // --- 3. AUTO-SAVE LOGIC ---
  // Load Draft
  const hasLoadedDraft = useRef(false);
  useEffect(() => {
    if (hasLoadedDraft.current) return;
    hasLoadedDraft.current = true;
    const savedDraft = localStorage.getItem('bookingDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        reset(draft);
        toast('Draft loaded from previous session', { icon: '📝' });
      } catch (error) {
        // ignore invalid draft
      }
    }
  }, [reset]);

  // Save Draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formValues && Object.values(formValues).some(v => v)) {
        localStorage.setItem('bookingDraft', JSON.stringify(formValues));
      }
    }, 1000); // Save after 1 second of inactivity
    return () => clearTimeout(timeoutId);
  }, [formValues]);

  // --- 4. FETCH DATA ---
  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await usersAPI.getProviders();
        const doctorList = Array.isArray(response) ? response : (response.data || []);
        setProviders(doctorList);
      } catch (error) {
        toast.error('Could not load list of doctors');
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchProviders();
  }, []);

  // --- 5. SUBMIT HANDLER ---
  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await appointmentsAPI.create({
        patientId: user.id,
        providerId: parseInt(data.providerId),
        date: data.date,
        time: data.time,
        reason: data.reason,
      });

      // Cleanup
      localStorage.removeItem('bookingDraft');
      toast.success('Appointment booked successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  // Date helpers
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Static time slots (can be made dynamic later)
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* Header - EXACT ORIGINAL DESIGN */}
            <div className="bg-blue-600 px-8 py-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Book an Appointment
              </h1>
              <p className="text-blue-100 mt-2">
                Schedule a visit with one of our specialists.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              
              {/* 1. Select Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Select Doctor
                </label>
                {isPageLoading ? (
                  <div className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
                ) : (
                  <>
                    <select
                      {...register('providerId')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                    >
                      <option value="">-- Choose a Specialist --</option>
                      {providers.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                    {/* Error Message */}
                    {errors.providerId && (
                      <p className="text-xs text-red-500 mt-1">{errors.providerId.message}</p>
                    )}
                  </>
                )}
                {providers.length === 0 && !isPageLoading && (
                  <p className="text-xs text-red-500 mt-1">No doctors found. Please contact support.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Select Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    {...register('date')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                  {errors.date && (
                    <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
                  )}
                </div>

                {/* 3. Select Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </label>
                  <select
                    {...register('time')}
                    disabled={!watchProvider || !watchDate}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Time --</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.time && (
                    <p className="text-xs text-red-500 mt-1">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* 4. Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Reason for Visit
                </label>
                <textarea
                  rows={4}
                  placeholder="Please describe your symptoms or reason for appointment..."
                  {...register('reason')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                />
                {errors.reason && (
                  <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>

                {/* Clear Draft Button (Optional but helpful) */}
                <button
                    type="button"
                    onClick={() => {
                        reset();
                        localStorage.removeItem('bookingDraft');
                        toast('Form cleared');
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-8 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    Clear Form
                </button>
              </div>

              {/* Auto-save Indicator */}
              {Object.values(formValues || {}).some(v => v) && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span>💾</span>
                  <span>Draft auto-saved</span>
                </div>
              )}

            </form>
          </div>
          
          {/* OPTIONAL: Info Section (Matches your UI style) */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">ℹ️</span> Booking Guidelines
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
              <li>Appointments must be booked at least 24 hours in advance.</li>
              <li>Please arrive 15 minutes before your scheduled time.</li>
              <li>Bring your ID and Insurance card.</li>
            </ul>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}

