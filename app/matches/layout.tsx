import AppShell from "@/app/components/layouts/AppShell";

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
