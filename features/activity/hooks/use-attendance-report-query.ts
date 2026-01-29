import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

export interface AttendanceReportItem {
	id: number;
	name: string;
	stats: {
		present: number;
		sick: number;
		permission: number;
		absent: number;
		totalRegistered: number;
		totalPresent: number;
		percentage: number;
	};
}

export function useAttendanceReportQuery(dateRange: DateRange | undefined) {
	const fromStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
	const toStr = dateRange?.from ? format(dateRange.to || dateRange.from, "yyyy-MM-dd") : "";

	return useQuery({
		queryKey: ["attendance-report", fromStr, toStr],
		queryFn: async () => {
			const response = await api.get<AttendanceReportItem[]>(
				`/api/reports/attendance?from=${fromStr}&to=${toStr}`
			);
			return response.data;
		},
		enabled: !!dateRange?.from,
	});
}
