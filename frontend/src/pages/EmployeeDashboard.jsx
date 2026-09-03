import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { formatDate, formatTime, formatHours, formatTimer } from '../utils/formatters';
import { CheckCircle2, Clock, Calendar, AlertTriangle, Fingerprint, Coffee, Play, Zap, CalendarRange, History, ArrowRight } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Live Timer states
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  const currentTime = new Date();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, summaryRes, leavesRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/summary'),
        api.get('/leaves/my-leaves'),
        api.get('/attendance/history')
      ]);
      setTodayAttendance(todayRes.data);
      setSummary(summaryRes.data);
      setLeaveBalances(leavesRes.data.balanceSummary);
      setRecentHistory(historyRes.data.slice(0, 5)); // Latest 5 records
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect for active shift & break
  useEffect(() => {
    if (!todayAttendance || todayAttendance.checkOut || !todayAttendance.checkIn) {
      setShiftSeconds(0);
      setBreakSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const inTime = new Date(todayAttendance.checkIn);
      const grossSecs = Math.max(0, Math.floor((now - inTime) / 1000));

      let completedBreakSecs = 0;
      let activeBreakSecs = 0;

      if (Array.isArray(todayAttendance.breaks)) {
        todayAttendance.breaks.forEach(b => {
          if (b.startTime) {
            const bStart = new Date(b.startTime);
            if (b.endTime) {
              const bEnd = new Date(b.endTime);
              completedBreakSecs += Math.max(0, Math.floor((bEnd - bStart) / 1000));
            } else {
              activeBreakSecs = Math.max(0, Math.floor((now - bStart) / 1000));
            }
          }
        });
      }

      setBreakSeconds(activeBreakSecs);

      // Net shift timer = Gross seconds - (completed break seconds + active break seconds)
      const netSecs = Math.max(0, grossSecs - completedBreakSecs - activeBreakSecs);
      setShiftSeconds(netSecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.post('/attendance/check-in');
      setTodayAttendance(res.data);
      const summaryRes = await api.get('/attendance/summary');
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.post('/attendance/start-break');
      setTodayAttendance(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start break');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeWork = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.put('/attendance/resume-work');
      setTodayAttendance(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resume work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.put('/attendance/check-out');
      setTodayAttendance(res.data);
      const summaryRes = await api.get('/attendance/summary');
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Determine current session state
  const sessionState = todayAttendance?.sessionState || (todayAttendance?.checkOut ? 'Completed' : (todayAttendance ? 'Checked In' : 'Not Checked In'));
  const isCheckedInWorking = todayAttendance && !todayAttendance.checkOut && sessionState === 'Checked In';
  const isOnBreak = todayAttendance && !todayAttendance.checkOut && sessionState === 'On Break';
  const isCheckedOut = todayAttendance && todayAttendance.checkOut;
  const notCheckedIn = !todayAttendance;

  // Calculate total remaining leave balance
  const totalRemainingLeave = (leaveBalances?.balances?.['Casual Leave']?.remaining || 0) +
    (leaveBalances?.balances?.['Sick Leave']?.remaining || 0) +
    (leaveBalances?.balances?.['Paid Leave']?.remaining || 0);

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
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Present' ? 'bg-emerald-500' :
          status === 'Half Day' ? 'bg-amber-500' :
            status === 'Absent' ? 'bg-rose-500' : 'bg-blue-500'
          }`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name}! 👋</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl px-4 py-2 flex items-center gap-2 self-start sm:self-auto">
          <span className={`w-2 h-2 rounded-full ${isOnBreak ? 'bg-amber-500 animate-pulse' : (todayAttendance && !isCheckedOut ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')}`}></span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {isOnBreak ? 'On Break' : (todayAttendance && !isCheckedOut ? 'Shift Active' : (isCheckedOut ? 'Shift Completed' : 'Offline'))}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 border border-rose-200 shadow-2xs text-sm font-medium">
          <AlertTriangle className="shrink-0 text-rose-500" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <StatCard
            title="Today's Status"
            value={isOnBreak ? 'On Break' : (isCheckedOut ? 'Completed' : (todayAttendance ? 'Checked In' : 'Not Checked In'))}
            icon={<Fingerprint size={20} />}
            colorClass="text-blue-600 bg-blue-50/80 border-blue-100"
          />
        </div>

        <StatCard
          title="Today's Net Hours"
          value={formatHours(todayAttendance?.netWorkingHours || todayAttendance?.workingHours || 0)}
          icon={<Zap size={20} />}
          colorClass="text-emerald-600 bg-emerald-50/80 border-emerald-100"
        />

        <StatCard
          title="Present Days"
          value={summary?.presentDays || 0}
          icon={<CheckCircle2 size={20} />}
          colorClass="text-emerald-700 bg-emerald-50/80 border-emerald-200"
        />

        <StatCard
          title="Late Arrivals"
          value={summary?.lateArrivalsCount || 0}
          icon={<Clock size={20} />}
          colorClass="text-amber-600 bg-amber-50/80 border-amber-100"
        />

        <StatCard
          title="Half Days"
          value={summary?.halfDays || 0}
          icon={<Clock size={20} />}
          colorClass="text-indigo-600 bg-indigo-50/80 border-indigo-100"
        />

        <StatCard
          title="Remaining Leaves"
          value={`${totalRemainingLeave} Days`}
          icon={<CalendarRange size={20} />}
          colorClass="text-purple-600 bg-purple-50/80 border-purple-100"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Action & Shift Terminal */}
        <div className="lg:col-span-1">
          <div className="card p-6 h-full flex flex-col justify-between items-center text-center relative">
            <div className="w-full text-left border-b border-slate-100 pb-3 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Today's Shift Terminal</h2>
              {todayAttendance && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${todayAttendance.arrivalStatus === 'Late'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                  {todayAttendance.arrivalStatus || 'On Time'}
                </span>
              )}
            </div>

            <div className="my-6 flex flex-col items-center w-full">
              <div className={`border rounded-2xl p-5 mb-4 shadow-2xs ${isOnBreak ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50/90 text-blue-600 border-blue-100'
                }`}>
                {isOnBreak ? <Coffee size={44} /> : <Fingerprint size={44} />}
              </div>

              {/* Real-time active shift timer */}
              {todayAttendance && !isCheckedOut ? (
                <div className="w-full bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {isOnBreak ? 'Break Elapsed' : 'Active Net Working Time'}
                  </span>
                  <div className="text-3xl font-mono font-black tracking-wider text-emerald-400 mt-1">
                    {isOnBreak ? formatTimer(breakSeconds) : formatTimer(shiftSeconds)}
                  </div>
                  {isOnBreak && (
                    <div className="text-xs font-semibold text-amber-300 mt-1">
                      Shift Paused at {formatTimer(shiftSeconds)}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">System Local Time</p>
                </>
              )}
            </div>

            {/* Shift Controls */}
            <div className="w-full space-y-3">
              {notCheckedIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full btn-primary py-3.5 text-base font-bold shadow-lg shadow-blue-500/20"
                >
                  {actionLoading ? 'Processing...' : 'CHECK IN'}
                </button>
              )}

              {isCheckedInWorking && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 bg-slate-50 py-2 px-3 rounded-xl border border-slate-200/60 flex justify-between">
                    <span>Checked in at</span>
                    <span className="text-slate-900 font-bold">{formatTime(todayAttendance.checkIn)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleStartBreak}
                      disabled={actionLoading}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Coffee size={17} />
                      <span>START BREAK</span>
                    </button>
                    <button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="w-full btn-danger py-3 text-sm font-bold shadow-sm"
                    >
                      CHECK OUT
                    </button>
                  </div>
                </div>
              )}

              {isOnBreak && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 py-2 px-3 rounded-xl border border-amber-200 flex justify-between">
                    <span>Current Status</span>
                    <span className="font-extrabold uppercase">On Break</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleResumeWork}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Play size={17} />
                      <span>RESUME WORK</span>
                    </button>
                    <button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="w-full btn-danger py-3 text-sm font-bold shadow-sm"
                    >
                      CHECK OUT
                    </button>
                  </div>
                </div>
              )}

              {isCheckedOut && (
                <div className="bg-emerald-50/80 text-emerald-800 p-4 rounded-xl border border-emerald-200/80 w-full shadow-2xs">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle2 size={22} className="text-emerald-600" />
                    <span className="font-extrabold text-sm tracking-wide">SHIFT COMPLETED</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-700 grid grid-cols-2 gap-2 mt-3 bg-white/60 p-2.5 rounded-lg border border-emerald-100 text-left">
                    <div>Gross: <span className="font-bold text-slate-900">{formatHours(todayAttendance.grossWorkingHours || todayAttendance.workingHours)}</span></div>
                    <div>Break: <span className="font-bold text-slate-900">{formatHours(todayAttendance.totalBreakDuration)}</span></div>
                    <div>Net: <span className="font-bold text-emerald-900">{formatHours(todayAttendance.netWorkingHours || todayAttendance.workingHours)}</span></div>
                    <div>Overtime: <span className="font-bold text-indigo-700">{formatHours(todayAttendance.overtime)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Status Details & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Status Section */}
          <div className="card p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Attendance Status</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time daily record breakdown</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {todayAttendance?.status || (todayAttendance ? 'Active' : 'Not Checked In')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-medium">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Arrival Status</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {todayAttendance?.arrivalStatus || 'On Time'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Check-In Time</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {formatTime(todayAttendance?.checkIn)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Check-Out Time</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {formatTime(todayAttendance?.checkOut)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Break Duration</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {formatHours(todayAttendance?.totalBreakDuration || 0)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Net Working Hours</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  {formatHours(todayAttendance?.netWorkingHours || todayAttendance?.workingHours || 0)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Overtime</span>
                <span className="text-sm font-bold text-indigo-700 mt-0.5 block">
                  {formatHours(todayAttendance?.overtime || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="card p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Quick Navigation & Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/employee/leaves"
                className="flex flex-col items-center justify-center p-3.5 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 rounded-xl border border-blue-100 font-bold text-xs transition-all gap-1.5 text-center shadow-2xs"
              >
                <CalendarRange size={20} />
                <span>Apply for Leave</span>
              </Link>
              <Link
                to="/employee/history"
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 font-bold text-xs transition-all gap-1.5 text-center shadow-2xs"
              >
                <History size={20} />
                <span>View Full History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Attendance Records</h2>
            <p className="text-xs font-medium text-slate-400">Preview of your latest check-ins & shifts</p>
          </div>
          <Link to="/employee/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Complete History <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arrival</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Break Duration</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Hours</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                    No attendance records found yet.
                  </td>
                </tr>
              ) : (
                recentHistory.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${record.arrivalStatus === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        }`}>
                        {record.arrivalStatus || 'On Time'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatHours(record.totalBreakDuration || 0)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                      {formatHours(record.netWorkingHours || record.workingHours)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-indigo-700">
                      {formatHours(record.overtime || 0)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
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

export default EmployeeDashboard;
