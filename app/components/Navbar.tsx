import { Settings } from "./Settings";

export const Navbar = () => {
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
          </div>
        </div>
      </div>
    </header>
  );
};
