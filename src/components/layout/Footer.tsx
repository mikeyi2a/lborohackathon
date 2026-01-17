export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-between gap-4 py-4 md:h-14 md:flex-row md:py-0">
        <div className="text-center text-xs text-muted-foreground md:text-left">
          © {new Date().getFullYear()} VoiceFair. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#" className="transition hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition hover:text-foreground">
            Terms
          </a>
          <a href="#" className="transition hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}