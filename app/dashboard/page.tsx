import AppointmentCard from '@/components/AppointmentCard';
import { getAppointmentsByPatient } from '@/lib/mockData';

export default function Dashboard() {
  // Get appointments for patient ID 1 (John Doe)
  const appointments = getAppointmentsByPatient(1);
  
  // Split into upcoming and past
  const today = new Date().toISOString().split('T')[0]; // Gets today's date as "YYYY-MM-DD"
  
  const upcomingAppointments = appointments.filter(apt => apt.date >= today && apt.status === 'booked');
  const pastAppointments = appointments.filter(apt => apt.date < today || apt.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>
        
        {/* Upcoming Appointments */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Upcoming Appointments
          </h2>
          
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-6 rounded-lg">
              No upcoming appointments
            </p>
          )}
        </section>

        {/* Past Appointments */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Past Appointments
          </h2>
          
          {pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-6 rounded-lg">
              No past appointments
            </p>
          )}
        </section>
      </div>
    </div>
  );
}