"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GeneratedInvite {
  id: string;
  token: string;
  url: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };
  qrDataUrl?: string;
}

export default function GenerateInvitesPage() {
  const [guestsCsv, setGuestsCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invites, setInvites] = useState<GeneratedInvite[]>([]);
  const [generated, setGenerated] = useState(false);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      // Parse CSV
      const lines = guestsCsv.trim().split("\n");
      const guests = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [firstName, lastName, email, phone, dietaryRestrictions, notes] =
            line.split(",").map((s) => s.trim());
          return {
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            dietaryRestrictions: dietaryRestrictions || undefined,
            notes: notes || undefined,
          };
        });

      if (guests.length === 0) {
        setError("No guests found. Please enter CSV data.");
        return;
      }

      // Call API
      const response = await fetch("/api/admin/generate-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate invites");
      }

      const result = await response.json();
      setInvites(result.invites);
      setGenerated(true);

      // Generate QR codes after invites are set
      setTimeout(async () => {
        for (const invite of result.invites) {
          try {
            const canvas = canvasRefs.current[invite.id];
            if (canvas) {
              await QRCode.toCanvas(canvas, invite.url, {
                width: 200,
                margin: 2,
                color: { dark: "#000", light: "#fff" },
              });
            }
          } catch (err) {
            console.error("Error generating QR code:", err);
          }
        }
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRs = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif mb-2">Generate Invitations</h1>
        <p className="text-muted-foreground mb-8">
          Upload guest list to generate QR code invitations
        </p>

        {!generated ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Guest List (CSV Format)
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Format: firstName, lastName, email, phone (optional), dietaryRestrictions (optional), notes (optional)
              </p>
              <Textarea
                placeholder="John, Doe, john@example.com, 555-1234
Jane, Smith, jane@example.com"
                value={guestsCsv}
                onChange={(e) => setGuestsCsv(e.target.value)}
                className="font-mono h-32"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleGenerate} disabled={loading} size="lg">
              {loading ? "Generating..." : "Generate Invites"}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif">
                  {invites.length} Invitations Generated
                </h2>
                <p className="text-muted-foreground">
                  Click below to print QR codes for your invitations
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  onClick={() => {
                    setGenerated(false);
                    setInvites([]);
                    setGuestsCsv("");
                  }}
                  variant="outline"
                >
                  Start Over
                </Button>
                <Button onClick={downloadQRs}>Print QR Codes</Button>
              </div>
            </div>

            {/* QR Code Grid - Print-friendly */}
            <div
              className="grid grid-cols-2 gap-8 md:grid-cols-3 print:grid-cols-4"
              id="qr-grid"
            >
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col items-center gap-4 p-4 border rounded-lg break-inside-avoid print:break-inside-avoid"
                >
                  <div className="text-center">
                    <p className="font-serif font-semibold">
                      {invite.guest.firstName} {invite.guest.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invite.guest.email}
                    </p>
                  </div>

                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[invite.id] = el;
                    }}
                    width={200}
                    height={200}
                    className="border"
                  />

                  <p className="text-xs text-center text-muted-foreground max-w-xs break-words">
                    {invite.url}
                  </p>
                </div>
              ))}
            </div>

            {/* Copy token list */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-serif mb-4">Token Reference</h3>
              <div className="bg-muted p-4 rounded font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
                {invites.map((invite) => (
                  <div key={invite.id}>
                    {invite.guest.firstName} {invite.guest.lastName}:{" "}
                    <code className="text-blue-600">{invite.token}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-grid,
          #qr-grid * {
            visibility: visible;
          }
          #qr-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
