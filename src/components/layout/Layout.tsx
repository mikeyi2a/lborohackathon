import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  onSettingsClick?: () => void;
}

export function Layout({ children, onSettingsClick }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header onSettingsClick={onSettingsClick} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;