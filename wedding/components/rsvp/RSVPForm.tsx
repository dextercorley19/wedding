"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpFormSchema, type RSVPFormInput } from "@/db/zod/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { submitRsvp } from "@/app/actions/submitRsvp";
import { AlertCircle, CheckCircle } from "lucide-react";

export const RSVPForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<RSVPFormInput>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      attendance: undefined,
      guestCount: 1,
      dietaryRestrictions: "",
      allergies: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: RSVPFormInput) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      await submitRsvp({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        attendance: data.attendance,
        guestCount: data.guestCount,
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies,
        notes: data.notes,
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit RSVP");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">RSVP Received!</AlertTitle>
          <AlertDescription className="text-green-800">
            Thank you for responding. We can't wait to celebrate with you!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="First" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Last" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attendance */}
          <FormField
            control={form.control}
            name="attendance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Will you attend? *</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes, I'll be there!</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">Sorry, I can't make it</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest Count */}
          <FormField
            control={form.control}
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of guests (including yourself) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dietary Restrictions */}
          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary restrictions</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Vegetarian, Vegan, Gluten-free" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Allergies */}
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergies</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Peanuts, Shellfish, Dairy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Any additional notes?</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us anything else we should know!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
