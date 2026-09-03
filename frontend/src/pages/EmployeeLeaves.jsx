import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { formatDate } from '../utils/formatters';
import { Calendar, AlertCircle, CheckCircle2, Clock, XCircle, Send, FileText } from 'lucide-react';

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    duration: 'Full Day',
    reason: ''
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my-leaves');
      setLeaves(res.data.leaves);
      setBalances(res.data.balanceSummary);
    } catch (err) {
      setError('Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Compute estimated requested days for form preview
  const getEstimatedDays = () => {
    if (formData.duration === 'Half Day') return 0.5;
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      setError('End date cannot be earlier than start date');
      return;
    }

    const requestedDays = getEstimatedDays();
    const selectedBalance = balances?.balances?.[formData.leaveType];

    if (selectedBalance && requestedDays > selectedBalance.remaining) {
      setError(`Insufficient ${formData.leaveType} balance. You have ${selectedBalance.remaining} day(s) remaining, but requested ${requestedDays} day(s).`);
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/leaves', formData);
      setSuccess('Leave request submitted successfully!');
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        duration: 'Full Day',
        reason: ''
      });
      fetchMyLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200/80',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-200/80'
    };
    const css = statusClasses[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${css}`}>
        {status === 'Approved' && <CheckCircle2 size={12} className="text-emerald-600" />}
        {status === 'Pending' && <Clock size={12} className="text-amber-600" />}
        {status === 'Rejected' && <XCircle size={12} className="text-rose-600" />}
        {status}
      </span>
    );
  };

  if (loading) return <Loader />;

  const casual = balances?.balances?.['Casual Leave'] || { total: 12, used: 0, remaining: 12, lop: 0 };
  const sick = balances?.balances?.['Sick Leave'] || { total: 10, used: 0, remaining: 10, lop: 0 };
  const paid = balances?.balances?.['Paid Leave'] || { total: 15, used: 0, remaining: 15, lop: 0 };
  const totalLop = balances?.totalLopDays || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Submit leave applications, track your leave balances, and view approval status</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 border border-rose-200 text-sm font-medium">
          <AlertCircle className="shrink-0 text-rose-500" size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center space-x-3 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Leave Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Your Leave Quotas & Balances</h2>
          <span className="text-xs font-medium text-slate-500">Calculated from approved requests</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Casual Leave */}
          <div className="card p-5 bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Casual Leave</span>
              <span className="text-xs text-slate-400 font-medium">Quota: {casual.total}d</span>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <p className="text-2xl font-black text-slate-900">{casual.remaining}</p>
                <p className="text-[11px] font-medium text-slate-500">Remaining Days</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{casual.used}d</p>
                <p className="text-[11px] font-medium text-slate-400">Used</p>
              </div>
            </div>
          </div>

          {/* Sick Leave */}
          <div className="card p-5 bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Sick Leave</span>
              <span className="text-xs text-slate-400 font-medium">Quota: {sick.total}d</span>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <p className="text-2xl font-black text-slate-900">{sick.remaining}</p>
                <p className="text-[11px] font-medium text-slate-500">Remaining Days</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{sick.used}d</p>
                <p className="text-[11px] font-medium text-slate-400">Used</p>
              </div>
            </div>
          </div>

          {/* Paid Leave */}
          <div className="card p-5 bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">Paid Leave</span>
              <span className="text-xs text-slate-400 font-medium">Quota: {paid.total}d</span>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <p className="text-2xl font-black text-slate-900">{paid.remaining}</p>
                <p className="text-[11px] font-medium text-slate-500">Remaining Days</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{paid.used}d</p>
                <p className="text-[11px] font-medium text-slate-400">Used</p>
              </div>
            </div>
          </div>

          {/* Loss of Pay (LOP) */}
          <div className="card p-5 bg-rose-50/40 border border-rose-200/80 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md border border-rose-200">Loss of Pay (LOP)</span>
              <AlertCircle size={16} className="text-rose-500" />
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <p className="text-2xl font-black text-rose-700">{totalLop}</p>
                <p className="text-[11px] font-medium text-rose-600">Excess Unpaid Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Leave Request Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 h-full flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send size={18} className="text-blue-600" />
                Submit Leave Application
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Apply for upcoming time off</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Casual Leave">Casual Leave (12d max)</option>
                  <option value="Sick Leave">Sick Leave (10d max)</option>
                  <option value="Paid Leave">Paid Leave (15d max)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day (0.5 Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Leave
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="State the reason for your leave request..."
                  required
                  className="input-field py-2"
                ></textarea>
              </div>

              {/* Estimated Days Calculation Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Requested Duration:</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {getEstimatedDays()} {getEstimatedDays() === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 font-bold text-sm shadow-md shadow-blue-500/20"
              >
                {submitting ? 'Submitting...' : 'SUBMIT LEAVE REQUEST'}
              </button>
            </form>
          </div>
        </div>

        {/* My Leave Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Leave History</h2>
            <span className="text-xs font-medium text-slate-500">Track application status</span>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Days</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">HR Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                        {l.leaveType}
                        <div className="text-[10px] text-slate-400 font-normal">{l.duration}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                        {formatDate(l.startDate)} {l.startDate !== l.endDate ? `to ${formatDate(l.endDate)}` : ''}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                        {l.numberOfDays} {l.numberOfDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">
                        {l.reason}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(l.status)}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500 max-w-xs italic">
                        {l.hrComment || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaves;
