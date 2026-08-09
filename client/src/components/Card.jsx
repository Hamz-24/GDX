const Card = ({ children, title, className = "", amber = false, dark = false, subtitle = "" }) => {
  return (
    <div 
      className={`ref-card flex flex-col relative overflow-hidden transition-all duration-200 ${
        dark ? 'bg-zinc-950 text-white border-zinc-800' : ''
      } ${className}`}
    >
      {title && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className={`text-lg md:text-xl font-bold font-display tracking-tight ${dark ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
              {title}
            </h3>
            {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {amber && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5C542] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F5C542]"></span>
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default Card;
