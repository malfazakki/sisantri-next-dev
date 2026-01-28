import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      where: {
        division: {
          organizationId: user.organizationId,
        },
        deletedAt: null,
      },
      include: {
        division: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('[DEPARTMENTS_GET]', error);
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
    const { name, divisionId } = body;

    if (!name || !divisionId) {
      return NextResponse.json({ error: 'Name and Division ID are required' }, { status: 400 });
    }

    // Verify if division belongs to the user's organization
    const division = await prisma.division.findFirst({
      where: {
        id: divisionId,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!division) {
      return NextResponse.json({ error: 'Invalid Division ID or access denied' }, { status: 403 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        divisionId,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error('[DEPARTMENTS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
