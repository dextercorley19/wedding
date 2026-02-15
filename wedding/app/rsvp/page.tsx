"use client"

import type React from "react"

import { useState } from "react"
import { Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

export default function RSVPPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // RSVP form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attendance: "",
    guestCount: "1",
    dietaryRestrictions: "",
    song: "",
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "wedding2025" || password.trim() !== "") {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Please enter your password")
    }
  }

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the RSVP data to your backend
    console.log("[v0] RSVP submitted:", formData)
    setSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="font-serif text-xl">
                Sami & Dexter
              </a>
              <div className="flex items-center gap-6">
                <a href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
                  Details
                </a>
                <a href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
                  Gallery
                </a>
                <a href="/rehearsal-dinner" className="text-sm hover:text-foreground/70 transition-colors">
                  Rehearsal Dinner
                </a>
                <a href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
                  RSVP
                </a>
                <a href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
                  Registry
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="font-serif text-4xl mb-2">RSVP</h1>
              <p className="text-muted-foreground">Please enter the password from your invitation</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Your password was included in your wedding invitation
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">(Dev password: wedding2025)</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="font-serif text-xl">
                Sami & Dexter
              </a>
              <div className="flex items-center gap-6">
                <a href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
                  Details
                </a>
                <a href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
                  Gallery
                </a>
                <a href="/rehearsal-dinner" className="text-sm hover:text-foreground/70 transition-colors">
                  Rehearsal Dinner
                </a>
                <a href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
                  RSVP
                </a>
                <a href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
                  Registry
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md px-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl mb-4">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {formData.attendance === "yes"
                ? "We're so excited to celebrate with you on our special day!"
                : "We'll miss you on our special day, but we understand."}
            </p>
            <Button asChild variant="outline">
              <a href="/">Return Home</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="font-serif text-xl">
              Sami & Dexter
            </a>
            <div className="flex items-center gap-6">
              <a href="/#details" className="text-sm hover:text-foreground/70 transition-colors">
                Details
              </a>
              <a href="/gallery" className="text-sm hover:text-foreground/70 transition-colors">
                Gallery
              </a>
              <a href="/rsvp" className="text-sm hover:text-foreground/70 transition-colors">
                RSVP
              </a>
              <a href="/registry" className="text-sm hover:text-foreground/70 transition-colors">
                Registry
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl mb-4">RSVP</h1>
            <p className="text-lg text-muted-foreground">Please respond by May 1, 2025</p>
          </div>

          <form onSubmit={handleRSVPSubmit} className="space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Attendance */}
            <div className="space-y-3">
              <Label>Will you be attending? *</Label>
              <RadioGroup value={formData.attendance} onValueChange={(value) => handleInputChange("attendance", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="font-normal cursor-pointer">
                    Joyfully accepts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="font-normal cursor-pointer">
                    Regretfully declines
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.attendance === "yes" && (
              <>
                {/* Guest Count */}
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Number of Guests *</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange("guestCount", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">Including yourself</p>
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-2">
                  <Label htmlFor="dietary">Dietary Restrictions or Allergies</Label>
                  <Textarea
                    id="dietary"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                    placeholder="Please let us know of any dietary restrictions..."
                    rows={3}
                  />
                </div>

                {/* Song Request */}
                <div className="space-y-2">
                  <Label htmlFor="song">Song Request</Label>
                  <Input
                    id="song"
                    type="text"
                    value={formData.song}
                    onChange={(e) => handleInputChange("song", e.target.value)}
                    placeholder="What song will get you on the dance floor?"
                  />
                </div>
              </>
            )}

            <Button type="submit" size="lg" className="w-full">
              Submit RSVP
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
