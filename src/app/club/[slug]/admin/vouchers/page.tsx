import { getClubVouchers } from "@/app/actions"
import { VoucherManager } from "@/components/admin/voucher-manager"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminVouchersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { features, locks } = await getAdminContext(slug)
  if (!features.admin.vouchers && !locks.admin.vouchers) return notFound()
  const locked = !features.admin.vouchers && locks.admin.vouchers
  const vouchers = await getClubVouchers(slug)

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Gutscheine</h2>
        <p className="text-slate-500 text-sm">Gutscheine erstellen und verwalten.</p>
      </div>
      <VoucherManager vouchers={vouchers || []} clubSlug={slug} />
    </FeatureLockWrapper>
  )
}
