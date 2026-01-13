'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProviders, availableTimeSlots, isSlotAvailable } from '@/lib/mockData';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useRef } from 'react';

// Zod schema - defines validation rules
const bookingSchema = z.object({
  providerId: z.string().min(1, 'Please select a provider'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be less than 200 characters'),
});

// TypeScript type derived from Zod schema
type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookAppointment() {
  const providers = getProviders();
  const { toast, showToast, hideToast } = useToast();

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Watch form values for dynamic filtering
  const watchProvider = watch('providerId');
  const watchDate = watch('date');

  // Filter available time slots based on selections
  const filteredTimeSlots = availableTimeSlots.filter(time => {
    if (!watchProvider || !watchDate) return true;
    return isSlotAvailable(parseInt(watchProvider), watchDate, time);
  });

  // Load saved draft from localStorage on mount (only once)
  const hasLoadedDraft = useRef(false);
  useEffect(() => {
    if (hasLoadedDraft.current) return;
    hasLoadedDraft.current = true;
    const savedDraft = localStorage.getItem('bookingDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        reset(draft);
        showToast('Draft loaded from previous session', 'info');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [reset, showToast]);

  // Save draft to localStorage
  const formValues = watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formValues && Object.values(formValues).some(v => v)) {
        localStorage.setItem('bookingDraft', JSON.stringify(formValues));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formValues]);

  // Form submission handler
  const onSubmit = async (data: BookingFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Booking data:', data);
      
      // Clear saved draft
      localStorage.removeItem('bookingDraft');
      
      // Show success toast
      showToast('Appointment booked successfully!', 'success');
      
      // Clear form
      reset();
      
    } catch (error) {
      showToast('Failed to book appointment. Please try again.', 'error');
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get maximum date (3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Book an Appointment
            </h1>
            <p className="text-base text-gray-800 font-medium">
              Schedule your appointment with a healthcare provider
            </p>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Provider Selection */}
              <div>
                <label htmlFor="providerId" className="block text-sm font-bold text-gray-900 mb-2">
                  Select Provider *
                </label>
                <select
                  id="providerId"
                  {...register('providerId')}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-semibold transition-colors"
                >
                  <option value="">Choose a doctor...</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {errors.providerId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.providerId.message}
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-gray-900 mb-2">
                  Select Date *
                </label>
                <input
                  id="date"
                  type="date"
                  min={today}
                  max={maxDateStr}
                  {...register('date')}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-semibold transition-colors"
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.date.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Appointments can be scheduled up to 3 months in advance
                </p>
              </div>

              {/* Time Selection */}
              <div>
                <label htmlFor="time" className="block text-sm font-bold text-gray-900 mb-2">
                  Select Time *
                </label>
                <select
                  id="time"
                  {...register('time')}
                  disabled={!watchProvider || !watchDate}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Choose a time...</option>
                  {filteredTimeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {!watchProvider || !watchDate ? (
                  <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                    <span>ℹ️</span>
                    Please select a provider and date first
                  </p>
                ) : filteredTimeSlots.length === 0 ? (
                  <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
                    <span>⚠️</span>
                    No available slots for this date
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <span>✓</span>
                    {filteredTimeSlots.length} slot{filteredTimeSlots.length !== 1 ? 's' : ''} available
                  </p>
                )}
                {errors.time && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.time.message}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-bold text-gray-900 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  placeholder="e.g., Annual checkup, follow-up visit, consultation..."
                  {...register('reason')}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-semibold resize-none transition-colors"
                />
                {errors.reason && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.reason.message}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-800 font-medium">
                    Be specific to help your provider prepare
                  </p>
                  <p className={`text-sm font-bold ${
                    (watch('reason')?.length || 0) > 180 
                      ? 'text-yellow-600' 
                      : 'text-gray-800'
                  }`}>
                    {watch('reason')?.length || 0} / 200
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Booking...
                    </span>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    localStorage.removeItem('bookingDraft');
                    showToast('Form cleared', 'info');
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Clear Form
                </button>
              </div>

              {/* Auto-save Indicator */}
              {Object.values(formValues || {}).some(v => v) && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                  <span>💾</span>
                  <span>Draft auto-saved</span>
                </div>
              )}
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 text-lg">Booking Guidelines</h3>
                <ul className="space-y-2 text-sm text-blue-900 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Appointments can be scheduled up to 3 months in advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Please arrive 10 minutes before your scheduled time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Cancellations must be made at least 24 hours in advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Bring your insurance card and ID to your appointment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Your form is automatically saved as you type</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Need Help?</h3>
                <p className="text-sm text-gray-900 mb-3 font-medium">
                  If you're having trouble booking an appointment or need assistance, please contact our support team.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="tel:+1234567890"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span>📞</span>
                    Call: (123) 456-7890
                  </a>
                  <a
                    href="mailto:support@clinic.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span>✉️</span>
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
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