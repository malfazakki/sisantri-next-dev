import { AttendanceView } from "@/features/activity/components/attendance-view";

interface AttendancePageProps {
	params: {
		id: string;
	};
}

export const metadata = {
	title: "Take Attendance | Sisantri",
	description: "Record attendance for activity",
};

export default async function AttendancePage({ params }: AttendancePageProps) {
	const { id } = await params;
	return <AttendanceView activityId={id} />;
}
