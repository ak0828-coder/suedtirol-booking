import { redirect } from "next/navigation"

export default async function SuperAdminClubIndex({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return redirect(`/super-admin/club/${slug}/admin`)
}
