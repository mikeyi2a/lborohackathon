import { MicIcon, Settings } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MicIcon className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold">VoiceFair</span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="mr-2"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}