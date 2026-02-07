import { getClubVouchers } from "@/app/actions"
import { VoucherManager } from "@/components/admin/voucher-manager"
import { getAdminContext } from "../_lib/get-admin-context"

export const dynamic = "force-dynamic"

export default async function AdminVouchersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club } = await getAdminContext(slug)
  if (!club.has_vouchers) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Gutscheine</h2>
        <p className="text-slate-500 text-sm">Dieses Modul ist fÃ¼r deinen Verein nicht freigeschaltet.</p>
      </div>
    )
  }
  const vouchers = await getClubVouchers(slug)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Gutscheine</h2>
        <p className="text-slate-500 text-sm">Gutscheine erstellen und verwalten.</p>
      </div>
      <VoucherManager vouchers={vouchers || []} clubSlug={slug} />
    </>
  )
}
