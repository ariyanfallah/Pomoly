import { Link, Navigate, useLoaderData } from "react-router";
import { Settings } from "./Settings";
import type { Session } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { UserIcon } from "lucide-react";
import { UserDropdown } from "./UserDropdown";

export const Navbar = () => {
    const { session } = useLoaderData() as { session: Session | null };
    console.log(session);
    return (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        P
                    </div>
                    <h1 className="text-xl font-semibold">Pomolos</h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                    <Settings />
                    {session?.user ? 
                    (
                        <div className="">
                            <UserDropdown user={session.user} />
                        </div>
                    ) : (
                        <Link
                        to="/auth"
                        className="flex items-center gap-2"
                        >
                            <Button variant="outline" size="icon" className="rounded-full">Login</Button>
                        </Link>
                    )}
                    </div>
                    
                </div>
            </div>
        </header>   
    )
};