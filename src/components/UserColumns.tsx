import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User Name",
  },
  {
    accessorKey: "totalPoints",
    header: () => <div className="text-right">Total Points</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue<number>("totalPoints")}
      </div>
    ),
  },
  {
    id: "taskCount",
    header: () => <div className="text-center">Task Count</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.tasks ? row.original.tasks.length : 0}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Button
          variant="destructive"
          onClick={async () => {
            if (
              !window.confirm(
                `Are you sure you want to delete user "${user.name}"?`
              )
            ) {
              return;
            }
            try {
              const res = await fetch(
                `http://localhost:3000/api/v1/user/${user.ID}`,
                { method: "DELETE" }
              );
              if (!res.ok) {
                throw new Error("Failed to delete user");
              }
              toast(`User "${user.name}" deleted successfully.`);
              window.location.reload();
            } catch (error) {
              console.error("Error deleting user:", error);
              toast.error("Failed to delete user");
            }
          }}
        >
          Delete
        </Button>
      );
    },
  },
];

export default userColumns;
