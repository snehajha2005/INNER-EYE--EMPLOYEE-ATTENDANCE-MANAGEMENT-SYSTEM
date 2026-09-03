import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';
import { Search } from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      setEmployees(res.data);
      setFilteredEmployees(res.data);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(term) || 
        emp.employeeId.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">View and search registered organization employees</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={17} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                  No employees found matching your search.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/60 font-mono">
                      {emp.employeeId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500 text-right">
                    {formatDate(emp.createdAt)}
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

export default EmployeeManagement;
