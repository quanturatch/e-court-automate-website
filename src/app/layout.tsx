import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";
import { ViewsProvider, ViewLabel } from "@/components/ViewsProvider";

const serif = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Court Automate — Quantura Technologies",
  description:
    "Windows software that looks up Indian eCourts cases by CNR, emails hearing status, and installs with one command. 15-day trial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ViewsProvider>
          <header className="site">
            <div className="wrap row">
              <a className="brand" href="/">
                <img src="/mark.png" alt="E-Court Automate" />
                <span>E-Court Automate</span>
              </a>
              <nav>
                <a href="#product">Product</a>
                <a href="#install">Install</a>
                <a href="#workflow">Workflow</a>
                <a href="#trial">Trial</a>
                <a href="#support">Support</a>
              </nav>
            </div>
          </header>
          {children}
          <footer className="site">
            <div className="wrap">
              <img src="/mark.png" alt="E-Court Automate" />
              <p>Developed by Quantura Technologies</p>
              <p>
                <a
                  className="site-link"
                  href="https://www.quanturatech.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.quanturatech.com
                </a>
              </p>
              <p>
                Total <ViewLabel />
              </p>
            </div>
          </footer>
        </ViewsProvider>
      </body>
    </html>
  );
}
