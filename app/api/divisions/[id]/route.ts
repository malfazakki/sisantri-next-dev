import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const division = await prisma.division.findFirst({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
		});

		if (!division) {
			return NextResponse.json({ error: "Division not found" }, { status: 404 });
		}

		return NextResponse.json(division);
	} catch (error) {
		console.error("[DIVISION_GET]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const division = await prisma.division.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				name,
			},
		});

		if (division.count === 0) {
			return NextResponse.json({ error: "Division not found or not owned by organization" }, { status: 404 });
		}

		const updatedDivision = await prisma.division.findUnique({
			where: { id },
		});

		return NextResponse.json(updatedDivision);
	} catch (error) {
		console.error("[DIVISION_PATCH]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getAuthUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		// Soft delete
		const division = await prisma.division.updateMany({
			where: {
				id,
				organizationId: user.organizationId,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (division.count === 0) {
			return NextResponse.json({ error: "Division not found or not owned by organization" }, { status: 404 });
		}

		return NextResponse.json({ message: "Division deleted successfully" });
	} catch (error) {
		console.error("[DIVISION_DELETE]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
