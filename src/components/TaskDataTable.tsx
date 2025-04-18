"use client";

import * as React from "react";
import {
  ColumnDef,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Task, User } from "@/types";
import { toast } from "sonner";

export function TaskDataTable() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch("http://localhost:3000/api/v1/task"),
        fetch("http://localhost:3000/api/v1/user"),
      ]);
      const [tasksData, usersData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tasks or users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userMap = React.useMemo(
    () => new Map(users.map((u) => [u.ID, u.name])),
    [users]
  );

  const assignUserToTask = React.useCallback(
    async (taskId: number, userId: number) => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/task/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        if (!res.ok) throw new Error("Failed to assign user");
        toast.success(`Assigned to ${userMap.get(userId)}`);
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Error assigning user");
      } finally {
        window.location.reload();
      }
    },
    [fetchData, userMap]
  );

  const deleteTask = React.useCallback(
    async (taskId: number, taskName: string) => {
      if (!window.confirm(`Delete task "${taskName}"?`)) return;
      try {
        const res = await fetch(`http://localhost:3000/api/v1/task/${taskId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete task");
        toast.success(`Deleted "${taskName}"`);
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Error deleting task");
      } finally {
        window.location.reload();
      }
    },
    [fetchData]
  );

  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Task Name",
      },
      {
        accessorKey: "points",
        header: () => <div className="text-right">Points</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.getValue<number>("points")}
          </div>
        ),
      },
      {
        accessorKey: "user_id",
        header: "User ID",
        cell: ({ row }) => <div>{row.getValue<number>("user_id")}</div>,
      },
      {
        id: "userName",
        header: "User",
        cell: ({ row }) => {
          const task = row.original;
          const name = userMap.get(task.user_id);
          if (task.user_id !== 0 && name) {
            return <div>{name}</div>;
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Assign to ▾
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Select User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map((u) => (
                  <DropdownMenuItem
                    key={u.ID}
                    onClick={() => assignUserToTask(task.ID, u.ID)}
                  >
                    {u.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const task = row.original;
          const isAssigned = userMap.has(task.user_id);

          return (
            <Button
              size="sm"
              variant={isAssigned ? "default" : "destructive"}
              className={
                isAssigned
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : undefined
              }
              onClick={() => deleteTask(task.ID, task.name)}
            >
              {isAssigned ? "Complete" : "Delete"}
            </Button>
          );
        },
      },
    ],
    [userMap, users, assignUserToTask, deleteTask]
  );

  const table = useReactTable<Task>({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full my-6">
      <h2 className="mb-4 text-xl font-semibold">Tasks</h2>
      <Input
        placeholder="Filter tasks..."
        onChange={(e) =>
          table.setColumnFilters([{ id: "name", value: e.target.value }])
        }
        className="max-w-sm mb-4"
      />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
