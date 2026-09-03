import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { formatDate } from '../utils/formatters';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare, Search, Filter } from 'lucide-react';

const HRLeaves = () => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All Types');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Confirmation Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Approved' or 'Rejected'
  const [hrComment, setHrComment] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/hr/all');
      setRequests(res.data.requests);
      setSummary(res.data.summary);
    } catch (err) {
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (req, type) => {
    if (req.status !== 'Pending') {
      setError('This leave request has already been processed.');
      return;
    }
    setSelectedRequest(req);
    setActionType(type);
    setHrComment('');
    setError('');
    setSuccess('');
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(true);
      setError('');

      await api.put(`/leaves/hr/${selectedRequest._id}/status`, {
        status: actionType,
        hrComment
      });

      setSuccess(`Leave request ${actionType.toLowerCase()} successfully!`);
      setSelectedRequest(null);
      setActionType('');
      setHrComment('');
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredRequests = requests.filter(r => {
    // Status Filter
    if (filterStatus !== 'All' && r.status !== filterStatus) {
      return false;
    }

    // Leave Type Filter
    if (filterType !== 'All Types' && r.leaveType !== filterType) {
      return false;
    }

    // Search Term Filter (Name or Employee ID)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const empName = r.employee?.name?.toLowerCase() || '';
      const empId = r.employee?.employeeId?.toLowerCase() || '';
      if (!empName.includes(term) && !empId.includes(term)) {
        return false;
      }
    }

    return true;
  });

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HR Leave Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Review, approve, or reject organization leave applications dynamically</p>
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

      {/* HR Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Pending Requests" 
            value={summary.pendingRequests} 
            icon={<Clock size={20} />} 
            colorClass="text-amber-600 bg-amber-50/80 border-amber-100"
          />
          <StatCard 
            title="Approved Requests" 
            value={summary.approvedRequests} 
            icon={<CheckCircle2 size={20} />} 
            colorClass="text-emerald-600 bg-emerald-50/80 border-emerald-100"
          />
          <StatCard 
            title="Rejected Requests" 
            value={summary.rejectedRequests} 
            icon={<XCircle size={20} />} 
            colorClass="text-rose-600 bg-rose-50/80 border-rose-100"
          />
          <StatCard 
            title="Total Requests" 
            value={summary.totalRequests} 
            icon={<FileText size={20} />} 
            colorClass="text-blue-600 bg-blue-50/80 border-blue-100"
          />
        </div>
      )}

      {/* Controls: Search Bar & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Employee Leave Applications</h2>
            <p className="text-xs font-medium text-slate-400">All submitted employee leave requests</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={17} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search name or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Leave Type Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field sm:w-44"
            >
              <option value="All Types">All Leave Types</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Paid Leave">Paid Leave</option>
            </select>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
              {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === status 
                      ? 'bg-white text-slate-900 shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Requested Days</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">HR Comment</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                    No leave requests found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {r.employee?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">
                        {r.employee?.employeeId || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                      {r.leaveType}
                      <div className="text-[10px] text-slate-400 font-normal">{r.duration}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                      {formatDate(r.startDate)} {r.startDate !== r.endDate ? `to ${formatDate(r.endDate)}` : ''}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                      {r.numberOfDays} {r.numberOfDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">
                      {r.reason}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500 max-w-xs italic">
                      {r.hrComment ? `"${r.hrComment}"` : '-'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {r.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenActionModal(r, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(r, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                Confirm {actionType} Leave
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5 border border-slate-200/60">
              <p><span className="font-bold text-slate-700">Employee:</span> {selectedRequest.employee?.name} ({selectedRequest.employee?.employeeId})</p>
              <p><span className="font-bold text-slate-700">Leave Type:</span> {selectedRequest.leaveType}</p>
              <p><span className="font-bold text-slate-700">Requested Days:</span> {selectedRequest.numberOfDays} {selectedRequest.numberOfDays === 1 ? 'day' : 'days'}</p>
              <p><span className="font-bold text-slate-700">Dates:</span> {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}</p>
              <p><span className="font-bold text-slate-700">Reason:</span> {selectedRequest.reason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                HR Review Comment {actionType === 'Rejected' ? '(Recommended)' : '(Optional)'}
              </label>
              <textarea
                rows="3"
                value={hrComment}
                onChange={(e) => setHrComment(e.target.value)}
                placeholder="Add notes or feedback for the employee..."
                className="input-field py-2 text-xs"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn-secondary py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`py-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                  actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRLeaves;
