import Image from "next/image";

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span className="block flex-none overflow-hidden rounded-full border border-[#3a3f46]" style={{ width: size, height: size }}>
      <Image src="/brand/coin-96.webp" alt="" width={96} height={96} className="h-full w-full scale-[1.22] object-cover" priority />
    </span>
  );
}
