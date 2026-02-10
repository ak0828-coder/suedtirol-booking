import { redirect } from "next/navigation"
import { defaultLocale } from "@/lib/i18n"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/${defaultLocale}/club/${slug}/admin/members`)
}
