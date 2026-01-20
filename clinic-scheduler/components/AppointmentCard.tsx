'use client';

import { Calendar, Clock, Eye } from 'lucide-react';

interface AppointmentCardProps {
  appointment: any;
  onClick?: (appointment: any) => void;
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  
  // Early return if no appointment data
  if (!appointment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="text-red-600 text-sm">Error: No appointment data</p>
      </div>
    );
  }

  const statusColors = {
    booked: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  // Enhanced formatDate to handle any date format
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'No date';
    
    try {
      let date: Date;
      
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Safely extract all properties
  const date = appointment?.date;
  const time = appointment?.time || 'No time';
  const status = appointment?.status || 'unknown';
  const displayName = appointment?.providerName || appointment?.patientName || 'Unknown';
  const reason = appointment?.reason || 'No reason provided';

  return (
    <div 
      onClick={() => onClick?.(appointment)}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md group' : ''
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <div className={`p-2 bg-blue-50 text-blue-600 rounded-lg transition-colors ${onClick ? 'group-hover:bg-blue-100' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p>{formatDate(date)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-normal">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Body */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {displayName}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {reason}
        </p>
      </div>

      {/* Footer */}
      {onClick && (
        <div className="mt-4 flex justify-end">
          <span className="text-sm text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <Eye className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  );
}