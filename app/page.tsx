"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import EmailSender from "@/components/email-sender";

export default function HomePage() {
 
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Bulk Email Sender
          </h1>
          <p className="text-lg text-gray-600">
            Send emails to multiple recipients with attachments
          </p>
          
        </div>
        <EmailSender />
      </div>
    </main>
  );
}
