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
    <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-950">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[150px]">Employee ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Joined At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No users found in this organization.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group transition-colors">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {user.empId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-zinc-100 dark:border-zinc-800">
                      <AvatarFallback className="bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {user.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="rounded-md px-2 py-0 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
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
