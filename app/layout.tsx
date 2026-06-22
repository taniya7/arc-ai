import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arc AI",
  description: "Your intelligent development environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "var(--accent-primary)",
              colorBackground: "var(--bg-surface)",
              colorForeground: "var(--text-primary)",
              colorNeutral: "var(--text-secondary)",
              colorDanger: "var(--state-error)",
              colorSuccess: "var(--state-success)",
              colorWarning: "var(--state-warning)",
              colorInput: "var(--bg-elevated)",
              colorInputForeground: "var(--text-primary)",
              borderRadius: "var(--radius)",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
