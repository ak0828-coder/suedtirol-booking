"use client"

import { useState, useEffect, useRef } from "react"
import { Smartphone, Clock, Award, ArrowRight, Check, Loader2 } from "lucide-react"
import { submitWaitlistEmail } from "./actions"
import Link from "next/link"

function AnimatedCounter({ target }: { target: number }) {
  const [value, setValue] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    if (target === prevRef.current) return
    const start = prevRef.current
    const end = target
    const duration = 800
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    prevRef.current = target
  }, [target])

  return <>{value}</>
}

function EmailForm({ onSuccess, buttonLabel = "Warteliste beitreten" }: { onSuccess: () => void; buttonLabel?: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await submitWaitlistEmail(email)
    setLoading(false)
    if (res.ok) {
      setDone(true)
      onSuccess()
    } else {
      setError(res.error || "Fehler")
    }
  }

  if (done) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{
          background: "rgba(52,211,153,0.10)",
          border: "1px solid rgba(52,211,153,0.25)",
        }}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Du bist dabei!</p>
          <p className="text-xs text-white/40 mt-0.5">Wir melden uns vor der Eröffnung bei dir.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="deine@email.com"
          className="w-full h-13 rounded-2xl px-5 text-base text-white placeholder:text-white/25 outline-none transition-all"
          style={{
            height: "52px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onFocus={(e) => {
            e.target.style.border = "1px solid rgba(203,191,154,0.45)"
            e.target.style.boxShadow = "0 0 0 3px rgba(203,191,154,0.08)"
          }}
          onBlur={(e) => {
            e.target.style.border = "1px solid rgba(255,255,255,0.12)"
            e.target.style.boxShadow = "none"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold text-sm flex items-center gap-2 justify-center transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{
            height: "52px",
            borderRadius: "16px",
            background: "#CBBF9A",
            color: "#080808",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {buttonLabel} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}
    </form>
  )
}

export default function BozenerClient({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  const handleSuccess = () => {
    setCount((c) => c + 1)
  }

  const features = [
    {
      icon: Smartphone,
      title: "App-Only.",
      text: "Buchung, Zugang und Lichtsteuerung. Alles in deiner Hand. Keine Rezeption, keine Wartezeit.",
    },
    {
      icon: Clock,
      title: "24/7 Geöffnet.",
      text: "Trainiere, wann du willst. Morgens um 5 oder nachts um 11. Volle Flexibilität für deinen Lifestyle.",
    },
    {
      icon: Award,
      title: "Premium Hardware.",
      text: "Panorama Padel Courts, High-End Pilates Reformer und modernstes Gym-Equipment.",
    },
  ]

  const benefits = [
    "20% Rabatt auf alle Gym und Pilates Abos im gesamten ersten Jahr",
    "5% Extra Rabatt auf jede Padel Buchung im gesamten ersten Jahr",
    "Exklusiver Vorabzugang zur App und zur Anlage vor der offiziellen Eröffnung",
    "Einladung zum Pre-Opening Event (nur für Founder)",
  ]

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#080808" }}
    >
      {/* Animated mesh gradient — fixed, clipped via overflow-x-hidden on parent */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(800px, 200vw)",
            height: "min(600px, 160vw)",
            background: "radial-gradient(ellipse, rgba(31,61,43,0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "meshDrift1 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-5%",
            width: "min(600px, 150vw)",
            height: "min(500px, 130vw)",
            background: "radial-gradient(ellipse, rgba(203,191,154,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "meshDrift2 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "-5%",
            width: "min(500px, 120vw)",
            height: "min(400px, 100vw)",
            background: "radial-gradient(ellipse, rgba(31,61,43,0.2) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "meshDrift3 26s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grain texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.032,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
          zIndex: 1,
        }}
      />

      <style>{`
        @keyframes meshDrift1 {
          0%, 100% { transform: translateX(-50%) translateY(0%) scale(1); }
          33% { transform: translateX(-48%) translateY(-4%) scale(1.06); }
          66% { transform: translateX(-52%) translateY(3%) scale(0.96); }
        }
        @keyframes meshDrift2 {
          0%, 100% { transform: translateX(0%) translateY(0%); }
          50% { transform: translateX(-6%) translateY(-5%); }
        }
        @keyframes meshDrift3 {
          0%, 100% { transform: translateX(0%) translateY(0%); }
          50% { transform: translateX(4%) translateY(-6%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>

      <div className="relative z-10">

        {/* ── HERO ── */}
        <section
          className="flex flex-col items-center justify-center px-5 text-center"
          style={{
            minHeight: "100svh",
            paddingTop: "clamp(64px, 12vh, 120px)",
            paddingBottom: "clamp(48px, 10vh, 96px)",
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] mb-6 sm:mb-10"
            style={{
              background: "rgba(31,61,43,0.3)",
              border: "1px solid rgba(31,61,43,0.55)",
              color: "#CBBF9A",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
            />
            South Tyrol · Coming 2027
          </div>

          {/* Main headline */}
          <h1
            className="font-extrabold leading-none mb-5 sm:mb-7 w-full"
            style={{
              fontSize: "clamp(44px, 13vw, 160px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            <span style={{ color: "#F9F8F4" }}>AVAÍMO.</span>
            <br />
            <span
              style={{
                WebkitTextStroke: "1.5px rgba(249,248,244,0.2)",
                color: "transparent",
              }}
            >
              BOZEN SÜD.
            </span>
            <br />
            <span style={{ color: "rgba(203,191,154,0.65)", fontSize: "0.55em" }}>2027.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-sm sm:text-lg md:text-xl leading-relaxed max-w-sm sm:max-w-lg mb-7 sm:mb-10"
            style={{ color: "rgba(249,248,244,0.42)" }}
          >
            Der erste vollautomatische 24/7 Premium Sportclub Südtirols.{" "}
            <span style={{ color: "rgba(203,191,154,0.6)" }}>Padel · Pilates · Gym.</span>{" "}
            Gesteuert über dein Smartphone.
          </p>

          {/* Email form */}
          <div className="w-full max-w-sm sm:max-w-md mb-8 sm:mb-10">
            <EmailForm onSuccess={handleSuccess} />
          </div>

          {/* Live counter */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="font-mono font-bold"
              style={{ fontSize: "clamp(48px, 14vw, 80px)", color: "#CBBF9A", lineHeight: 1 }}
            >
              <AnimatedCounter target={count} />
            </div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              sind bereits auf der Warteliste
            </p>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          className="py-14 sm:py-24"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-10 sm:mb-14">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-3"
                style={{ color: "rgba(203,191,154,0.5)" }}
              >
                Das Konzept
              </p>
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em]"
                style={{ color: "#F9F8F4" }}
              >
                Ein Club. Kein Aufwand.
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-6">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="rounded-2xl sm:rounded-3xl p-5 sm:p-7"
                  style={{
                    background: i === 0 ? "rgba(31,61,43,0.2)" : "rgba(255,255,255,0.03)",
                    border: i === 0 ? "1px solid rgba(31,61,43,0.45)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5"
                    style={{
                      background: i === 0 ? "rgba(203,191,154,0.1)" : "rgba(31,61,43,0.25)",
                      border: i === 0 ? "1px solid rgba(203,191,154,0.18)" : "1px solid rgba(31,61,43,0.4)",
                    }}
                  >
                    <f.icon
                      className="w-5 h-5"
                      style={{ color: i === 0 ? "#CBBF9A" : "rgba(203,191,154,0.6)" }}
                    />
                  </div>
                  <h3
                    className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 tracking-tight"
                    style={{ color: "#F9F8F4" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDER STATUS ── */}
        <section className="py-14 sm:py-24">
          <div className="max-w-xl mx-auto px-5 text-center">

            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-3 sm:mb-4"
              style={{ color: "rgba(203,191,154,0.5)" }}
            >
              Limitiert
            </p>
            <h2
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] mb-4 sm:mb-5"
              style={{ color: "#F9F8F4" }}
            >
              Werde AVAÍMO<br />Founder.
            </h2>
            <p
              className="text-sm sm:text-base leading-relaxed mb-8 sm:mb-10"
              style={{ color: "rgba(255,255,255,0.42)" }}
            >
              Wir sind aktuell in der finalen Planungsphase für Bozen Süd. Trage dich jetzt ein
              und sichere dir einen der limitierten Founder-Plätze mit exklusiven Vorteilen,
              die danach nicht mehr verfügbar sind.
            </p>

            {/* Benefits card */}
            <div
              className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left mb-8 sm:mb-10"
              style={{
                background: "rgba(31,61,43,0.18)",
                border: "1px solid rgba(31,61,43,0.4)",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 sm:mb-5"
                style={{ color: "rgba(203,191,154,0.55)" }}
              >
                Deine Founder-Vorteile
              </p>
              <div className="space-y-3.5 sm:space-y-4">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: "rgba(203,191,154,0.12)",
                        border: "1px solid rgba(203,191,154,0.25)",
                      }}
                    >
                      <Check className="w-3 h-3" style={{ color: "#CBBF9A" }} />
                    </div>
                    <span className="text-sm leading-snug" style={{ color: "rgba(249,248,244,0.68)" }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Second email form */}
            <EmailForm onSuccess={handleSuccess} buttonLabel="Jetzt eintragen" />

            {/* Small counter */}
            <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.18)" }}>
              Bereits{" "}
              <span className="font-mono font-semibold" style={{ color: "rgba(203,191,154,0.5)" }}>
                <AnimatedCounter target={count} />
              </span>{" "}
              auf der Warteliste · Founder-Plätze limitiert
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="py-8 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Link
            href="https://avaimo.com"
            className="text-sm font-semibold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            avaimo.com
          </Link>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.08)" }}>
            © 2027 Avaimo. Alle Rechte vorbehalten.
          </p>
        </footer>

      </div>
    </div>
  )
}
