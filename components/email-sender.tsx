"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { Mail, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  emails: z.string().min(1, "At least one email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

const BATCH_SIZE = 5; // Number of emails to send at once.

export default function EmailSender() {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [sentEmails, setSentEmails] = useState(0);
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);

  const emailIndexRef = useRef(0); // Keeps track of the current email index.

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachments((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendEmailsBatch = async (
    emails: string[],
    data: any,
    attachments: File[]
  ) => {
    const attachmentPromises = attachments.map((file) =>
      file.arrayBuffer().then((buffer) => ({
        name: file.name,
        content: Buffer.from(buffer).toString("base64"),
      }))
    );

    const processedAttachments = await Promise.all(attachmentPromises);

    const emailPromises = emails.map((email) =>
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: data.subject,
          message: data.message,
          attachments: processedAttachments,
        }),
      })
    );

    await Promise.all(emailPromises);
  };

  const handleSendEmails = async (data: any) => {
    const emailList = data.emails
      .split(",")
      .map((email: string) => email.trim());
    setTotalEmails(emailList.length);
    setSentEmails(0);
    setSending(true);
    setProgress(0);

    for (let i = emailIndexRef.current; i < emailList.length; i += BATCH_SIZE) {
      if (paused) break;

      const batch = emailList.slice(i, i + BATCH_SIZE);
      setCurrentBatch(batch);

      try {
        await sendEmailsBatch(batch, data, attachments);
        setSentEmails((prev) => prev + batch.length);
        emailIndexRef.current = i + BATCH_SIZE; // Update index to next batch.
        setProgress(((i + BATCH_SIZE) / emailList.length) * 100);
      } catch (error) {
        console.error("Error sending batch:", error);
        break;
      }
    }

    if (!paused) {
      setSending(false);
      setCurrentBatch([]);
      emailIndexRef.current = 0; // Reset index after completion.
    }
  };

  const stopSending = () => {
    setPaused(true);
    setSending(false);
  };

  const resumeSending = async (data: any) => {
    setPaused(false);
    setSending(true);
    await handleSendEmails(data);
  };

  const onSubmit = async (data: any) => {
    setPaused(false);
    await handleSendEmails(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Emails</CardTitle>
        <CardDescription>
          Enter multiple email addresses separated by commas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Input
              id="emails"
              placeholder="email1@example.com, email2@example.com"
              {...register("emails")}
            />
            {errors.emails && (
              <p className="text-sm text-red-500">
                {errors.emails.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register("subject")} />
            {errors.subject && (
              <p className="text-sm text-red-500">
                {errors.subject.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} {...register("message")} />
            {errors.message && (
              <p className="text-sm text-red-500">
                {errors.message.message as string}
              </p>
            )}
          </div>

          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Drop the files here"
                : "Drag & drop files here, or click to select files"}
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>
                  {sentEmails} of {totalEmails} sent
                </span>
              </div>
              <div className="text-sm">
                Sending to batch: {currentBatch.join(", ")}
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="w-full"
              disabled={sending || paused}
            >
              {sending && !paused ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Emails
                </>
              )}
            </Button>

            {sending && (
              <Button
                type="button"
                className="w-full"
                variant="destructive"
                onClick={stopSending}
              >
                Stop
              </Button>
            )}

            {paused && (
              <Button
                type="button"
                className="w-full"
                onClick={handleSubmit(resumeSending)}
              >
                Resume
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
