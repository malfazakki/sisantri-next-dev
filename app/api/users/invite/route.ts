import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ADMIN
    if (!authUser.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, fullName, roleId, departmentId } = body;

    // Validation
    if (!email || !fullName || !roleId || !departmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if department exists and belongs to the same organization
    const department = await prisma.department.findFirst({
      where: { 
        id: departmentId,
        division: {
          organizationId: authUser.organizationId
        },
        deletedAt: null
      },
      include: { 
        division: true 
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found or belongs to another organization' }, { status: 404 });
    }

    // Default password: Password@123
    const defaultPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Generate empId (Example: INV-TIMESTAMP)
    const empId = `INV-${Date.now().toString().slice(-6)}`;

    // Transaction to create user, profile, and role
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          organizationId: authUser.organizationId,
        },
      });

      // 2. Create Profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          fullName,
          empId,
          organizationId: authUser.organizationId,
          divisionId: department.divisionId,
          departmentId: department.id,
        },
      });

      // 3. Assign Role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: roleId,
        },
      });

      return { user, profile, role };
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      message: 'User invited successfully',
      data: {
        user: userWithoutPassword,
        profile: result.profile,
        role: result.role,
      },
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('[USER_INVITE_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
