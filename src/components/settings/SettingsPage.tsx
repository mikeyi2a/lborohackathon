import { ApiKeyForm } from "./ApiKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="mt-6 space-y-6">
          <ApiKeyForm />
          
          <Card>
            <CardHeader>
              <CardTitle>About ElevenLabs API</CardTitle>
              <CardDescription>
                Information about using the ElevenLabs API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                VoiceFair uses the ElevenLabs Speech-to-Speech API to transform voices 
                between different accents while preserving emotional delivery.
              </p>
              <p>
                To use this feature, you'll need an ElevenLabs API key. 
                You can sign up for an account at{" "}
                <a 
                  href="https://elevenlabs.io" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  elevenlabs.io
                </a>
              </p>
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Usage Note</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        ElevenLabs API usage is billed based on processing time. 
                        Please be aware that transforming voices will consume your ElevenLabs credits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Preferences will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 