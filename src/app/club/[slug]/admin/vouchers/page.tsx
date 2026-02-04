import { getClubVouchers } from "@/app/actions"
import { useAdminContext } from "@/components/admin/admin-context"
import { VoucherManager } from "@/components/admin/voucher-manager"

export const dynamic = "force-dynamic"

export default async function AdminVouchersPage() {
  const { slug } = useAdminContext()
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
