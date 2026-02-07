import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContractPdfDocument } from "@/lib/contract-pdf"
import { pdf, type DocumentProps } from "@react-pdf/renderer"
import React from "react"

export const runtime = "nodejs"

async function buildPdfResponse({
  clubName,
  title,
  body,
  version,
  updatedAt,
  slug,
}: {
  clubName: string
  title: string
  body: string
  version: number
  updatedAt: string | null
  slug: string
}) {
  const doc = React.createElement(ContractPdfDocument, {
    clubName,
    title,
    body,
    version,
    updatedAt,
  }) as React.ReactElement<DocumentProps>

  try {
    const buffer = (await pdf(doc).toBuffer()) as unknown as Buffer
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=\"${slug}-mitgliedsvertrag.pdf\"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("contract-pdf render failed", err)
    return new NextResponse("PDF render failed", { status: 500 })
  }
}

async function getClubContext(slug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: new NextResponse("Unauthorized", { status: 401 }) }

  const { data: club } = await supabase
    .from("clubs")
    .select(
      "id, name, owner_id, membership_contract_title, membership_contract_body, membership_contract_version, membership_contract_updated_at"
    )
    .eq("slug", slug)
    .single()

  if (!club) return { error: new NextResponse("Not found", { status: 404 }) }

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || ""
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL
  if (club.owner_id !== user.id && !isSuperAdmin) {
    return { error: new NextResponse("Forbidden", { status: 403 }) }
  }

  return { club }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ctx = await getClubContext(slug)
  if ("error" in ctx) return ctx.error

  const club = ctx.club
  const updatedAt = club.membership_contract_updated_at
    ? new Date(club.membership_contract_updated_at).toLocaleDateString("de-DE")
    : null

  return buildPdfResponse({
    clubName: club.name,
    title: club.membership_contract_title || "Mitgliedsvertrag",
    body: club.membership_contract_body || "",
    version: club.membership_contract_version || 1,
    updatedAt,
    slug,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ctx = await getClubContext(slug)
  if ("error" in ctx) return ctx.error

  const club = ctx.club
  const payload = await req.json().catch(() => null)
  const title =
    typeof payload?.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : club.membership_contract_title || "Mitgliedsvertrag"
  const body =
    typeof payload?.body === "string" ? payload.body : club.membership_contract_body || ""
  const version =
    typeof payload?.version === "number" && payload.version > 0
      ? payload.version
      : club.membership_contract_version || 1
  const updatedAt =
    typeof payload?.updatedAt === "string" && payload.updatedAt.trim()
      ? payload.updatedAt.trim()
      : club.membership_contract_updated_at
      ? new Date(club.membership_contract_updated_at).toLocaleDateString("de-DE")
      : null

  return buildPdfResponse({
    clubName: club.name,
    title,
    body,
    version,
    updatedAt,
    slug,
  })
}
