import LabShell from "@/components/lab/LabShell";
import { requireOnboarded } from "@/lib/lab/data";

export default async function LabAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireOnboarded();
  return <LabShell user={{ name: profile.name }}>{children}</LabShell>;
}
