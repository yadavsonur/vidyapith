import Image from "next/image";

export const Logo = () => {
  return (
    <div className="relative h-[130px] w-[130px] overflow-hidden rounded-full">
      <Image
        src="/logo.png"
        alt="logo"
        fill
        className="object-cover"
      />
    </div>
  );
}
