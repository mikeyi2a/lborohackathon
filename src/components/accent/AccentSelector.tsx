import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Accent } from "../VoiceFairApp";

interface AccentSelectorProps {
  onAccentSelected: (accent: Accent) => void;
  selectedAccent: Accent | null;
  disabled?: boolean;
}

const AVAILABLE_ACCENTS: Accent[] = [
  {
    id: "british",
    name: "British",
    description: "Received Pronunciation (RP) accent from Southern England"
  },
  {
    id: "american",
    name: "American",
    description: "General American accent commonly heard in media"
  },
  {
    id: "indian",
    name: "Indian",
    description: "Indian English accent with characteristic intonation patterns"
  },
  {
    id: "australian",
    name: "Australian",
    description: "Australian English accent with distinctive vowels"
  },
  {
    id: "french",
    name: "French Accent",
    description: "English spoken with a French accent"
  },
  {
    id: "spanish",
    name: "Spanish Accent",
    description: "English spoken with a Spanish accent"
  },
  {
    id: "german",
    name: "German Accent",
    description: "English spoken with a German accent"
  },
  {
    id: "japanese",
    name: "Japanese Accent",
    description: "English spoken with a Japanese accent"
  },
  {
    id: "polish",
    name: "Polish Accent",
    description: "English spoken with a Polish accent"
  },
  {
    id: "irish",
    name: "Irish",
    description: "Irish English accent with distinctive intonation"
  }
];

export function AccentSelector({ 
  onAccentSelected, 
  selectedAccent,
  disabled = false 
}: AccentSelectorProps) {
  
  const handleAccentChange = (accentId: string) => {
    const accent = AVAILABLE_ACCENTS.find(a => a.id === accentId);
    if (accent) {
      onAccentSelected(accent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accent Selection</CardTitle>
        <CardDescription>
          Choose the target accent for transformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          disabled={disabled}
          value={selectedAccent?.id || ""}
          onValueChange={handleAccentChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an accent" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ACCENTS.map((accent) => (
              <SelectItem key={accent.id} value={accent.id}>
                {accent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedAccent && (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedAccent.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}