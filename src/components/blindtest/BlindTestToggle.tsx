import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface BlindTestToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function BlindTestToggle({ enabled, onToggle }: BlindTestToggleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blind Test Mode</CardTitle>
        <CardDescription>
          Compare the original and transformed audio without knowing which is which
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch 
            id="blind-test-mode" 
            checked={enabled}
            onCheckedChange={onToggle}
          />
          <Label htmlFor="blind-test-mode">Enable Blind Test Mode</Label>
        </div>
      </CardContent>
    </Card>
  );
}