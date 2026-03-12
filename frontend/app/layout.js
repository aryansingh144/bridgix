import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'Bridgix — Alumni Student Network',
  description: 'Connect alumni and students for mentorship, placement assistance, and career guidance.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
