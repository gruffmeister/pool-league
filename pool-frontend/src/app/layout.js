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

export const metadata = {
  title: "Pool League Scoresheet",
  description: "",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="flex w-full h-100 justify-center items-center">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
