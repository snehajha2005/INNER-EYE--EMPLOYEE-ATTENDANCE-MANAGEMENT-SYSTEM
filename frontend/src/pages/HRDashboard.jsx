import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { formatDate, formatTime, formatHours } from '../utils/formatters';
import { Users, CheckCircle2, AlertTriangle, Fingerprint, Clock, ArrowRight, Calendar, Coffee } from 'lucide-react';

const HRDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, attendanceRes] = await Promise.all([
        api.get('/hr/dashboard'),
        api.get('/hr/attendance')
      ]);
      setSummary(summaryRes.data);
      setRecentRecords(attendanceRes.data.slice(0, 5)); // Recent 5 records
    } catch (err) {
      setError('Failed to load HR dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Present': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      'Half Day': 'bg-amber-50 text-amber-700 border-amber-200/80',
      'Absent': 'bg-rose-50 text-rose-700 border-rose-200/80',
      'Checked In': 'bg-blue-50 text-blue-700 border-blue-200/80',
      'On Break': 'bg-amber-100 text-amber-800 border-amber-300'
    };
    const css = statusClasses[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${css}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'Present' ? 'bg-emerald-500' :
          status === 'Half Day' ? 'bg-amber-500' :
          status === 'Absent' ? 'bg-rose-500' : 'bg-blue-500'
        }`}></span>
        {status}
      </span>
    );
  };

  const getArrivalBadge = (arrivalStatus) => {
    const isLate = arrivalStatus === 'Late';
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
        isLate ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
      }`}>
        {arrivalStatus || 'On Time'}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HR Admin Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Overview of organization attendance metrics and daily logs</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/hr/employees" className="btn-secondary flex items-center gap-2">
            <Users size={16} /> Manage Employees
          </Link>
          <Link to="/hr/attendance" className="btn-primary flex items-center gap-2">
            <Calendar size={16} /> View Attendance Log
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 border border-rose-200 text-sm font-medium">
          <AlertTriangle className="shrink-0 text-rose-500" size={20} />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard 
            title="Total Employees" 
            value={summary.totalEmployees} 
            icon={<Users size={20} />} 
            colorClass="text-blue-600 bg-blue-50/80 border-blue-100"
          />
          <StatCard 
            title="Present Today" 
            value={summary.presentToday} 
            icon={<CheckCircle2 size={20} />} 
            colorClass="text-emerald-600 bg-emerald-50/80 border-emerald-100"
          />
          <StatCard 
            title="Half Days Today" 
            value={summary.halfDayToday} 
            icon={<Clock size={20} />} 
            colorClass="text-amber-600 bg-amber-50/80 border-amber-100"
          />
          <StatCard 
            title="Absent Today" 
            value={summary.absentToday} 
            icon={<AlertTriangle size={20} />} 
            colorClass="text-rose-600 bg-rose-50/80 border-rose-100"
          />
          <StatCard 
            title="Currently Checked-In" 
            value={summary.checkedInCurrently} 
            icon={<Fingerprint size={20} />} 
            colorClass="text-indigo-600 bg-indigo-50/80 border-indigo-100"
          />
          <StatCard 
            title="On Break Today" 
            value={summary.onBreakCurrently || 0} 
            icon={<Coffee size={20} />} 
            colorClass="text-amber-700 bg-amber-50/90 border-amber-200"
          />
        </div>
      )}

      {/* Recent Attendance Log Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Attendance Activity</h2>
            <p className="text-xs font-medium text-slate-400">Latest employee check-in, break & shift records</p>
          </div>
          <Link to="/hr/attendance" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Full Log <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arrival</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Break</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Hours</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                recentRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{record.employee?.name || 'N/A'}</span>
                        <span className="text-xs text-slate-400 font-medium">{record.employee?.employeeId || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getArrivalBadge(record.arrivalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatHours(record.totalBreakDuration || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                      {formatHours(record.netWorkingHours || record.workingHours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-indigo-700">
                      {formatHours(record.overtime || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700 text-right">
                      {record.leaveDeduction}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
