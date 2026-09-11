import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  COMPANY,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  rootJsonLd,
} from "@/lib/marketing/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${COMPANY.product}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: COMPANY.product,
  authors: [{ name: COMPANY.legalName, url: SITE_URL }],
  creator: COMPANY.legalName,
  publisher: COMPANY.legalName,
  keywords: [
    "devis B2B",
    "funnel de devis",
    "relance devis",
    "configurateur devis",
    "QuoteBuilder",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: COMPANY.product,
    title: `${DEFAULT_TITLE} · ${COMPANY.product}`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: absoluteUrl(OG_IMAGE), alt: COMPANY.product }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DEFAULT_TITLE} · ${COMPANY.product}`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = rootJsonLd();
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
