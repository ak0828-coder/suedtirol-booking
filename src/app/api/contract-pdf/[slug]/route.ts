import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit/js/pdfkit.standalone"

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
  try {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      })
      const chunks: Buffer[] = []
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      const pageWidth = doc.page.width
      const margin = doc.page.margins.left
      const contentWidth = pageWidth - margin - doc.page.margins.right

      const drawRule = () => {
        const y = doc.y
        doc.moveTo(margin, y).lineTo(margin + contentWidth, y).strokeColor("#e2e8f0").lineWidth(1).stroke()
        doc.moveDown(0.6)
      }

      doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("Avaimo - Mitgliedschaft")
      doc.moveDown(0.3)
      doc.font("Helvetica-Bold").fontSize(22).fillColor("#0f172a").text(title)
      doc.font("Helvetica").fontSize(12).fillColor("#475569").text(clubName)
      doc.font("Helvetica").fontSize(9).fillColor("#94a3b8").text(`Version ${version} - ${updatedAt || "-"}`)
      doc.moveDown(0.8)
      drawRule()

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Vereinsangaben")
      doc.font("Helvetica").fontSize(10).fillColor("#475569")
      doc.text("Adresse: ______________________________________________")
      doc.text("Kontakt (E-Mail/Telefon): _____________________________")
      doc.text("Vertreten durch: _______________________________________")
      doc.moveDown(0.6)
      drawRule()

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Mitgliedsdaten")
      doc.font("Helvetica").fontSize(10).fillColor("#475569")
      doc.text("Name: _________________________________________________")
      doc.text("Adresse: ______________________________________________")
      doc.text("E-Mail: _______________________________________________")
      doc.text("Telefon: ______________________________________________")
      doc.moveDown(0.6)
      drawRule()

      const paragraphs = String(body || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Vertragsinhalt")
      doc.moveDown(0.4)
      doc.font("Helvetica").fontSize(11).fillColor("#0f172a")
      if (paragraphs.length === 0) {
        doc.text("Kein Vertragstext hinterlegt.")
      } else {
        paragraphs.forEach((p) => {
          doc.text(p, { align: "left" })
          doc.moveDown(0.6)
        })
      }

      doc.moveDown(0.8)
      drawRule()

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Unterschriften")
      const yStart = doc.y + 18
      const colGap = 20
      const colWidth = (contentWidth - colGap) / 2

      doc.moveTo(margin, yStart).lineTo(margin + colWidth, yStart).strokeColor("#0f172a").lineWidth(0.8).stroke()
      doc.moveTo(margin + colWidth + colGap, yStart)
        .lineTo(margin + colWidth + colGap + colWidth, yStart)
        .stroke()

      doc.font("Helvetica").fontSize(9).fillColor("#64748b")
      doc.text("Verein (Name/Unterschrift)", margin, yStart + 6, { width: colWidth })
      doc.text("Mitglied (Name/Unterschrift)", margin + colWidth + colGap, yStart + 6, { width: colWidth })

      doc.moveDown(3)
      doc.font("Helvetica").fontSize(9).fillColor("#94a3b8")
      doc.text("Ort, Datum: ____________________________________________", { align: "left" })
      doc.moveDown(0.6)
      doc.text("Dieses Dokument wurde digital ueber Avaimo erstellt.", { align: "left" })

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
