'use client';
import { useEffect } from 'react';
import { useAuth }from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home(){
  const { user } = useAuth();
  const router = useRouter();

  // Redirects if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Clinic Appointment
            <span className="text-blue-600"> Scheduler</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book and manage your medical appointments with ease. 
            Connect with healthcare providers in just a few clicks.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Booking
            </h3>
            <p className="text-gray-600">
              Schedule appointments with your preferred healthcare provider in seconds
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Reminders
            </h3>
            <p className="text-gray-600">
              Never miss an appointment with automated notifications and reminders
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track History
            </h3>
            <p className="text-gray-600">
              View your complete appointment history and manage upcoming visits
            </p>
          </div>
        </div>
      </div>
    </main>

  );
}