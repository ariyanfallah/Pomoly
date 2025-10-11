import { UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { User } from "@supabase/supabase-js";
import { useAuth } from "~/contexts/AuthContext";

type UserDropdownProps = {
    user?: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
    const { signOut } = useAuth();
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <UserIcon />
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{user?.email}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuTrigger>
            </DropdownMenu>
        </div>
    )
}