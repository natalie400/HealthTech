import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clinic Scheduler",
  description: "Book and manage medical appointments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation Bar */}
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold">
                Clinic Scheduler
              </Link>
              
              <div className="flex gap-6">
                <Link href="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                <Link href="/appointments" className="hover:text-blue-200">
                  Appointments
                </Link>
                <Link href="/book-appointment" className="hover:text-blue-200">
                  Book
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}