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

    console.log(`[ADMIN] Generating ${guestData.length} invites...`);
    console.log(`[ADMIN] DATABASE_URL exists:`, !!process.env.DATABASE_URL);

    // Insert guests (don't delete - just add new ones)
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

    console.log(`[ADMIN] Inserted ${insertedGuests.length} guests`);

    // Generate invites with tokens
    const generatedInvites = await db
      .insert(invites)
      .values(
        insertedGuests.map((guest) => {
          const token = uuidv4();
          const url = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp?token=${token}`;
          console.log(`[ADMIN] Generated token for ${guest.firstName}: ${token}`);
          return {
            guestId: guest.id,
            token,
            url,
          };
        })
      )
      .returning();

    console.log(`[ADMIN] Generated ${generatedInvites.length} invites`);

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
    console.error("[ADMIN] Error generating invites:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        error: "Failed to generate invites",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
