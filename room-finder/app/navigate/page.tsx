"use client";

import { useState, useEffect } from "react";
import { SimpleCard, SimpleCardContent } from "@/components/ui/simple-card";
import { SimpleInput } from "@/components/ui/simple-input";
import { SimpleButton } from "@/components/ui/simple-button";
import { CornerAccentButton } from "@/components/ui/corner-accent-button";
import { Search, MapPin, ArrowLeft, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

interface Building {
  id: string;
  name: string;
  description: string;
  image: string | null; // Updated to allow null for image
  address: string; // Added address field
  floors: number; // Added floors field
}

export default function NavigationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: "ams-nest",
      name: "AMS Nest",
      description: "Student activity center with dining, study spaces, and event venues",
      image: "/pictures/nest clear.png",
      address: "",
      floors: 0
    },
    {
      id: "henry-angus",
      name: "Henry Angus Building",
      description: "Home to the Sauder School of Business with modern classrooms",
      image: "/pictures/sauder.png",
      address: "",
      floors: 0
    },
    {
      id: "icics-cs",
      name: "ICICS/CS Building",
      description: "Computer Science and engineering research facilities",
      image: "/pictures/icics.png",
      address: "",
      floors: 0
    },
    {
      id: "student-life",
      name: "UBC Life Sciences Building",
      description: "Biological sciences research and teaching laboratories",
      image: "/pictures/life.jpg",
      address: "",
      floors: 0
    },
    {
      id: "irving-k-barber",
      name: "Irving K. Barber Library",
      description: "Main research library with extensive collections and study areas",
      image: "/pictures/ikb.jpg",
      address: "",
      floors: 0
    },
    {
      id: "fred-kaiser",
      name: "Fred Kaiser Building",
      description: "Engineering and computer science building with labs",
      image: "/pictures/fred.jpg",
      address: "",
      floors: 0
    },
    {
      id: "woodward-library",
      name: "Woodward Library",
      description: "Health sciences library serving medicine and pharmacy",
      image: "/pictures/woodward.jpg",
      address: "",
      floors: 0
    },
    {
      id: "walter-koerner",
      name: "Walter C. Koerner Library",
      description: "Undergraduate library with collaborative study spaces",
      image: "/pictures/koerner.jpg",
      address: "",
      floors: 0
    }
  ]);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchBuildings = async () => {
  //     const { data, error } = await supabase
  //       .from("buildings")
  //       .select("id, name, address, floors");
  //     if (error) {
  //       console.error("Error fetching buildings:", error);
  //     } else {
  //       const formattedData = (data || []).map((building) => ({
  //         id: building.id,
  //         name: building.name,
  //         description: "No description available",
  //         image: null, // Leave image blank as requested
  //         address: JSON.stringify(building.address),
  //         floors: building.floors
  //       }));
  //       setBuildings((prevBuildings) => [...prevBuildings, ...formattedData]);
  //     }
  //   };

  //   fetchBuildings();
  // }, []);

  // Filter buildings based on search query
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuildingSelect = (building: Building) => {
    // Navigate to building detail page
    router.push(`/navigate/${building.id}`);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FDFDF5' }}>
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <SimpleButton
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-700 hover:bg-gray-100 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </SimpleButton>
          <div className="flex items-center gap-2">
            <img
              src="/pictures/flipaligator.svg"
              alt="alligator"
              className="w-[30px] pointer-events-none"
              style={{
                width: '30px',
              }}
            />
            {/* <span className="text-gray-700 text-sm font-medium">RoomiGator</span> */}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            RoomiGator
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Discover your destination at UBC
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <SimpleInput
              type="text"
              placeholder="Search buildings, departments, or facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm rounded-sm border-2"
            />
          </div>
        </div>

        {/* Building Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {filteredBuildings.map((building) => (
            <SimpleCard
              key={building.id}
              className="bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 rounded-sm border-2"
              onClick={() => handleBuildingSelect(building)}
            >
              <SimpleCardContent className="p-0">
                {/* Building Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={building.image || "/default-placeholder.png"}
                    alt={building.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='128' viewBox='0 0 200 128'%3E%3Crect width='200' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3EBuilding%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Building Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
                    {building.name}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                    {building.description}
                  </p>
                </div>
              </SimpleCardContent>
            </SimpleCard>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBuildings.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg font-medium mb-2">No buildings found</h3>
            <p className="text-gray-500 text-sm">
              Try searching with different keywords
            </p>
          </div>
        )}

        {/* Selected Building Info */}
        {selectedBuilding && (
          <div className="mt-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Selected: {selectedBuilding.name}</h3>
              </div>
              <p className="text-blue-700 text-sm mb-4 leading-relaxed">{selectedBuilding.description}</p>
              <CornerAccentButton
                className="w-full font-medium py-3 rounded-lg"
                onClick={() => handleBuildingSelect(selectedBuilding)}
              >
                Start Navigation
              </CornerAccentButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
