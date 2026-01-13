'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    // CHANGED: bg-blue-600 -> bg-teal-600
    <nav className="bg-teal-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Clinic Scheduler
          </Link>
          
          {user ? (
            <>
              <div className="flex gap-6">
                {/* CHANGED: hover:text-blue-200 -> hover:text-teal-200 */}
                <Link href="/dashboard" className="hover:text-teal-200 transition-colors">
                  Dashboard
                </Link>
                <Link href="/appointments" className="hover:text-teal-200 transition-colors">
                  Appointments
                </Link>
                <Link href="/book-appointment" className="hover:text-teal-200 transition-colors">
                  Book
                </Link>
                
                {user.role === 'provider' && (
                  <Link href="/provider/schedule" className="hover:text-teal-200 transition-colors">
                    My Schedule
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  {/* CHANGED: text-blue-200 -> text-teal-200 */}
                  <div className="text-teal-200 text-xs capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  // CHANGED: bg-blue-700 -> bg-teal-700
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              href="/login"
              // CHANGED: bg-blue-700 -> bg-teal-700
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 rounded-lg text-sm font-medium transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}