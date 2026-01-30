import * as React from 'react';

interface BookingEmailProps {
  guestName: string;
  courtName: string;
  date: string;
  time: string;
  price: number;
  orderId?: string; // Optional machen, falls wir es mal vergessen
}

export const BookingEmailTemplate: React.FC<Readonly<BookingEmailProps>> = ({
  guestName,
  courtName,
  date,
  time,
  price,
  orderId = "Bestellung #" + Math.floor(Math.random() * 100000) // Fallback Random ID
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#0f172a' }}>Buchung bestätigt! ✅</h1>
    <p>Hallo {guestName},</p>
    <p>Deine Platzbuchung war erfolgreich. Hier sind deine Details:</p>
    
    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
      <p style={{ margin: '5px 0' }}><strong>📍 Platz:</strong> {courtName}</p>
      <p style={{ margin: '5px 0' }}><strong>📅 Datum:</strong> {date}</p>
      <p style={{ margin: '5px 0' }}><strong>⏰ Uhrzeit:</strong> {time} Uhr</p>
      <p style={{ margin: '5px 0' }}><strong>💶 Preis:</strong> {price}€</p>
      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '10px 0' }} />
      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
        <strong>Bestell-Nr:</strong> {orderId}
      </p>
    </div>

    <p style={{ fontSize: '14px', color: '#666' }}>
      Bitte sei pünktlich vor Ort. Bei Fragen wende dich direkt an den Verein.
    </p>
  </div>
);