import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { formatDate, formatTime, formatHours } from '../utils/formatters';
import { Search, Download, Filter, X, BarChart2, Calendar, AlertCircle } from 'lucide-react';

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/attendance');
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique employees dynamically from records
  const uniqueEmployees = useMemo(() => {
    const map = new Map();
    records.forEach(rec => {
      if (rec.employee && rec.employee._id) {
        map.set(rec.employee._id.toString(), {
          id: rec.employee._id.toString(),
          name: rec.employee.name,
          employeeId: rec.employee.employeeId
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  // Combined Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Search Term (Name or Employee ID)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const empName = rec.employee?.name?.toLowerCase() || '';
        const empId = rec.employee?.employeeId?.toLowerCase() || '';
        if (!empName.includes(term) && !empId.includes(term)) {
          return false;
        }
      }

      // From Date Filter
      if (fromDate && rec.date < fromDate) {
        return false;
      }

      // To Date Filter
      if (toDate && rec.date > toDate) {
        return false;
      }

      // Employee Filter
      if (employeeFilter !== 'All') {
        const empIdStr = rec.employee?._id?.toString() || rec.employee?.employeeId;
        if (empIdStr !== employeeFilter) {
          return false;
        }
      }

      // Status / Condition Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Late') {
          if (rec.arrivalStatus !== 'Late') return false;
        } else if (statusFilter === 'Under Hours') {
          if (rec.complianceStatus !== 'Under-Hours') return false;
        } else {
          if (rec.status !== statusFilter) return false;
        }
      }

      return true;
    });
  }, [records, searchTerm, fromDate, toDate, employeeFilter, statusFilter]);

  // Summary Metrics calculated dynamically from filtered records
  const summary = useMemo(() => {
    let total = filteredRecords.length;
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let underHours = 0;

    filteredRecords.forEach(rec => {
      if (rec.status === 'Present') present++;
      if (rec.arrivalStatus === 'Late') late++;
      if (rec.status === 'Half Day') halfDay++;
      if (rec.status === 'Absent') absent++;
      if (rec.complianceStatus === 'Under-Hours') underHours++;
    });

    return { total, present, late, halfDay, absent, underHours };
  }, [filteredRecords]);

  const hasActiveFilters = searchTerm || fromDate || toDate || employeeFilter !== 'All' || statusFilter !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setEmployeeFilter('All');
    setStatusFilter('All');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Employee Name',
      'Employee ID',
      'Date',
      'Arrival Status',
      'Check In',
      'Check Out',
      'Break Duration',
      'Gross Hours',
      'Net Hours',
      'Overtime',
      'Attendance Status',
      'Compliance Status'
    ];

    const rows = filteredRecords.map(rec => [
      `"${rec.employee?.name || 'N/A'}"`,
      `"${rec.employee?.employeeId || '-'}"`,
      `"${formatDate(rec.date)}"`,
      `"${rec.arrivalStatus || 'On Time'}"`,
      `"${formatTime(rec.checkIn)}"`,
      `"${formatTime(rec.checkOut)}"`,
      `"${formatHours(rec.totalBreakDuration || 0)}"`,
      `"${formatHours(rec.grossWorkingHours || 0)}"`,
      `"${formatHours(rec.netWorkingHours || rec.workingHours)}"`,
      `"${formatHours(rec.overtime || 0)}"`,
      `"${rec.status || 'N/A'}"`,
      `"${rec.complianceStatus || 'Compliant'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HR_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getComplianceBadge = (complianceStatus) => {
    if (complianceStatus === 'Under-Hours') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
          Under-Hours
        </span>
      );
    }
    if (complianceStatus === 'Overtime') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
          Overtime
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200">
        Compliant
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Logs</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitor, filter, and export organization-wide employee attendance records</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="btn-primary flex items-center gap-2 font-bold text-xs py-2.5 px-4 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Download size={16} />
          Export CSV ({filteredRecords.length})
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center space-x-3 border border-rose-200 text-sm font-medium">
          <AlertCircle className="shrink-0 text-rose-500" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Enhanced Filters Section */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Attendance Filters</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-3 py-1 rounded-lg transition-all"
            >
              <X size={13} />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by Name / ID */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search Employee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="input-field pl-9 text-xs"
                placeholder="Name or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              className="input-field text-xs"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              className="input-field text-xs"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Employee Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Employee
            </label>
            <select
              className="input-field text-xs"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="All">All Employees</option>
              {uniqueEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Attendance Status
            </label>
            <select
              className="input-field text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
              <option value="On Break">On Break</option>
              <option value="Under Hours">Under Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Period Summary Strip */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={16} className="text-blue-600" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtered Period Summary</h2>
          <span className="text-xs text-slate-400 font-medium ml-auto">{summary.total} record{summary.total !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-slate-900">{summary.total}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Records</p>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-emerald-700">{summary.present}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Present</p>
          </div>
          <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-orange-700">{summary.late}</p>
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-0.5">Late Arrivals</p>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-amber-700">{summary.halfDay}</p>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Half Days</p>
          </div>
          <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-rose-700">{summary.absent}</p>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-0.5">Absent</p>
          </div>
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-indigo-700">{summary.underHours}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Under Hours</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arrival</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check In</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Break</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Hours</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Hours</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar size={32} className="text-slate-300" />
                    <p className="text-slate-500 text-sm font-semibold">No attendance records found matching your filters.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear filters to view all records
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{record.employee?.name || 'N/A'}</span>
                      <span className="text-xs text-slate-400 font-medium">{record.employee?.employeeId || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getArrivalBadge(record.arrivalStatus)}
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
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                    {formatHours(record.grossWorkingHours || 0)}
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
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    {getComplianceBadge(record.complianceStatus)}
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

export default AttendanceManagement;
