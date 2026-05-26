interface ComingSoonProps {
  title: string;
  description: string;
  icon: string;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="text-4xl">{icon}</div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-white/40 leading-relaxed">{description}</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2ecc71]/10 border border-[#2ecc71]/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] animate-pulse" />
            <span className="text-xs text-[#2ecc71] font-medium">Em desenvolvimento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
