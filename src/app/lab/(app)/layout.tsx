import LabShell from "@/components/lab/LabShell";
import { getUser, requireOnboarded } from "@/lib/lab/data";
import { isStoreOwner } from "@/lib/shop/owner";

export default async function LabAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireOnboarded();
  const user = await getUser();
  return (
    <LabShell user={{ name: profile.name }} owner={isStoreOwner(user?.email)}>
      {children}
    </LabShell>
  );
}
