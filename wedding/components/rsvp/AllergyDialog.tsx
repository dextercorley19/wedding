"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import { allergyLookupSchema, ALLERGY_NOTES_MAX, type AllergyLookupInput } from "@/db/zod/schema";
import { submitAllergyUpdate } from "@/app/actions/submitAllergyUpdate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY: AllergyLookupInput = { firstName: "", lastName: "", allergyNotes: "" };

/**
 * The FAQ's "I already RSVP'd and have an allergy" form.
 *
 * Guests who replied before the RSVP form asked about allergies can't edit
 * their own submission, so this finds it by name and attaches the note.
 */
export const AllergyDialog = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; showRsvpLink: boolean } | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<AllergyLookupInput>({
    resolver: zodResolver(allergyLookupSchema),
    defaultValues: EMPTY,
  });

  // Each opening starts fresh, so a previous answer or error never greets the
  // next guest on a shared laptop.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    form.reset(EMPTY);
    setError(null);
    setSaved(false);
  };

  const onSubmit = async (values: AllergyLookupInput) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await submitAllergyUpdate(values);

      if (!result.success) {
        setError({ message: result.error, showRsvpLink: result.reason === "not-found" });
        return;
      }

      setSaved(true);
    } catch {
      setError({
        message:
          "Sorry — we couldn't reach the server. Please check your connection and try again.",
        showRsvpLink: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-3">
          Tell us about an allergy
        </Button>
      </DialogTrigger>

      <DialogContent>
        {saved ? (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle className="mx-auto h-6 w-6 text-sage" aria-hidden="true" />
            <DialogTitle>Thank You</DialogTitle>
            <DialogDescription>
              We&rsquo;ve added it to your RSVP and passed it along to the kitchen.
            </DialogDescription>
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tell Us About an Allergy</DialogTitle>
              <DialogDescription>
                Already replied? Enter your name exactly as you sent it and we&rsquo;ll add this to
                your RSVP.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="suite-label text-xs">First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First" autoComplete="given-name" {...field} />
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
                        <FormLabel className="suite-label text-xs">Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Last" autoComplete="family-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allergyNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="suite-label text-xs">
                        Allergy or Restriction *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Let us know what to avoid — we'll pass it to the kitchen."
                          maxLength={ALLERGY_NOTES_MAX}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>We couldn&rsquo;t add it</AlertTitle>
                    <AlertDescription>
                      <span>{error.message}</span>
                      {error.showRsvpLink && (
                        <Link href="/rsvp" className="underline underline-offset-4">
                          Go to the RSVP form
                        </Link>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Sending..." : "Send"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
