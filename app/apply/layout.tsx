export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh w-full bg-[#000000] text-white">{children}</div>;
}
