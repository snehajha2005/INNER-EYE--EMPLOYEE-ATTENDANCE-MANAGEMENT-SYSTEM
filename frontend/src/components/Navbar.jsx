import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Shield, User } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'hr';

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-medium text-slate-600 capitalize">{isHr ? 'HR Administration' : 'Employee Workspace'}</span>
      </div>

      <Link to="/profile" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
              isHr ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
            }`}>
              {isHr ? <Shield size={10} /> : <User size={10} />}
              {isHr ? 'HR Admin' : 'Employee'}
            </span>
          </div>
        </div>

        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shadow-2xs transition-transform hover:scale-105 ${
          isHr ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          <UserCircle size={22} />
        </div>
      </Link>
    </nav>
  );
};

export default Navbar;
