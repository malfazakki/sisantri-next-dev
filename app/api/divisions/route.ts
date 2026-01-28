import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const divisions = await prisma.division.findMany({
      where: {
        organizationId: user.organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(divisions);
  } catch (error) {
    console.error('[DIVISIONS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const division = await prisma.division.create({
      data: {
        name,
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json(division);
  } catch (error) {
    console.error('[DIVISIONS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
