'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { patientAPI } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Plus, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Data State - Initialize as empty arrays to prevent "filter of undefined" errors
  const [metrics, setMetrics] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  
  // Form State
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'symptom' });

  // 1. Fetch Data on Load
  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, notesRes] = await Promise.all([
          patientAPI.getMetrics(),
          patientAPI.getNotes()
        ]);

        // ✅ FIX: Removed the extra .data because we are using Fetch now
        setMetrics(metricsRes.data || []); 
        setNotes(notesRes.data || []);

      } catch (error) {
        console.error(error);
        toast.error('Failed to load health data');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  // 2. Handle Form Submit
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await patientAPI.addNote(newNote);
      // ✅ FIX: Handle the response structure for the new note too
      const createdNote = res.data || res; 
      setNotes([createdNote, ...notes]);
      
      setNewNote({ title: '', content: '', category: 'symptom' });
      setShowNoteForm(false);
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  // Helper: Prepare Chart Data (Safety check added: (metrics || []))
  const heartRateData = (metrics || [])
    .filter((m: any) => m.type === 'Heart Rate')
    .map((m: any) => ({
      date: new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseInt(m.value),
    }));

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
           
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Health Portal</h1>
            <p className="text-slate-500">Welcome back, {user?.name}</p>
          </div>

          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
              {/* LEFT COLUMN: Vitals Chart */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Heart Rate History</h2>
                  </div>
                  
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={heartRateData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#EF4444" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                 {/* Recent Metrics List */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Vitals Log</h3>
                    <div className="space-y-3">
                      {(metrics || []).slice(0, 3).map((m: any) => (
                        <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="font-medium text-slate-700">{m.type}</span>
                          <span className="font-bold text-slate-900">{m.value} <span className="text-sm font-normal text-slate-500">{m.unit}</span></span>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN: Notes & Feedback */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-slate-900">My Notes</h2>
                  <button 
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="flex items-center gap-2 text-lg bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <Plus className="w-5 h-5" /> Add Note
                  </button>
                </div>

                {/* Add Note Form */}
                {showNoteForm && (
                  <form onSubmit={handleSubmitNote} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-5">
                      <input 
                        type="text" 
                        placeholder="Title (e.g., Morning Headache)" 
                        className="w-full p-3 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
                        value={newNote.title}
                        onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                        required
                      />
                      <select 
                        className="w-full p-3 text-lg border border-slate-200 rounded-lg outline-none bg-white text-slate-900"
                        value={newNote.category}
                        onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                      >
                        <option value="symptom">Symptom</option>
                        <option value="feedback">Clinic Feedback</option>
                        <option value="question">Question for Doctor</option>
                      </select>
                      <textarea 
                        placeholder="Describe how you feel..." 
                        rows={3}
                        className="w-full p-3 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white text-slate-900 placeholder:text-slate-400"
                        value={newNote.content}
                        onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                        required
                      />
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 text-lg font-medium rounded-lg hover:bg-black transition-colors">
                        <Save className="w-5 h-5" /> Save Note
                      </button>
                    </div>
                  </form>
                )}

                {/* Notes List */}
                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                  {(notes || []).length === 0 ? (
                    <p className="text-slate-400 text-center text-lg py-8">No notes recorded yet.</p>
                  ) : (
                    notes.map((note: any) => (
                      <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-3 py-1 rounded text-sm font-bold uppercase tracking-wide ${
                            note.category === 'symptom' ? 'bg-orange-50 text-orange-600' : 
                            note.category === 'feedback' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {note.category}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{note.title}</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}