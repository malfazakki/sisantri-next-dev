import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserListData } from "../types";
import { format } from "date-fns";

interface UserTableProps {
  users: UserListData[];
}

export function UserTable({ users }: UserTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white shadow-soft overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[150px] text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-8 py-5">Employee ID</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 py-5">User</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 py-5">Email</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 py-5">Roles</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pr-8 py-5">Joined At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-medium italic">
                No users found in this organization.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group transition-all hover:bg-indigo-50/30 border-slate-100 cursor-default">
                <TableCell className="pl-8 py-5 font-mono text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {user.empId}
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-slate-50 group-hover:border-indigo-100 transition-all shadow-sm">
                        <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-tight">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-plus-jakarta">
                      {user.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-5 text-slate-500 font-medium text-sm">
                  {user.email}
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-slate-50/50 text-slate-600 border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8 py-5 text-sm font-bold text-slate-400 font-mono">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
