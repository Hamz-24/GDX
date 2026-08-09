const ProgressBar = ({ progress, label, color = "bg-[#F5C542]", className = "" }) => {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2 text-xs font-semibold">
          <span className="text-zinc-700 dark:text-zinc-300 font-sans">{label}</span>
          <span className="font-bold font-mono text-zinc-900 dark:text-white">{safeProgress}%</span>
        </div>
      )}
      <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
