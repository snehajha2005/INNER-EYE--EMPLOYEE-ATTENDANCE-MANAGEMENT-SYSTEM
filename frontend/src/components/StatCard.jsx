const StatCard = ({ title, value, icon, colorClass = 'text-blue-600 bg-blue-50/80 border-blue-100' }) => {
  return (
    <div className="card p-5 flex items-center space-x-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className={`p-3.5 rounded-2xl border shadow-2xs ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
