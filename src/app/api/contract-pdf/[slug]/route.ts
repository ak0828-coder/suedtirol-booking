import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContractPdfDocument } from "@/lib/contract-pdf"
import { pdf } from "@react-pdf/renderer"
import React from "react"

export const runtime = "nodejs"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { data: club } = await supabase
    .from("clubs")
    .select(
      "id, name, owner_id, membership_contract_title, membership_contract_body, membership_contract_version, membership_contract_updated_at"
    )
    .eq("slug", slug)
    .single()

  if (!club) return new NextResponse("Not found", { status: 404 })

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || ""
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL
  if (club.owner_id !== user.id && !isSuperAdmin) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const doc = React.createElement(ContractPdfDocument, {
    clubName: club.name,
    title: club.membership_contract_title || "Mitgliedsvertrag",
    body: club.membership_contract_body || "",
    version: club.membership_contract_version || 1,
    updatedAt: club.membership_contract_updated_at
      ? new Date(club.membership_contract_updated_at).toLocaleDateString("de-DE")
      : null,
  })

  const buffer = (await pdf(doc).toBuffer()) as unknown as Buffer
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(buffer)
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=\"${slug}-mitgliedsvertrag.pdf\"`,
      "Cache-Control": "no-store",
    },
  })
}
