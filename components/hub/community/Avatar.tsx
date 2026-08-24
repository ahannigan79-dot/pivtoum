export function Avatar({ name, url, size = 34 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" width={size} height={size} className="avatar" style={{ width: size, height: size }} />;
  }
  return (
    <span className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials || "·"}
    </span>
  );
}
