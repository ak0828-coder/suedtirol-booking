import * as React from "react"

interface BookingEmailProps {
  guestName: string
  courtName: string
  date: string
  time: string
  price: number
  orderId?: string
  lang?: string
}

const copy = {
  de: {
    title: "Buchung bestätigt",
    hello: "Hallo",
    intro: "Deine Platzbuchung war erfolgreich. Wir freuen uns auf dein Spiel!",
    details_title: "DEINE DETAILS",
    court: "Platz",
    date: "Datum",
    time: "Uhrzeit",
    price: "Preis",
    order: "Bestell-Nr",
    outro: "Bitte sei pünktlich vor Ort. Bei Fragen wende dich direkt an den Verein.",
  },
  en: {
    title: "Booking confirmed",
    hello: "Hello",
    intro: "Your court booking was successful. We look forward to your match!",
    details_title: "YOUR DETAILS",
    court: "Court",
    date: "Date",
    time: "Time",
    price: "Price",
    order: "Order #",
    outro: "Please arrive on time. If you have questions, contact the club directly.",
  },
  it: {
    title: "Prenotazione confermata",
    hello: "Ciao",
    intro: "La tua prenotazione del campo è stata registrata. Ti aspettiamo!",
    details_title: "DETTAGLI",
    court: "Campo",
    date: "Data",
    time: "Orario",
    price: "Prezzo",
    order: "Ordine #",
    outro: "Ti preghiamo di arrivare puntuale. Per domande, contatta direttamente il club.",
  },
}

export const BookingEmailTemplate: React.FC<Readonly<BookingEmailProps>> = ({
  guestName,
  courtName,
  date,
  time,
  price,
  orderId = "ORDER-" + Math.floor(Math.random() * 100000),
  lang = "de",
}) => {
  const dict = copy[lang as "de" | "en" | "it"] || copy.de

  return (
    <div style={{ 
      backgroundColor: "#030504", 
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      padding: "40px 20px", 
      color: "#F9F8F4",
      minHeight: "100%"
    }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* Logo/Brand Area */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
           <div style={{ 
             display: "inline-block",
             width: "48px", 
             height: "48px", 
             borderRadius: "12px", 
             background: "linear-gradient(135deg, #CBBF9A 0%, #8A7B4D 100%)",
             marginBottom: "12px"
           }} />
           <div style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "0.2em", color: "#CBBF9A" }}>
             AVAÍMO PREMIUM
           </div>
        </div>

        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "900", 
          textAlign: "center", 
          marginBottom: "16px",
          letterSpacing: "-0.04em",
          color: "#FFFFFF"
        }}>
          {dict.title}
        </h1>
        
        <p style={{ 
          textAlign: "center", 
          fontSize: "16px", 
          color: "rgba(255,255,255,0.5)", 
          marginBottom: "40px",
          lineHeight: "1.6"
        }}>
          {dict.hello} {guestName},<br />
          {dict.intro}
        </p>

        {/* Details Card */}
        <div style={{ 
          backgroundColor: "#0A0D0C", 
          borderRadius: "24px", 
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "32px",
          marginBottom: "32px"
        }}>
          <div style={{ 
            fontSize: "10px", 
            fontWeight: "bold", 
            letterSpacing: "0.15em", 
            color: "#CBBF9A", 
            marginBottom: "24px",
            textAlign: "center"
          }}>
            {dict.details_title}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{dict.court}</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FFFFFF" }}>{courtName}</div>
          </div>

          <div style={{ display: "flex", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{dict.date}</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FFFFFF" }}>{date}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{dict.time}</div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FFFFFF" }}>{time}</div>
            </div>
          </div>

          <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{dict.price}</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#CBBF9A" }}>{price}€</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginBottom: "4px" }}>{dict.order}</div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{orderId}</div>
            </div>
          </div>
        </div>

        <p style={{ 
          textAlign: "center", 
          fontSize: "12px", 
          color: "rgba(255,255,255,0.3)", 
          lineHeight: "1.6",
          padding: "0 20px"
        }}>
          {dict.outro}
        </p>

        <div style={{ 
          marginTop: "60px", 
          textAlign: "center", 
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "30px"
        }}>
          <p style={{ fontSize: "10px", fontWeight: "bold", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
            POWERED BY AVAÍMO
          </p>
        </div>
      </div>
    </div>
  )
}
