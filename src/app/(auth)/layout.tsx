export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-surface">
      <div className="w-full max-w-md px-6 pb-20">{children}</div>
    </div>
  );
}
