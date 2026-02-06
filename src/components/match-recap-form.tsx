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
  const [shareSupported, setShareSupported] = useState(false)
  const [showSuccessRing, setShowSuccessRing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const color = clubColor || "#0f172a"

  const winnerName = useMemo(() => {
    if (!resultText) return null
    const parts = resultText.split(",").map((p) => p.trim())
    const score: number[] = parts.map((set) => {
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
    gradient.addColorStop(0.55, "#0f172a")
    gradient.addColorStop(1, color)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width * 0.08, height * 0.18)
    ctx.rotate(-0.14)
    ctx.fillStyle = "rgba(255,255,255,0.05)"
    ctx.fillRect(-240, 0, width + 260, 110)
    ctx.fillRect(-240, 170, width + 260, 70)
    ctx.fillRect(-240, 300, width + 260, 50)
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
    ctx.font = "900 56px Impact, Arial Black, Arial"
    ctx.fillText(clubName, 80, 110)

    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.font = "700 26px Impact, Arial Black, Arial"
    ctx.fillText("MATCH CARD", 80, 150)

    ctx.fillStyle = "rgba(255,255,255,0.75)"
    ctx.font = "600 24px Impact, Arial Black, Arial"
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
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)"
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 28)
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.12)"
    ctx.lineWidth = 2
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 28)
    ctx.stroke()

    const nameY = panelY + 110
    ctx.fillStyle = "white"
    ctx.font = "900 66px Impact, Arial Black, Arial"
    ctx.fillText(playerName || "Dein Name", panelX + 40, nameY)

    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = "800 34px Impact, Arial Black, Arial"
    ctx.fillText("VS", panelX + 40, nameY + 60)

    ctx.fillStyle = "white"
    ctx.font = "900 66px Impact, Arial Black, Arial"
    ctx.fillText(opponentName || "Gegner", panelX + 40, nameY + 140)

    ctx.fillStyle = "rgba(255,255,255,0.95)"
    ctx.font = "900 78px Impact, Arial Black, Arial"
    ctx.fillText(resultText || "6:4, 6:2", panelX + 40, nameY + 260)

    if (winnerName) {
      const shimmer = ctx.createLinearGradient(panelX + 40, nameY + 300, panelX + 360, nameY + 354)
      shimmer.addColorStop(0, "rgba(255,215,0,0.9)")
      shimmer.addColorStop(0.5, "rgba(255,239,160,0.95)")
      shimmer.addColorStop(1, "rgba(255,215,0,0.9)")
      ctx.fillStyle = shimmer
      drawRoundedRect(ctx, panelX + 40, nameY + 300, 320, 54, 18)
      ctx.fill()
      ctx.fillStyle = "#0b1220"
      ctx.font = "900 26px Impact, Arial Black, Arial"
      ctx.fillText(`WINNER: ${winnerName}`, panelX + 60, nameY + 336)
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

  useEffect(() => {
    const nav = navigator as unknown as {
      share?: (data?: ShareData) => Promise<void>
      canShare?: (data?: ShareData) => boolean
    }
    setShareSupported(typeof nav.share === "function" && typeof nav.canShare === "function")
  }, [])

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
      setShowSuccessRing(true)
      setTimeout(() => setShowSuccessRing(false), 700)
    } else {
      setMessage(res?.error || "Fehler beim Speichern.")
    }
  }

  const handleDownload = () => {
    const cardUrl = `/match/recap/${token}/card`
    fetch(cardUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a")
        link.download = "match-card.png"
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      })
  }

  const handleShare = async () => {
    const cardUrl = `/match/recap/${token}/card`
    const blob = await fetch(cardUrl).then((res) => res.blob())
    const file = new File([blob], "match-card.png", { type: "image/png" })

    // Web Share API (mobile-first)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "Match Card",
          text: "Mein Match Recap",
          files: [file],
        })
        setMessage("Teilen geöffnet.")
        return
      } catch {
        // user cancelled -> ignore
      }
    }

    setMessage("Teilen nicht unterstützt. Bitte Download nutzen.")
  }

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] anim-fade-up">
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 sm:p-6 shadow-sm anim-fade-up-sm anim-stagger-1">
          <h1 className="text-2xl font-semibold text-slate-900">Match-Card erstellen</h1>
          <p className="mt-2 text-sm text-slate-500">
            Trage das Ergebnis ein und teile deine Match-Card mit Freunden.
          </p>
          <div className="mt-4 text-xs text-slate-500">
            Spiel am {dateLabel} um {timeLabel}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 sm:p-6 shadow-sm space-y-4 anim-fade-up-sm anim-stagger-2">
          {isMemberMode && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Mitgliedsmodus aktiv – dein Name ist fix.
            </div>
          )}
          <div className="space-y-2">
            <Label>Mein Name</Label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isMemberMode}
              className="input-glow"
            />
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
                  className="input-glow"
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
              <Input value={opponentName} onChange={(e) => setOpponentName(e.target.value)} className="input-glow" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Ergebnis (z.B. 6:4, 6:2)</Label>
            <Input value={resultText} onChange={(e) => setResultText(e.target.value)} className="input-glow" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} className="rounded-full transition-transform hover:-translate-y-0.5 btn-press w-full sm:w-auto">
              Erstellen
            </Button>
            <Button variant="outline" onClick={handleDownload} className="rounded-full transition-transform hover:-translate-y-0.5 btn-press w-full sm:w-auto">
              Download
            </Button>
            <Button variant="outline" onClick={handleShare} className="rounded-full transition-transform hover:-translate-y-0.5 btn-press w-full sm:w-auto">
              {shareSupported ? "Teilen" : "Download für Insta"}
            </Button>
          </div>
          <div className="text-xs text-slate-500">
            Tipp: Für Instagram einfach „Download“ wählen und dann in der Story posten.
          </div>
          {message && <div className="text-sm text-slate-500 anim-pop">{message}</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 sm:p-6 shadow-sm anim-fade-up-sm anim-stagger-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Card</div>
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-900 anim-glow tilt-card">
          <div
            className="absolute inset-0 opacity-10 anim-shimmer"
            style={{ backgroundImage: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.25) 50%, transparent 75%)" }}
          />
          <canvas ref={canvasRef} className="relative w-full h-auto" />
          {showSuccessRing && <div className="ring-pulse" />}
        </div>
      </div>
    </div>
  )
}
