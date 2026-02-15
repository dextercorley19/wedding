import { NextRequest, NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = rsvpSchema.parse(body);

    // TODO: Save to database when Drizzle schema is set up
    console.log("RSVP API received:", validated);

    return NextResponse.json(
      {
        success: true,
        message: "RSVP submitted successfully",
        data: validated,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
