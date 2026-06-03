import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import sql from '@/lib/db';

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address').transform(value => value.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'seller']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid signup details' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await sql`
      INSERT INTO users (email, name, role, password_hash)
      VALUES (${email}, ${name}, ${role}, ${passwordHash})
      RETURNING id, email, name, role, created_at
    `;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup failed:', error);
    const message = error instanceof Error ? error.message : 'Unable to create account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}