// 'use client';
// import { useEffect, useState } from 'react';
// import ProtectedRoute from '@/components/ProtectedRoute';
// import { useAuth } from '@/contexts/AuthContext';
// import { Users, Calendar, Activity, Loader2 } from 'lucide-react';
// import { adminAPI } from '@/lib/api';
// import toast from 'react-hot-toast';

// export default function AdminDashboard() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<any>({});
//   const [recentUsers, setRecentUsers] = useState<any[]>([]);

//   useEffect(() => {
//     async function fetchAdminData() {
//       try {
//         const [statsRes, usersRes] = await Promise.all([
//           adminAPI.getStats(),
//           adminAPI.getUsers()
//         ]);
//         setStats(statsRes.data);
//         setRecentUsers(usersRes.data);
//       } catch (error) {
//         toast.error('Failed to load admin data');
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (user) fetchAdminData();
//   }, [user]);

//   return (
//     <ProtectedRoute requiredRole="admin">
//       <div className="min-h-screen bg-gray-50 p-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
//         {loading ? (
//            <div className="flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>
//         ) : (
//           <>
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users /></div>
//                   <div>
//                     <p className="text-sm text-gray-500">Total Users</p>
//                     <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Calendar /></div>
//                   <div>
//                     <p className="text-sm text-gray-500">Appointments</p>
//                     <p className="text-2xl font-bold text-black">{stats.appointments}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Activity /></div>
//                   <div>
//                     <p className="text-sm text-gray-500">System Status</p>
//                     <p className="text-2xl font-bold text-black">{stats.systemStatus}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Users Table */}
//             <div className="bg-white rounded-xl shadow border border-gray-200">
//               <div className="px-6 py-4 border-b">
//                 <h3 className="font-bold text-gray-900">Recent Users</h3>
//               </div>
//               <table className="w-full text-left text-sm text-gray-600">
//                 <thead className="bg-gray-50 text-xs uppercase text-gray-500">
//                   <tr>
//                     <th className="px-6 py-3">Name</th>
//                     <th className="px-6 py-3">Email</th>
//                     <th className="px-6 py-3">Role</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {recentUsers.map((u) => (
//                     <tr key={u.id}>
//                       <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
//                       <td className="px-6 py-4">{u.email}</td>
//                       <td className="px-6 py-4">{u.role.toUpperCase()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// }