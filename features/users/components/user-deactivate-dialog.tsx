/**
 * User Deactivate Confirmation Dialog
 * Confirmation dialog for deactivating user accounts
 */

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import type { User } from "@/types";
import { UserRole } from "@/types/auth.types";

interface UserDeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (userId: string) => Promise<void>;
}

export function UserDeactivateDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UserDeactivateDialogProps): React.ReactElement {
  if (!user) return <></>;

  const handleConfirm = async (): Promise<void> => {
    await onConfirm(user.id);
    onOpenChange(false);
  };

  const isAdmin = user.role === UserRole.ADMIN;
  const isAlreadyInactive = !user.isActive;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>
              {isAlreadyInactive ? "User Already Inactive" : "Deactivate User"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {isAdmin ? (
              <>
                <strong>Warning:</strong> You cannot deactivate an admin user.
                Please contact a system administrator.
              </>
            ) : isAlreadyInactive ? (
              <>
                The user <strong>{user.fullName}</strong> ({user.email}) is
                already inactive.
              </>
            ) : (
              <>
                Are you sure you want to deactivate{" "}
                <strong>{user.fullName}</strong> ({user.email})? This will
                prevent them from logging in to their account.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isAdmin && !isAlreadyInactive && (
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate User
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

