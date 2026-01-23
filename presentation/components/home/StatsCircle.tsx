'use client';

type StatItemProps = {
  label: string;
  value: string;
};

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 relative">
      <span className="text-red-400 text-sm sm:text-base tracking-[0.3em] uppercase font-mono">
        {label}
      </span>
      <p 
        className="text-3xl sm:text-4xl xl:text-5xl text-white font-bold tracking-wider"
        style={{ fontFamily: 'Transformers, sans-serif' }}
      >
        {value}
      </p>
      <div className="w-16 h-px bg-linear-to-r from-transparent via-red-500 to-transparent mt-1" />
    </div>
  );
}

type StatsCardProps = {
  stats: StatItemProps[];
  index?: number;
};

export function StatsCircle({ stats, index = 0 }: StatsCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      
      <div className="absolute -inset-2 border border-red-500/20 rounded-full group-hover:border-red-500/40 transition-colors duration-500" />
      
      <div 
        className="
          relative z-10
          w-70 h-70 
          sm:w-87.5 sm:h-87.5 
          xl:w-105 xl:h-105
          rounded-full
          bg-linear-to-br from-black/90 via-black/80 to-black/90
          backdrop-blur-md
          border border-white/20
          flex flex-col justify-center items-center gap-8
          transition-all duration-500
          group-hover:border-red-500/50
          group-hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]
        "
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          <svg className="absolute top-4 left-4 w-20 h-20" viewBox="0 0 100 100">
            <path 
              d="M0 50 L30 50 L40 30 L60 30 L70 50 L100 50" 
              stroke="#ef4444" 
              strokeWidth="1" 
              fill="none"
              className="animate-pulse"
            />
            <circle cx="30" cy="50" r="3" fill="#ef4444" />
            <circle cx="70" cy="50" r="3" fill="#ef4444" />
          </svg>
          <svg className="absolute bottom-4 right-4 w-20 h-20 rotate-180" viewBox="0 0 100 100">
            <path 
              d="M0 50 L30 50 L40 30 L60 30 L70 50 L100 50" 
              stroke="#ef4444" 
              strokeWidth="1" 
              fill="none"
              className="animate-pulse"
            />
            <circle cx="30" cy="50" r="3" fill="#ef4444" />
            <circle cx="70" cy="50" r="3" fill="#ef4444" />
          </svg>
        </div>

        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-red-500/40 rounded-tl-full" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-red-500/40 rounded-tr-full" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-red-500/40 rounded-bl-full" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-red-500/40 rounded-br-full" />

        <div className="absolute top-8 right-10 text-red-500/50 font-mono text-sm">
          [{String(index + 1).padStart(2, '0')}]
        </div>

        {stats.map((stat, i) => (
          <StatItem key={i} label={stat.label} value={stat.value} />
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500/50 rotate-45" />
          <div className="w-12 h-0.5 bg-linear-to-r from-red-500/50 to-transparent" />
          <div className="w-3 h-3 border border-red-500/50 rotate-45" />
          <div className="w-12 h-0.5 bg-linear-to-l from-red-500/50 to-transparent" />
          <div className="w-2 h-2 bg-red-500/50 rotate-45" />
        </div>
      </div>
    </div>
  );
}
