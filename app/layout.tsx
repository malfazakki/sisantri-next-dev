import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/query-provider";
import { AuthSync } from "@/components/auth/auth-sync";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-plus-jakarta",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SiSantri - Organization Management",
	description: "Professional organization and user management system",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased`}>
				<ReactQueryProvider>
					<AuthSync />
					{children}
				</ReactQueryProvider>
			</body>
		</html>
	);
}
