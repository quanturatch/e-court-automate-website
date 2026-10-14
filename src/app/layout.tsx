import type { Metadata } from "next";
import { ViewsProvider } from "@/components/ViewsProvider";
import { getStats } from "@/lib/stats";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Court Automate — Legal Case Monitoring & Automation",
  description:
    "E-Court Automate helps advocates, chambers, law firms and legal teams monitor Indian eCourts cases using CNR numbers, automate status alerts, and keep hearings organized. 60-day trial.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initial = { views: 0, copies: 0 };
  try {
    initial = await getStats();
  } catch {
    /* keep zeros */
  }
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#02050b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Lato:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800;900&family=Josefin+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ViewsProvider initial={initial}>{children}</ViewsProvider>
      </body>
    </html>
  );
}
