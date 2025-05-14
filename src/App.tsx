import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import VoiceFairApp from '@/components/VoiceFairApp';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="voicefair-theme">
      <Layout>
        <VoiceFairApp />
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;