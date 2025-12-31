import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddUser,
  useDeleteUsers,
  useGetUsers,
} from "@/controllers/API/queries/auth";
import useAuthStore from "@/stores/authStore";
import useAlertStore from "@/stores/alertStore";
import { Users } from "@/types/api";
import { useEffect, useState } from "react";
import BaseModal from "@/modals/baseModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersPage(): JSX.Element {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);

  const [users, setUsers] = useState<Users[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: fetchUsers } = useGetUsers({});
  const { mutate: addUser } = useAddUser({});
  const { mutate: deleteUser } = useDeleteUsers({});

  const loadUsers = () => {
    fetchUsers(
      { skip: 0, limit: 100 },
      {
        onSuccess: (data: any) => {
          setUsers(data.users || []);
          setTotalCount(data.total_count || 0);
        },
        onError: (error: any) => {
          setErrorData({
            title: "Error loading users",
            list: [error?.response?.data?.detail || "Failed to load users"],
          });
        },
      }
    );
  };

  useEffect(() => {
    loadUsers();
  }, []);


  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorData({
        title: "Validation Error",
        list: ["Username and password are required"],
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorData({
        title: "Validation Error",
        list: ["Passwords do not match"],
      });
      return;
    }

    setIsLoading(true);
    addUser(
      { username: newUsername.trim(), password: newPassword.trim() },
      {
        onSuccess: () => {
          setSuccessData({ title: "User created successfully" });
          setIsAddModalOpen(false);
          setNewUsername("");
          setNewPassword("");
          setConfirmPassword("");
          loadUsers();
        },
        onError: (error: any) => {
          setErrorData({
            title: "Error creating user",
            list: [error?.response?.data?.detail || "Failed to create user"],
          });
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    deleteUser(
      { user_id: userId },
      {
        onSuccess: () => {
          setSuccessData({ title: "User deleted successfully" });
          loadUsers();
        },
        onError: (error: any) => {
          setErrorData({
            title: "Error deleting user",
            list: [error?.response?.data?.detail || "Failed to delete user"],
          });
        },
      }
    );
  };

  const isFormValid =
    newUsername.trim() !== "" &&
    newPassword.trim() !== "" &&
    newPassword === confirmPassword;

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ForwardedIconComponent name="Users" className="h-5 w-5" />
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage users and their permissions ({totalCount} users)
          </p>
        </div>
        {isAdmin && (
          <BaseModal
            open={isAddModalOpen}
            setOpen={setIsAddModalOpen}
            size="x-small"
          >
            <BaseModal.Trigger>
              <Button className="gap-2">
                <ForwardedIconComponent name="Plus" className="h-4 w-4" />
                Add User
              </Button>
            </BaseModal.Trigger>
            <BaseModal.Header description="Create a new user account">
              Add New User
            </BaseModal.Header>
            <BaseModal.Content>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    placeholder="Enter username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="text-xs text-destructive">
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>
            </BaseModal.Content>
            <BaseModal.Footer
              submit={{
                label: "Create User",
                loading: isLoading,
                disabled: !isFormValid || isLoading,
                onClick: handleAddUser,
              }}
            />
          </BaseModal>
        )}
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.is_superuser ? "Admin" : "User"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ForwardedIconComponent
                              name="MoreHorizontal"
                              className="h-4 w-4"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleDeleteUser(user.id, user.username)
                            }
                          >
                            <ForwardedIconComponent
                              name="Trash2"
                              className="mr-2 h-4 w-4"
                            />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
