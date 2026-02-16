import { NextResponse } from "next/server";
import { db } from "@/db";
import { guests, invites } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

/**
 * POST /api/admin/generate-invites
 * Generate invitation tokens for all guests
 * Body: { guests: [{ firstName, lastName, email }, ...] }
 */

const generateInviteSchema = z.object({
  guests: z.array(
    z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      dietaryRestrictions: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guests: guestData } = generateInviteSchema.parse(body);

    console.log(`Generating ${guestData.length} invites...`);

    // Clear existing guests + invites (for demo)
    await db.delete(guests);

    // Insert guests
    const insertedGuests = await db
      .insert(guests)
      .values(
        guestData.map((g) => ({
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          phone: g.phone,
          dietaryRestrictions: g.dietaryRestrictions,
          notes: g.notes,
        }))
      )
      .returning();

    console.log(`Inserted ${insertedGuests.length} guests`);

    // Generate invites with tokens
    const generatedInvites = await db
      .insert(invites)
      .values(
        insertedGuests.map((guest) => {
          const token = uuidv4();
          const url = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp?token=${token}`;
          return {
            guestId: guest.id,
            token,
            url,
          };
        })
      )
      .returning();

    console.log(`Generated ${generatedInvites.length} invites`);

    return NextResponse.json(
      {
        success: true,
        guestCount: insertedGuests.length,
        inviteCount: generatedInvites.length,
        invites: generatedInvites.map((inv) => ({
          ...inv,
          guest: insertedGuests.find((g) => g.id === inv.guestId),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error generating invites:", error);
    return NextResponse.json(
      { error: "Failed to generate invites" },
      { status: 500 }
    );
  }
}
