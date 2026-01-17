import { Accent } from "../VoiceFairApp";
import { cn } from "@/lib/utils";
import { CheckCircle2, Play } from "lucide-react";
import { motion } from "motion/react";

interface AccentSelectorProps {
  onAccentSelected: (accent: Accent) => void;
  selectedAccent: Accent | null;
  disabled?: boolean;
}

// Enhanced accent data with categories, tags, and specific gradients
const AVAILABLE_ACCENTS: (Accent & { category: string; tags: string[]; gradient: string; disabled?: boolean })[] = [
  // Enabled Voices (Free)
  {
    id: "british",
    name: "British (RP)",
    description: "Received Pronunciation, professional and articulate",
    category: "European",
    tags: ["Professional", "Formal"],
    gradient: "from-blue-900 via-blue-700 to-red-700"
  },
  {
    id: "french",
    name: "French Accent",
    description: "English spoken with a melodic French cadence",
    category: "European",
    tags: ["Melodic"],
    gradient: "from-blue-700 via-blue-500 to-red-500"
  },
  {
    id: "german",
    name: "German Accent",
    description: "Precise and articulate German-accented English",
    category: "European",
    tags: ["Clear"],
    gradient: "from-neutral-900 via-red-800 to-yellow-600"
  },
  {
    id: "japanese",
    name: "Japanese Accent",
    description: "English spoken with a Japanese accent",
    category: "Asian",
    tags: ["Polite"],
    gradient: "from-red-700 to-pink-600"
  },

  // Disabled Voices (Premium)
  {
    id: "american",
    name: "General American",
    description: "Standard American accent, neutral and clear",
    category: "North American",
    tags: ["Pro", "Neutral"],
    gradient: "from-blue-700 via-blue-500 to-red-500",
    disabled: true
  },
  {
    id: "australian",
    name: "Australian",
    description: "Distinctive Australian vowels and intonation",
    category: "Oceania",
    tags: ["Pro", "Friendly"],
    gradient: "from-green-800 via-green-600 to-yellow-500",
    disabled: true
  },
  {
    id: "indian",
    name: "Indian English",
    description: "Clear Indian English with characteristic rhythm",
    category: "Asian",
    tags: ["Pro", "Distinctive"],
    gradient: "from-orange-600 via-orange-500 to-green-600",
    disabled: true
  },
  {
    id: "irish",
    name: "Irish",
    description: "Lyrical Irish accent",
    category: "European",
    tags: ["Pro", "Warm"],
    gradient: "from-green-700 via-white/20 to-orange-500",
    disabled: true
  },
  {
    id: "spanish",
    name: "Spanish Accent",
    description: "Warm Spanish-accented English",
    category: "European",
    tags: ["Pro", "Warm"],
    gradient: "from-red-700 via-yellow-500 to-red-700",
    disabled: true
  }
];

export function AccentSelector({
  onAccentSelected,
  selectedAccent,
  disabled = false
}: AccentSelectorProps) {

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_ACCENTS.map((accent) => {
          const isSelected = selectedAccent?.id === accent.id;
          const isItemDisabled = disabled || accent.disabled;

          return (
            <motion.div
              key={accent.id}
              whileHover={{ scale: isItemDisabled ? 1 : 1.03, y: isItemDisabled ? 0 : -2 }}
              whileTap={{ scale: isItemDisabled ? 1 : 0.98 }}
              className={cn(
                "relative group cursor-pointer rounded-2xl overflow-hidden bg-card border shadow-sm transition-all duration-300",
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 border-primary/20 shadow-md"
                  : "hover:shadow-lg border-border/50",
                isItemDisabled && "opacity-60 cursor-not-allowed grayscale-[0.8]"
              )}
              onClick={() => !isItemDisabled && onAccentSelected(accent)}
            >
              {/* Glossy Gradient Header (Partial) */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-28 bg-gradient-to-br transition-all duration-300 ",
                accent.gradient
              )} />

              {/* Glassmorphism Shine on Header */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-white/10 backdrop-blur-[1px]" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors pointer-events-none" />

              <div className="relative p-5 h-full flex flex-col justify-between min-h-[180px]">
                {/* Header Content (on gradient) */}
                <div className="flex justify-between items-start text-white z-10">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-inner text-white">
                    {accent.id.slice(0, 2).toUpperCase()}
                  </div>

                  {isSelected ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white text-primary rounded-full p-1 shadow-sm"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <div className={cn(
                      "opacity-0 transition-opacity duration-300 transform translate-x-2",
                      !isItemDisabled && "group-hover:opacity-100 group-hover:translate-x-0"
                    )}>
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-1.5 hover:bg-white/30 cursor-pointer">
                        <Play className="h-3.5 w-3.5 fill-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Content (on white/card bg) */}
                <div className="space-y-1.5 mt-8 pt-2 z-10">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {accent.tags.map(tag => (
                      <span key={tag} className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-border/50",
                        tag === "Pro"
                          ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          : "bg-muted/80 text-muted-foreground"
                      )}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                    {accent.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                    {accent.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}