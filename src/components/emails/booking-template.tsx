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
    title: "Buchung bestätigt!",
    hello: "Hallo",
    intro: "Deine Platzbuchung war erfolgreich. Hier sind deine Details:",
    court: "Platz",
    date: "Datum",
    time: "Uhrzeit",
    price: "Preis",
    order: "Bestell-Nr",
    outro: "Bitte sei pünktlich vor Ort. Bei Fragen wende dich direkt an den Verein.",
  },
  en: {
    title: "Booking confirmed!",
    hello: "Hello",
    intro: "Your court booking was successful. Here are your details:",
    court: "Court",
    date: "Date",
    time: "Time",
    price: "Price",
    order: "Order #",
    outro: "Please arrive on time. If you have questions, contact the club directly.",
  },
  it: {
    title: "Prenotazione confermata!",
    hello: "Ciao",
    intro: "La tua prenotazione del campo è stata registrata. Ecco i dettagli:",
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
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#333" }}>
      <h1 style={{ color: "#0f172a" }}>{dict.title}</h1>
      <p>{dict.hello} {guestName},</p>
      <p>{dict.intro}</p>

      <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
        <p style={{ margin: "5px 0" }}><strong>📍 {dict.court}:</strong> {courtName}</p>
        <p style={{ margin: "5px 0" }}><strong>📅 {dict.date}:</strong> {date}</p>
        <p style={{ margin: "5px 0" }}><strong>⏰ {dict.time}:</strong> {time}</p>
        <p style={{ margin: "5px 0" }}><strong>💶 {dict.price}:</strong> {price}€</p>
        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "10px 0" }} />
        <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
          <strong>{dict.order}:</strong> {orderId}
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#666" }}>
        {dict.outro}
      </p>
    </div>
  )
}
