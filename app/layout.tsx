"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking authentication (could be from a session or context)
    const authState = sessionStorage.getItem("isAuthenticated"); // Or use cookies for more persistence
    setIsAuthenticated(authState === "true");
  }, []);

  if (isAuthenticated === null) {
    // Still loading/auth check
    return <div>Loading...</div>;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {isAuthenticated ? children : <RedirectToLogin router={router} />}
      </body>
    </html>
  );
}

const RedirectToLogin = ({ router }: { router: any }) => {
  useEffect(() => {
    router.push("/login");
  }, [router]);

  return <></>;
};
