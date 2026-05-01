// Auth pages (login, signup, landing) render without any app shell.
// The layout is intentionally minimal — no sidebar, no topbar, no navigation.
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
