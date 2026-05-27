"use client";

import { useEffect, useState } from "react";
import { Clock, Image, Send, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Update } from "@/lib/google-sheets";

export default function UpdatesPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [photoLink, setPhotoLink] = useState("");
  const [target, setTarget] = useState<"all" | "confirmed">("confirmed");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Update[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch("/api/updates")
      .then((r) => r.json())
      .then(setHistory)
      .finally(() => setLoadingHistory(false));
  }, []);

  async function handleSend() {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          photoAlbumLink: photoLink.trim(),
          target,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      toast({
        title: "Update sent",
        description: `${data.smsSent} SMS · ${data.emailSent} email${data.emailSent !== 1 ? "s" : ""} delivered${data.errors > 0 ? ` · ${data.errors} failed` : ""}.`,
      });
      setMessage("");
      setPhotoLink("");
      fetch("/api/updates")
        .then((r) => r.json())
        .then(setHistory);
    } catch {
      toast({
        title: "Error",
        description: "Failed to send update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  const smsPreview = [
    `Grace & Noelvie Wedding: ${message || "Your message here…"}`,
    photoLink ? `Photos: ${photoLink}` : "",
    "Reply STOP to unsubscribe.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-1">Updates</h1>
        <p className="text-muted-foreground text-sm">
          Send wedding updates to guests via SMS and email
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="surface rounded-2xl p-6 space-y-5">
          <h2 className="font-medium text-lg">Compose</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share an update with your guests…"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Image className="w-4 h-4" />
              Photo Album Link
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              value={photoLink}
              onChange={(e) => setPhotoLink(e.target.value)}
              placeholder="https://photos.google.com/…"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Send to</label>
            <div className="flex gap-2">
              {(
                [
                  { value: "confirmed", label: "Confirmed only", Icon: UserCheck },
                  { value: "all", label: "All guests", Icon: Users },
                ] as const
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setTarget(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                    target === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full rounded-xl py-5"
            onClick={handleSend}
            disabled={sending || !message.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending…" : "Send Update"}
          </Button>
        </Card>

        <div className="space-y-4">
          <Card className="surface rounded-2xl p-6">
            <h2 className="font-medium text-lg mb-3">SMS Preview</h2>
            <div className="bg-muted rounded-2xl p-4 font-mono text-xs text-muted-foreground leading-relaxed break-words">
              {smsPreview}
            </div>
          </Card>

          <Card className="surface rounded-2xl p-6">
            <h2 className="font-medium text-lg mb-4">Send History</h2>
            {loadingHistory ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No updates sent yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {[...history].reverse().map((u, i) => (
                  <div key={i} className="border border-border rounded-xl p-3 space-y-1.5">
                    <p className="text-sm font-medium line-clamp-2">{u.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {u.date}
                      </span>
                      <span>→ {u.sentTo}</span>
                    </div>
                    {u.photoAlbumLink && (
                      <a
                        href={u.photoAlbumLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View album →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
