import * as React from 'react';

interface WelcomeMemberEmailProps {
  clubName: string;
  email: string;
  password: string;
  loginUrl: string;
}

export const WelcomeMemberEmailTemplate: React.FC<WelcomeMemberEmailProps> = ({
  clubName,
  email,
  password,
  loginUrl,
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#0f172a' }}>Willkommen im {clubName}! 🎉</h1>
    <p>Deine Mitgliedschaft wurde erfolgreich bestätigt.</p>
    
    <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>Dein Zugang zum Mitgliederbereich:</p>
      <p style={{ margin: '10px 0' }}>E-Mail: <strong>{email}</strong></p>
      <p style={{ margin: '10px 0' }}>Passwort: <strong>{password}</strong></p>
    </div>

    <p>Bitte logge dich ein und ändere dein Passwort.</p>

    <a href={loginUrl} style={{ background: '#0f172a', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
      Zum Login
    </a>
  </div>
);