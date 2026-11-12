export function PageHead({ index, label, title, children }: { index: string; label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="g12 items-end gap-y-6 pb-10 pt-14">
      <div className="col-span-3 label flex items-center gap-4 self-start pt-3 text-muted">
        <span className="text-platinum">{index}</span><span className="h-px w-8 bg-[#3a3f46]" />{label}
      </div>
      <div className="col-span-9">
        <h1 className="disp text-[clamp(40px,5vw,76px)] text-offwhite">{title}</h1>
        {children && <div className="mt-6 max-w-[620px] text-[17px] leading-[27px] text-mist">{children}</div>}
      </div>
    </div>
  );
}
