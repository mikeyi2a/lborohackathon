import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import VoiceFairApp from '@/components/VoiceFairApp';
import { useState } from 'react';
import { SettingsPage } from '@/components/settings/SettingsPage';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="voicefair-theme">
      <Layout onSettingsClick={handleSettingsClick}>
        {showSettings ? (
          <SettingsPage onBack={() => setShowSettings(false)} />
        ) : (
          <VoiceFairApp />
        )}
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;