import { memo, ReactNode } from "react";

type CornerSize = "normal" | "large";

interface CardProps {
  children: ReactNode;
  className?: string;
  cornerSize?: CornerSize;
}

function CornerDecorations({ size = "normal" }: { size?: CornerSize }) {
  const dimension = size === "large" ? "w-16 h-16" : "w-12 h-12";
  
  return (
    <>
      <div
        className={`absolute top-0 left-0 ${dimension} border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 right-0 ${dimension} border-b-2 border-r-2 border-red-500/30 rounded-br-2xl pointer-events-none`}
      />
    </>
  );
}

function CardComponent({ children, className = "", cornerSize = "normal" }: CardProps) {
  return (
    <div
      className={`relative bg-linear-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 ${className}`}
    >
      <CornerDecorations size={cornerSize} />
      {children}
    </div>
  );
}

export const Card = memo(CardComponent);
export { CornerDecorations };
