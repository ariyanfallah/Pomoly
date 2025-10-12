import { Link } from "react-router";
import { Settings } from "./Settings";
import { Button } from "./ui/button";
import { UserIcon } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-28">
                    <img 
                        src="/logo-full.svg" 
                        alt="Pomolos – Sessions that ship." 
                        className="h-32"
                    />
                    
                    <div className="flex items-center gap-2">
                    <Settings />
                    {user ? 
                    (
                        <div className="">
                            <UserDropdown user={user} />
                        </div>
                    ) : (
                        <Link
                        to="/auth"
                        className="flex items-center"
                        >
                            <Button variant="default" size="default" className="rounded-md">Login</Button>
                        </Link>
                    )}
                    </div>
                    
                </div>
            </div>
        </header>   
    )
};