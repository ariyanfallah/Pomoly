import { UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { User } from "@supabase/supabase-js";
import { Form, useNavigation } from "react-router";

type UserDropdownProps = {
    user?: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
    const navigation = useNavigation();
    const isLoggingOut = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'logout';

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{user?.email}</DropdownMenuItem>
                    <Form method="post" action="/auth">
                        <input type="hidden" name="intent" value="logout" />
                        <DropdownMenuItem 
                            asChild
                            disabled={isLoggingOut}
                        >
                            <button type="submit" className="w-full text-left cursor-pointer">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </DropdownMenuItem>
                    </Form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}