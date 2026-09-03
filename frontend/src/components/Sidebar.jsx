import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  Users, 
  CalendarCheck,
  LogOut,
  Clock,
  CalendarRange,
  FileText,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee', icon: <LayoutDashboard size={19} /> },
    { name: 'Attendance History', path: '/employee/history', icon: <History size={19} /> },
    { name: 'Leave Management', path: '/employee/leaves', icon: <CalendarRange size={19} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={19} /> },
  ];

  const hrLinks = [
    { name: 'Dashboard', path: '/hr', icon: <LayoutDashboard size={19} /> },
    { name: 'Employees', path: '/hr/employees', icon: <Users size={19} /> },
    { name: 'Attendance Log', path: '/hr/attendance', icon: <CalendarCheck size={19} /> },
    { name: 'Leave Management', path: '/hr/leaves', icon: <FileText size={19} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={19} /> },
  ];

  const links = user?.role === 'hr' ? hrLinks : employeeLinks;

  return (
    <div className="w-64 bg-white border-r border-slate-200/80 h-screen flex flex-col shrink-0 z-40">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Clock size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">SyncTime</h1>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Attendance System</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-3 space-y-1.5 mt-4 overflow-y-auto">
        <div className="px-3 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
            end={link.path === '/employee' || link.path === '/hr'}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
