import { MicIcon } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MicIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">VoiceFair</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}