import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Lone Star Scholars CRM",
  description: "College Prep & Admissions Counseling CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#1B2D6E",
              color: "#fff",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
