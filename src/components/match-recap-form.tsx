"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitMatchRecap } from "@/app/actions"

type MatchRecapFormProps = {
  token: string
  clubName: string
  clubLogo?: string | null
  clubColor?: string | null
  dateLabel: string
  timeLabel: string
  initialPlayerName: string
  initialOpponentName?: string | null
  initialResult?: string | null
  isMemberMode?: boolean
  memberOptions?: { id: string; name: string }[]
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function MatchRecapForm({
  token,
  clubName,
  clubLogo,
  clubColor,
  dateLabel,
  timeLabel,
  initialPlayerName,
  initialOpponentName,
  initialResult,
  isMemberMode = false,
  memberOptions = [],
}: MatchRecapFormProps) {
  const [playerName, setPlayerName] = useState(initialPlayerName)
  const [opponentName, setOpponentName] = useState(initialOpponentName || "")
  const [resultText, setResultText] = useState(initialResult || "")
  const [opponentUserId, setOpponentUserId] = useState<string | null>(null)
  const [useMemberOpponent, setUseMemberOpponent] = useState(isMemberMode)
  const [message, setMessage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const color = clubColor || "#0f172a"

  const winnerName = useMemo(() => {
    if (!resultText) return null
    const parts = resultText.split(",").map((p) => p.trim())
    const score = parts.map((set) => {
      const [a, b] = set.split(":").map((v) => parseInt(v, 10))
      if (Number.isNaN(a) || Number.isNaN(b)) return 0
      return a > b ? 1 : a < b ? -1 : 0
    })
    const sum = score.reduce((acc, v) => acc + v, 0)
    if (sum === 0) return null
    return sum > 0 ? playerName : opponentName
  }, [resultText, playerName, opponentName])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 1080
    const height = 1350
    canvas.width = width
    canvas.height = height

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#0b1220")
    gradient.addColorStop(0.5, "#0f172a")
    gradient.addColorStop(1, color)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width * 0.1, height * 0.2)
    ctx.rotate(-0.15)
    ctx.fillStyle = "rgba(255,255,255,0.04)"
    ctx.fillRect(-200, 0, width + 200, 90)
    ctx.fillRect(-200, 150, width + 200, 60)
    ctx.fillRect(-200, 280, width + 200, 40)
    ctx.restore()

    ctx.fillStyle = "rgba(255,255,255,0.08)"
    ctx.beginPath()
    ctx.arc(width * 0.8, height * 0.2, 180, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(255,255,255,0.06)"
    ctx.beginPath()
    ctx.arc(width * 0.2, height * 0.85, 220, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(255,255,255,0.9)"
    ctx.font = "700 52px Arial"
    ctx.fillText(clubName, 80, 110)

    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.font = "600 26px Arial"
    ctx.fillText("MATCH CARD", 80, 150)

    ctx.fillStyle = "rgba(255,255,255,0.75)"
    ctx.font = "500 26px Arial"
    ctx.fillText(`${dateLabel} • ${timeLabel}`, 80, 190)

    ctx.strokeStyle = "rgba(255,255,255,0.2)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(80, 230)
    ctx.lineTo(width - 80, 230)
    ctx.stroke()

    const panelX = 80
    const panelY = 280
    const panelW = width - 160
    const panelH = 520
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)"
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 28)
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.12)"
    ctx.lineWidth = 2
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 28)
    ctx.stroke()

    const nameY = panelY + 110
    ctx.fillStyle = "white"
    ctx.font = "700 64px Arial"
    ctx.fillText(playerName || "Dein Name", panelX + 40, nameY)

    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = "700 34px Arial"
    ctx.fillText("VS", panelX + 40, nameY + 60)

    ctx.fillStyle = "white"
    ctx.font = "700 64px Arial"
    ctx.fillText(opponentName || "Gegner", panelX + 40, nameY + 140)

    ctx.fillStyle = "rgba(255,255,255,0.95)"
    ctx.font = "800 72px Arial"
    ctx.fillText(resultText || "6:4, 6:2", panelX + 40, nameY + 260)

    if (winnerName) {
      ctx.fillStyle = "rgba(255,215,0,0.9)"
      drawRoundedRect(ctx, panelX + 40, nameY + 300, 280, 50, 18)
      ctx.fill()
      ctx.fillStyle = "#0b1220"
      ctx.font = "800 26px Arial"
      ctx.fillText(`WINNER: ${winnerName}`, panelX + 60, nameY + 334)
    }

    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.font = "500 24px Arial"
    ctx.fillText(`Played at ${clubName}`, 80, height - 120)

    if (clubLogo) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.globalAlpha = 0.85
        ctx.drawImage(img, width - 200, height - 200, 120, 120)
        ctx.globalAlpha = 1
      }
      img.src = clubLogo
    }
  }, [clubName, clubLogo, color, dateLabel, timeLabel, playerName, opponentName, resultText, winnerName])

  const handleSave = async () => {
    setMessage(null)
    const res = await submitMatchRecap(token, {
      playerName: playerName.trim(),
      opponentName: opponentName.trim(),
      resultText: resultText.trim(),
      opponentUserId,
    })
    if (res?.success) {
      setMessage("Ergebnis gespeichert. Du kannst die Card teilen.")
    } else {
      setMessage(res?.error || "Fehler beim Speichern.")
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "match-card.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas || !("clipboard" in navigator)) return
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))
    if (!blob) return
    try {
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      setMessage("Bild in Zwischenablage kopiert.")
    } catch {
      setMessage("Kopieren nicht unterstützt. Bitte Download nutzen.")
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Match-Card erstellen</h1>
          <p className="mt-2 text-sm text-slate-500">
            Trage das Ergebnis ein und teile deine Match-Card mit Freunden.
          </p>
          <div className="mt-4 text-xs text-slate-500">
            Spiel am {dateLabel} um {timeLabel}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
          {isMemberMode && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Mitgliedsmodus aktiv – dein Name ist fix.
            </div>
          )}
          <div className="space-y-2">
            <Label>Mein Name</Label>
            <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} disabled={isMemberMode} />
          </div>
          <div className="space-y-2">
            <Label>Gegner Name</Label>
            {isMemberMode && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  className={useMemberOpponent ? "rounded-full border border-slate-200 bg-slate-100 px-2 py-1" : "rounded-full border border-slate-200 px-2 py-1"}
                  onClick={() => setUseMemberOpponent(true)}
                >
                  Mitglied wählen
                </button>
                <button
                  type="button"
                  className={!useMemberOpponent ? "rounded-full border border-slate-200 bg-slate-100 px-2 py-1" : "rounded-full border border-slate-200 px-2 py-1"}
                  onClick={() => {
                    setUseMemberOpponent(false)
                    setOpponentUserId(null)
                  }}
                >
                  Nicht Mitglied
                </button>
              </div>
            )}
            {useMemberOpponent && memberOptions.length > 0 ? (
              <div className="space-y-2">
                <Input
                  placeholder="Mitglied suchen…"
                  value={opponentName}
                  onChange={(e) => {
                    setOpponentName(e.target.value)
                    setOpponentUserId(null)
                  }}
                />
                <div className="max-h-40 overflow-auto rounded-lg border border-slate-200">
                  {memberOptions
                    .filter((m) => m.name.toLowerCase().includes(opponentName.toLowerCase()))
                    .slice(0, 6)
                    .map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => {
                          setOpponentName(m.name)
                          setOpponentUserId(m.id)
                        }}
                      >
                        {m.name}
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <Input value={opponentName} onChange={(e) => setOpponentName(e.target.value)} />
            )}
          </div>
          <div className="space-y-2">
            <Label>Ergebnis (z.B. 6:4, 6:2)</Label>
            <Input value={resultText} onChange={(e) => setResultText(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} className="rounded-full">
              Erstellen
            </Button>
            <Button variant="outline" onClick={handleDownload} className="rounded-full">
              Download
            </Button>
            <Button variant="outline" onClick={handleCopy} className="rounded-full">
              Copy to Insta
            </Button>
          </div>
          {message && <div className="text-sm text-slate-500">{message}</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Card</div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-900">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
      </div>
    </div>
  )
}
