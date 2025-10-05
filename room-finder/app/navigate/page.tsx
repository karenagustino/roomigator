"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2 } from "lucide-react";

export default function NavigationPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>();

  // Example building list; you can expand later or fetch from an API
  const buildings = [
    "Buchanan Tower",
    "AQ (Academic Quadrangle)",
    "WMC (West Mall Centre)",
    "HSS (Health Sciences Centre)",
    "SFU Surrey - Cedar Building",
  ];

  const handleStartNavigation = () => {
    if (!selectedBuilding) return alert("Please select a building first!");
    // For now, just log; later integrate Mapbox and route rendering
    console.log("Navigating to:", selectedBuilding);
  };

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold">Start Indoor Navigation</h1>
        <p className="text-muted-foreground">
          Select the building you want to explore. You’ll be able to see rooms and paths on the map next.
        </p>

        {/* Building Selection */}
        <Card className="mx-auto max-w-md border border-border/60">
          <CardContent className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium text-lg">
              <Building2 className="h-6 w-6" />
              Select a Building
            </div>

            <Select onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a building..." />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((bld, idx) => (
                  <SelectItem key={idx} value={bld}>
                    {bld}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleStartNavigation}
            >
              Start Navigation
              <MapPin className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future map */}
        {selectedBuilding && (
          <div className="mt-10 rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-background aspect-[16/9] flex items-center justify-center text-muted-foreground">
            <p className="text-lg">Map of <strong>{selectedBuilding}</strong> will appear here</p>
          </div>
        )}
      </div>
    </main>
  );
}
