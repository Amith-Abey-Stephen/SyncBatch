import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SyncBatch – Sync Contacts from Excel to Phone Instantly',
  description: 'Upload Excel and sync contacts instantly to Android and iPhone. Built for students, teachers, and institutions.',
  keywords: ['sync contacts', 'excel to phone', 'contact sync', 'google contacts', 'vcf import', 'bulk contacts'],
  openGraph: {
    title: 'SyncBatch – Sync Contacts from Excel to Phone Instantly',
    description: 'Upload Excel and sync contacts instantly to Android and iPhone. Built for students, teachers, and institutions.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
              },
            }} 
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
