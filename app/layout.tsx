"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAuthenticated === "true" ? children : <RedirectToLogin />}
      </body>
    </html>
  );
}

const RedirectToLogin = () => {
  useEffect(() => {
    window.location.href = "/login";
  }, []);

  return <></>;
};
