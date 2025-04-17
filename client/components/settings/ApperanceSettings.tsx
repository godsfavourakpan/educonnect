"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Check, Save } from "lucide-react";

export function AppearanceSettings() {
  const { theme, setTheme, themes } = useTheme();
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  const handleSave = () => {
    // In a real app, you would save these settings to a user profile
    // For now, we'll just show a toast
    toast({
      title: "Settings saved",
      description: "Your appearance settings have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose a theme for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {themes.map((t) => (
              <div
                key={t.name}
                className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
                  theme === t.name ? "border-primary ring-2 ring-primary" : ""
                }`}
                onClick={() => setTheme(t.name)}
              >
                {theme === t.name && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div
                  className="mb-2 h-24 rounded-md"
                  style={{
                    backgroundColor:
                      t.name === "system"
                        ? "linear-gradient(to right, #f8fafc 50%, #0f172a 50%)"
                        : t.colors.background || "#ffffff",
                  }}
                >
                  <div
                    className="h-6 rounded-t-md"
                    style={{
                      backgroundColor:
                        t.name === "system"
                          ? "linear-gradient(to right, #0f172a 50%, #f8fafc 50%)"
                          : t.colors.accent || "#3b82f6",
                    }}
                  />
                </div>
                <div className="text-center text-sm font-medium">{t.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Settings</CardTitle>
          <CardDescription>
            Customize text appearance and readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <RadioGroup
              value={fontSize}
              onValueChange={setFontSize}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="small"
                  id="font-size-small"
                  className="sr-only"
                />
                <Label
                  htmlFor="font-size-small"
                  className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                    fontSize === "small" ? "border-primary" : ""
                  }`}
                >
                  <span className="text-sm">Small</span>
                  <span className="mt-2 text-xs">Aa</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="medium"
                  id="font-size-medium"
                  className="sr-only"
                />
                <Label
                  htmlFor="font-size-medium"
                  className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                    fontSize === "medium" ? "border-primary" : ""
                  }`}
                >
                  <span className="text-sm">Medium</span>
                  <span className="mt-2 text-sm">Aa</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="large"
                  id="font-size-large"
                  className="sr-only"
                />
                <Label
                  htmlFor="font-size-large"
                  className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                    fontSize === "large" ? "border-primary" : ""
                  }`}
                >
                  <span className="text-sm">Large</span>
                  <span className="mt-2 text-base">Aa</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Accessibility</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce the amount of animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better readability
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dyslexic-font">Dyslexic-friendly Font</Label>
                <p className="text-sm text-muted-foreground">
                  Use a font designed for readers with dyslexia
                </p>
              </div>
              <Switch
                id="dyslexic-font"
                checked={dyslexicFont}
                onCheckedChange={setDyslexicFont}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
