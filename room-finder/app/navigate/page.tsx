"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Building {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function NavigationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const router = useRouter();

  // Building data with images and descriptions
  const buildings: Building[] = [
    {
      id: "ams-nest",
      name: "AMS Nest",
      description: "This is a fun description",
      image: "/pictures/nest clear.png"
    },
    {
      id: "henry-angus",
      name: "Henry Angus Building",
      description: "This is a fun description",
      image: "/pictures/sauder.png"
    },
    {
      id: "icics-cs",
      name: "ICICS/CS Building",
      description: "This is a fun description",
      image: "/pictures/icics.png"
    },
    {
      id: "student-life",
      name: "UBC Life Sciences Building",
      description: "This is a fun description",
      image: "/pictures/life.jpg"
    },
    {
      id: "irving-k-barber",
      name: "Irving K. Barber Library",
      description: "This is a fun description",
      image: "/pictures/ikb.jpg"
    },
    {
      id: "fred-kaiser",
      name: "Fred Kaiser Building",
      description: "This is a fun description",
      image: "/pictures/fred.jpg"
    },
    {
      id: "woodward-library",
      name: "Woodward Library",
      description: "This is a fun description",
      image: "/pictures/woodward.jpg"
    },
    {
      id: "walter-koerner",
      name: "Walter C. Koerner Library",
      description: "This is a fun description",
      image: "/pictures/koerner.jpg"
    }
  ];

  // Filter buildings based on search query
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuildingSelect = (building: Building) => {
    // Navigate to building detail page
    router.push(`/navigate/${building.id}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}

          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">FindMyRoom</h1>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-black mb-3">FindMyRoom</h1>
          <p className="text-lg font-semibold text-black mb-6">Ready to look for where to go?</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for buildings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Building Cards Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          {filteredBuildings.map((building) => (
            <Card
              key={building.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleBuildingSelect(building)}
            >
              <CardContent className="p-0">
                {/* Building Image */}
                <div className="relative">
                  <img
                    src={building.image}
                    alt={building.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='128' viewBox='0 0 200 128'%3E%3Crect width='200' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EImage placeholder%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Building Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-black text-sm mb-1 leading-tight">{building.name}</h3>
                      <p className="text-gray-500 text-xs">{building.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Options clicked for:", building.name);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Building Info */}
        {selectedBuilding && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">Selected: {selectedBuilding.name}</h3>
            </div>
            <p className="text-blue-700 text-xs mb-3">{selectedBuilding.description}</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8">
              Start Navigation to {selectedBuilding.name}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
