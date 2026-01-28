import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const department = await prisma.department.findFirst({
      where: {
        id,
        division: {
          organizationId: user.organizationId,
        },
        deletedAt: null,
      },
      include: {
        division: true,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('[DEPARTMENT_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, divisionId } = body;

    // Check if the department exists and belongs to the user's organization
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id,
        division: {
          organizationId: user.organizationId,
        },
        deletedAt: null,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // If divisionId is being updated, verify ownership
    if (divisionId && divisionId !== existingDepartment.divisionId) {
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
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name ?? undefined,
        divisionId: divisionId ?? undefined,
      },
    });

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('[DEPARTMENT_PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const department = await prisma.department.findFirst({
      where: {
        id,
        division: {
          organizationId: user.organizationId,
        },
        deletedAt: null,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('[DEPARTMENT_DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
