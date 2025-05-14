import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkApiKey, saveApiKey } from "@/lib/elevenlabs-api";

const formSchema = z.object({
  apiKey: z.string().min(10, {
    message: "API key is too short",
  }),
});

export function ApiKeyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("elevenlabs_api_key");
    if (savedKey) {
      form.setValue("apiKey", savedKey);
      setIsSuccess(true);
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    
    try {
      const isValid = await checkApiKey(values.apiKey);
      
      if (isValid) {
        saveApiKey(values.apiKey);
        setIsSuccess(true);
      } else {
        setError("Invalid API key. Please check and try again.");
      }
    } catch (err) {
      setError("Failed to validate API key. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ElevenLabs API Key</CardTitle>
        <CardDescription>
          Enter your ElevenLabs API key to enable voice transformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your ElevenLabs API key"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can find your API key in your{" "}
                    <a
                      href="https://elevenlabs.io/app/account"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      ElevenLabs account settings
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSuccess && !error && (
              <Alert className="mt-4 bg-green-50 text-green-900 border-green-200">
                <CheckIcon className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-700">
                  API key saved successfully
                </AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Save API Key"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
        <p>Your API key is stored locally in your browser and never sent to our servers.</p>
      </CardFooter>
    </Card>
  );
} 