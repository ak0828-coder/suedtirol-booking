import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit/js/pdfkit.standalone"

export const runtime = "nodejs"

type ContractField = { label?: string }

type PdfPayload = {
  clubName: string
  title: string
  body: string
  version: number
  updatedAt: string | null
  slug: string
  fields?: ContractField[]
}

async function buildPdfResponse({
  clubName,
  title,
  body,
  version,
  updatedAt,
  slug,
  fields,
}: PdfPayload) {
  try {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 44, bottom: 44, left: 46, right: 46 },
      })

      const chunks: Buffer[] = []
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      const { width, height, margins } = doc.page
      const contentWidth = width - margins.left - margins.right
      const contentLeft = margins.left
      const contentRight = contentLeft + contentWidth

      const colors = {
        ink: "#0f172a",
        muted: "#64748b",
        light: "#94a3b8",
        border: "#e2e8f0",
        panel: "#f8fafc",
        accent: "#0f172a",
      }

      const sectionTitle = (text: string) => {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.ink).text(text)
        doc.moveDown(0.35)
      }

      const rule = () => {
        const y = doc.y
        doc.moveTo(contentLeft, y).lineTo(contentRight, y).lineWidth(1).strokeColor(colors.border).stroke()
        doc.moveDown(0.8)
      }

      const panel = (height: number) => {
        const y = doc.y
        doc.roundedRect(contentLeft, y, contentWidth, height, 6).fillColor(colors.panel).fill()
        doc.fillColor(colors.ink)
      }

      // Header band
      const headerHeight = 86
      doc.rect(contentLeft, margins.top, contentWidth, headerHeight).fillColor(colors.panel).fill()
      doc.rect(contentLeft, margins.top, 6, headerHeight).fillColor(colors.accent).fill()

      doc.fillColor(colors.ink)
      doc.font("Helvetica-Bold").fontSize(22).text(title, contentLeft + 16, margins.top + 16, {
        width: contentWidth - 32,
      })
      doc.font("Helvetica").fontSize(11).fillColor(colors.muted).text(clubName, contentLeft + 16, margins.top + 46)
      doc.font("Helvetica").fontSize(9).fillColor(colors.light).text(
        `Version ${version} • ${updatedAt || "-"}`,
        contentLeft + 16,
        margins.top + 64
      )

      doc.moveDown(7)
      doc.y = margins.top + headerHeight + 18

      // Club info panel
      sectionTitle("Vereinsangaben")
      panel(70)
      doc.font("Helvetica").fontSize(10).fillColor(colors.muted)
      doc.text("Adresse:", contentLeft + 16, doc.y + 12)
      doc.text("Kontakt (E-Mail/Telefon):", contentLeft + 16, doc.y + 32)
      doc.text("Vertreten durch:", contentLeft + 16, doc.y + 52)
      doc.moveDown(5)
      doc.y += 70
      rule()

      // Member info panel
      sectionTitle("Mitgliedsdaten")
      panel(86)
      doc.font("Helvetica").fontSize(10).fillColor(colors.muted)
      doc.text("Name:", contentLeft + 16, doc.y + 12)
      doc.text("Adresse:", contentLeft + 16, doc.y + 32)
      doc.text("E-Mail:", contentLeft + 16, doc.y + 52)
      doc.text("Telefon:", contentLeft + 16, doc.y + 72)
      doc.moveDown(6)
      doc.y += 86
      rule()

      // Custom fields
      if (fields && fields.length > 0) {
        sectionTitle("Zusatzangaben")
        const rows = fields.slice(0, 6)
        const rowHeight = 18
        const boxHeight = 18 + rows.length * rowHeight
        panel(boxHeight)
        doc.font("Helvetica").fontSize(10).fillColor(colors.muted)
        rows.forEach((field, idx) => {
          const label = (field?.label || "Feld").trim()
          doc.text(`${label}:`, contentLeft + 16, doc.y + 12 + idx * rowHeight)
        })
        doc.moveDown(6)
        doc.y += boxHeight
        rule()
      }

      // Contract content
      sectionTitle("Vertragsinhalt")
      doc.font("Helvetica").fontSize(11).fillColor(colors.ink)
      const paragraphs = String(body || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      if (paragraphs.length === 0) {
        doc.text("Kein Vertragstext hinterlegt.")
      } else {
        paragraphs.forEach((p) => {
          doc.text(p, { align: "left" })
          doc.moveDown(0.6)
        })
      }

      doc.moveDown(0.6)
      rule()

      // Signatures
      sectionTitle("Unterschriften")
      const colGap = 18
      const colWidth = (contentWidth - colGap) / 2
      const y = doc.y + 8

      doc.roundedRect(contentLeft, y, colWidth, 70, 6).strokeColor(colors.border).lineWidth(1).stroke()
      doc.roundedRect(contentLeft + colWidth + colGap, y, colWidth, 70, 6).strokeColor(colors.border).lineWidth(1).stroke()

      doc.font("Helvetica").fontSize(9).fillColor(colors.muted)
      doc.text("Verein (Name/Unterschrift)", contentLeft + 12, y + 48, { width: colWidth - 24 })
      doc.text("Mitglied (Name/Unterschrift)", contentLeft + colWidth + colGap + 12, y + 48, { width: colWidth - 24 })

      doc.moveDown(5)
      doc.y = y + 82
      doc.font("Helvetica").fontSize(9).fillColor(colors.light)
      doc.text("Ort, Datum: ____________________________________________")
      doc.moveDown(0.6)
      doc.text("Dieses Dokument wurde digital ueber Avaimo erstellt.")

      doc.end()
    })

    return new NextResponse(new Uint8Array(buffer), {
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
      "id, name, owner_id, membership_contract_title, membership_contract_body, membership_contract_version, membership_contract_updated_at, membership_contract_fields"
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
    fields: Array.isArray(club.membership_contract_fields) ? club.membership_contract_fields : [],
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
  const body = typeof payload?.body === "string" ? payload.body : club.membership_contract_body || ""
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
    fields: Array.isArray(payload?.fields) ? payload.fields : [],
  })
}
