import { NextResponse } from "next/server";
import { db } from "@/db";
import { invites, guests } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/invites/validate?token=xyz
 * Validate an invitation token and return guest data
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find invite by token
    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token))
      .limit(1)
      .execute();

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      );
    }

    // Check if already used
    if (invite.rsvpedAt) {
      return NextResponse.json(
        { error: "This invitation has already been used" },
        { status: 400 }
      );
    }

    // Get guest data
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, invite.guestId!))
      .limit(1)
      .execute();

    if (!guest) {
      return NextResponse.json(
        { error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
      },
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
