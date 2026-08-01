"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MEAL_OPTIONS, mealLabel, rsvpFormSchema, type RSVPFormInput } from "@/db/zod/schema";
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
import { FloralSprig } from "@/components/common/Floral";
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
      mealChoice: undefined,
    },
  });

  const attendance = form.watch("attendance");
  const isAttending = attendance === "yes";

  // Drop any dinner selection if a guest switches to "can't make it", so we
  // never submit a meal for someone who isn't coming.
  useEffect(() => {
    if (attendance === "no" && form.getValues("mealChoice")) {
      form.setValue("mealChoice", undefined, { shouldValidate: true });
    }
  }, [attendance, form]);

  const handleAddPerson = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    setPeople([...people, data]);
    setSubmitError("");
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

      const result = await submitRsvp(people);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setSubmitted(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setSubmitError(
        "Sorry — we couldn't reach the server. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="suite-frame px-8 py-12 text-center">
          <div className="relative space-y-4">
            <FloralSprig />
            <CheckCircle className="mx-auto h-6 w-6 text-sage" aria-hidden="true" />
            <h2 className="suite-script text-4xl">Thank You</h2>
            <p className="text-muted-foreground">
              Your reply has been received. We can&rsquo;t wait to celebrate with you!
            </p>
            <p className="suite-label text-xs text-muted-foreground">Returning to the site…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Form to add people */}
        <div className="suite-frame p-8 sm:p-10">
          <div className="relative">
            <h2 className="suite-script text-3xl mb-6">Add Guest</h2>

            <Form {...form}>
              <form className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="suite-label text-xs">First Name *</FormLabel>
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
                        <FormLabel className="suite-label text-xs">Last Name *</FormLabel>
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
                      <FormLabel className="suite-label text-xs">Email *</FormLabel>
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
                      <FormLabel className="suite-label text-xs">Will you attend? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Joyfully accepts</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">Regretfully declines</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dinner selection — only relevant for attending guests */}
                {isAttending && (
                  <FormField
                    control={form.control}
                    name="mealChoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="suite-label text-xs">Dinner Selection *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            className="gap-3"
                          >
                            {MEAL_OPTIONS.map((option) => (
                              // Radix renders each item as a button, which is not
                              // labelable — so we name it with aria-labelledby and
                              // forward label clicks manually.
                              <label
                                key={option.value}
                                onClick={() => field.onChange(option.value)}
                                data-state={field.value === option.value ? "checked" : "unchecked"}
                                className="flex cursor-pointer items-start gap-3 border border-border p-4 transition-colors hover:bg-accent/40 data-[state=checked]:border-hydrangea data-[state=checked]:bg-accent/50"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`meal-${option.value}`}
                                  aria-labelledby={`meal-${option.value}-name meal-${option.value}-desc`}
                                  className="mt-1"
                                />
                                <span className="space-y-1">
                                  <span
                                    id={`meal-${option.value}-name`}
                                    className="block font-medium text-foreground"
                                  >
                                    {option.name}
                                  </span>
                                  <span
                                    id={`meal-${option.value}-desc`}
                                    className="block text-sm font-normal text-muted-foreground"
                                  >
                                    {option.description}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="button" onClick={handleAddPerson} className="w-full">
                  Add Person
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Display added people */}
        {people.length > 0 && (
          <div className="space-y-3">
            <h2 className="suite-script text-3xl">Your Party ({people.length})</h2>
            {people.map((person, index) => (
              <div key={index} className="suite-frame p-5 flex items-start justify-between gap-4">
                <div className="relative">
                  <p className="font-medium text-foreground">
                    {person.firstName} {person.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{person.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {person.attendance === "yes" ? "Attending" : "Unable to attend"}
                  </p>
                  {person.attendance === "yes" && person.mealChoice && (
                    <p className="text-sm text-muted-foreground">
                      Dinner: {mealLabel(person.mealChoice)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removePerson(index)}
                  aria-label={`Remove ${person.firstName} ${person.lastName}`}
                  className="relative text-muted-foreground transition-colors hover:text-destructive"
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
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? "Submitting..." : "Send Our Reply"}
          </Button>
        )}
      </div>
    </div>
  );
};
