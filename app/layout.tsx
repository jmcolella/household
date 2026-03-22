import type { Metadata } from "next";
import { Zain } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const zain = Zain({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Household - Task Manager",
  description: "Manage household tasks and reminders with your housemates",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={zain.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
