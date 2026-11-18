import LabShell from "@/components/lab/LabShell";

export default async function LabAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LabShell user={null}>{children}</LabShell>;
}
