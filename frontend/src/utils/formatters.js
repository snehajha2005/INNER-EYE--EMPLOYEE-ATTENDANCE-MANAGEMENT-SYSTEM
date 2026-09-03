export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

export const formatHours = (hoursValue) => {
  if (hoursValue === null || hoursValue === undefined) return '-';
  const h = Math.floor(hoursValue);
  const m = Math.round((hoursValue - h) * 60);
  return `${h}h ${m}m`;
};

export const formatTimer = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
