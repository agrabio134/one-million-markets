import Link from "next/link";
export default function NotFound() {
  return (
    <div className="hero-grid flex min-h-[70vh] items-center bg-obsidian">
      <div className="wrap">
        <div className="label text-muted">404</div>
        <h1 className="disp mt-6 text-[clamp(48px,8vw,120px)] text-offwhite">NO MARKET HERE.</h1>
        <Link href="/" className="btn btn-silver mt-10">Return home <span className="arr" aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
