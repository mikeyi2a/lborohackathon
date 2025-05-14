import { MicIcon, SettingsIcon } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MicIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">VoiceFair</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}