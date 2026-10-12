import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group select-none">
      <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-ink-200/80 bg-parchment-100 shadow-subtle group-hover:border-ochre-500/60 transition-colors">
        <Image
          src="/logo.png"
          alt="Vidhyapith Crest"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="font-serif text-lg font-bold tracking-tight text-ink-950 leading-none group-hover:text-ochre-700 transition-colors">
          VIDYAPITH
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500 mt-1">
          Knowledge Archive
        </span>
      </div>
    </Link>
  );
};
