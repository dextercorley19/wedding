"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rsvpFormSchema, type RSVPFormInput } from "@/db/zod/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { AlertCircle, CheckCircle, X } from "lucide-react";

export const RSVPForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [people, setPeople] = useState<RSVPFormInput[]>([]);

  const form = useForm<RSVPFormInput>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      attendance: undefined,
    },
  });

  const handleAddPerson = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    setPeople([...people, data]);
    form.reset();
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (people.length === 0) {
      setSubmitError("Please add at least one person");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await submitRsvp(people);

      setSubmitted(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
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
            Thank you for responding. We can't wait to celebrate with you! Redirecting...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Form to add people */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif mb-6">Add Guest</h2>

          <Form {...form}>
            <form className="space-y-4">
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
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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

              <Button
                type="button"
                onClick={handleAddPerson}
                className="w-full"
              >
                Add Person
              </Button>
            </form>
          </Form>
        </div>

        {/* Display added people */}
        {people.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-2xl font-serif">Added Guests ({people.length})</h2>
            {people.map((person, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {person.firstName} {person.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{person.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Attending: {person.attendance === "yes" ? "Yes" : "No"}
                  </p>
                </div>
                <button
                  onClick={() => removePerson(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Submit button - only show when people are added */}
        {people.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit All RSVPs"}
          </Button>
        )}
      </div>
    </div>
  );
};
