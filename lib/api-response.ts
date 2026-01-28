import { NextResponse } from "next/server";

export type ApiResponseStatus = "success" | "error";

export interface Pagination {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ApiResponse<T = unknown> {
	status: ApiResponseStatus;
	code: number;
	message: string;
	data?: T;
	pagination?: Pagination;
	errors?: unknown[];
}

export const createApiResponse = <T = unknown>({
	status,
	code,
	message,
	data,
	pagination,
	errors,
}: ApiResponse<T>) => {
	return NextResponse.json(
		{
			status,
			code,
			message,
			data,
			pagination,
			errors,
		},
		{ status: code }
	);
};

export const successResponse = <T = unknown>(
	data: T,
	message: string = "Success",
	code: number = 200,
	pagination?: Pagination
) => {
	return createApiResponse({
		status: "success",
		code,
		message,
		data,
		pagination,
	});
};

export const errorResponse = (
	message: string = "Internal Server Error",
	code: number = 500,
	errors?: unknown[]
) => {
	return createApiResponse({
		status: "error",
		code,
		message,
		errors,
	});
};
