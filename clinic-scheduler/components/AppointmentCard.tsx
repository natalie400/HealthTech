import { Appointment } from '@/lib/types';
import { Calendar, Clock, Eye } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  
  const statusColors = {
    booked: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div 
      onClick={() => onClick(appointment)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p>{new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-normal">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
          {appointment.status.toUpperCase()}
        </span>
      </div>

      {/* Body */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {appointment.providerName || appointment.patientName}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {appointment.reason}
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <span className="text-sm text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View Details <Eye className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}