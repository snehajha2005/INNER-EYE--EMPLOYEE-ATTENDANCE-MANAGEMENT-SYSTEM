import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { formatDate, formatTime, formatHours } from '../utils/formatters';
import { Calendar, Filter, X, BarChart2, AlertCircle } from 'lucide-react';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Filter State ---
  const [filterDate, setFilterDate] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/history');
      setHistory(res.data);
    } catch (err) {
      setError('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered Records ---
  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      const recordDate = record.date; // YYYY-MM-DD string

      // Date range filter
      if (filterDate && recordDate < filterDate) return false;
      if (filterDateEnd && recordDate > filterDateEnd) return false;

      // Month filter (YYYY-MM)
      if (filterMonth && !recordDate.startsWith(filterMonth)) return false;

      // Status filter
      if (filterStatus !== 'All' && record.status !== filterStatus) return false;

      return true;
    });
  }, [history, filterDate, filterDateEnd, filterMonth, filterStatus]);

  // --- Monthly Summary (based on filtered records only) ---
  const summary = useMemo(() => {
    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let lateArrivals = 0;
    let totalNetHours = 0;
    let totalOvertime = 0;

    filteredHistory.forEach(record => {
      if (record.status === 'Present') presentDays++;
      if (record.status === 'Half Day') halfDays++;
      if (record.status === 'Absent') absentDays++;
      if (record.arrivalStatus === 'Late') lateArrivals++;
      totalNetHours += record.netWorkingHours || record.workingHours || 0;
      totalOvertime += record.overtime || 0;
    });

    return { presentDays, halfDays, absentDays, lateArrivals, totalNetHours, totalOvertime };
  }, [filteredHistory]);

  const hasActiveFilters = filterDate || filterDateEnd || filterMonth || filterStatus !== 'All';

  const clearFilters = () => {
    setFilterDate('');
    setFilterDateEnd('');
    setFilterMonth('');
    setFilterStatus('All');
  };

  // --- Build month options from existing data ---
  const monthOptions = useMemo(() => {
    const monthSet = new Set();
    history.forEach(r => {
      if (r.date) {
        monthSet.add(r.date.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [history]);

  // --- Status Badge ---
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance History</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">View your complete personal check-in, break, and checkout history</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-3 py-1.5 rounded-lg transition-all"
            >
              <X size={13} />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">From Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={14} className="text-slate-400" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">To Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={14} className="text-slate-400" />
              </div>
              <input
                type="date"
                value={filterDateEnd}
                onChange={e => setFilterDateEnd(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Month</label>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="input-field"
            >
              <option value="">All Months</option>
              {monthOptions.map(m => {
                const [year, month] = m.split('-');
                const label = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
              <option value="Checked In">Checked In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Summary Strip */}
      {filteredHistory.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-700">Summary for Selected Period</h2>
            <span className="text-xs text-slate-400 font-medium ml-auto">{filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-emerald-700">{summary.presentDays}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Present</p>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-amber-700">{summary.halfDays}</p>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Half Days</p>
            </div>
            <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-rose-700">{summary.absentDays}</p>
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-0.5">Absent</p>
            </div>
            <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-orange-700">{summary.lateArrivals}</p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-0.5">Late Arrivals</p>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-blue-700">{formatHours(summary.totalNetHours)}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Net Hours</p>
            </div>
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-indigo-700">{formatHours(summary.totalOvertime)}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Overtime</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arrival</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Break Duration</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Hours</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Hours</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Leave Deduction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar size={32} className="text-slate-300" />
                    <p className="text-slate-500 text-sm font-semibold">No attendance records found for the selected period.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear filters to view all records
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredHistory.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-900">
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
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                    {formatHours(record.grossWorkingHours || 0)}
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
  );
};

export default AttendanceHistory;
