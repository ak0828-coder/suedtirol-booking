import * as React from 'react';

interface BookingEmailProps {
  guestName: string;
  courtName: string;
  date: string;
  time: string;
  price: number;
}

// Das ist reines HTML/CSS für E-Mails (sieht etwas oldschool aus, muss aber so sein)
export const BookingEmailTemplate: React.FC<Readonly<BookingEmailProps>> = ({
  guestName,
  courtName,
  date,
  time,
  price,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.5' }}>
    <h1 style={{ color: '#e11d48' }}>Buchungsbestätigung 🎾</h1>
    <p>Hallo <strong>{guestName}</strong>,</p>
    <p>Deine Reservierung war erfolgreich! Hier sind die Details:</p>
    
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <p style={{ margin: '5px 0' }}>📍 <strong>Platz:</strong> {courtName}</p>
      <p style={{ margin: '5px 0' }}>📅 <strong>Datum:</strong> {date}</p>
      <p style={{ margin: '5px 0' }}>⏰ <strong>Uhrzeit:</strong> {time}</p>
      <p style={{ margin: '5px 0' }}>💰 <strong>Preis:</strong> {price}€ (bitte vor Ort zahlen)</p>
    </div>

    <p style={{ marginTop: '20px' }}>
      Falls du stornieren musst, melde dich bitte rechtzeitig beim Verein.
    </p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
    <p style={{ fontSize: '12px', color: '#888' }}>
      Tennis Club Vinschgau • Südtirol Booking System
    </p>
  </div>
);