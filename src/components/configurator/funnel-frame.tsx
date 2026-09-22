import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-funnel-display",
  display: "swap",
});

export function FunnelFrame({ children }: { children: React.ReactNode }) {
  return <div className={`${poppins.variable} min-h-full`}>{children}</div>;
}
