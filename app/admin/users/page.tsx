/**
 * Admin Users List Page
 * Page for listing and managing users
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UsersListTable } from "@/features/users/components/users-list-table";
import { UsersFilters } from "@/features/users/components/users-filters";
import { UserEditFormDialog } from "@/features/users/components/user-edit-form-dialog";
import { UserDeactivateDialog } from "@/features/users/components/user-deactivate-dialog";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import {
  useUpdateUser,
  useDeactivateUser,
} from "@/features/users/hooks/use-user-mutations";
import type { ListUsersQuery, User, UpdateUserRequest } from "@/types";

export default function AdminUsersPage(): React.ReactElement {
  const router = useRouter();
   
  const [query, setQuery] = useState<ListUsersQuery>({
    page: 1,
    pageSize: 10,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const { data, isLoading, error } = useUsersList(query);
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();

  const handleView = (user: User): void => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleEdit = (user: User): void => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleDeactivate = (user: User): void => {
    setDeactivatingUser(user);
    setDeactivateDialogOpen(true);
  };

  const handleSaveEdit = async (
    userId: string,
    data: UpdateUserRequest,
  ): Promise<void> => {
    const mutationData: { userId: string; data: UpdateUserRequest } = {
      userId,
       
      data,
    };
    await updateUserMutation.mutateAsync(mutationData);
  };

  const handleConfirmDeactivate = async (userId: string): Promise<void> => {
    await deactivateUserMutation.mutateAsync(userId);
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <UsersFilters
         
        query={query}
        onQueryChange={setQuery}
      />

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error loading users: {error.message}
          </p>
        </div>
      ) : (
        <UsersListTable
          users={data?.users ?? []}
          loading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      )}

      <UserEditFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        onSave={handleSaveEdit}
      />

      <UserDeactivateDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        user={deactivatingUser}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}

