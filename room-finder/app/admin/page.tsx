"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminPage() {
  const [buildings, setBuildings] = useState([
    { name: "Buchanan Tower", rooms: ["101", "102", "103"] },
    { name: "AQ (Academic Quadrangle)", rooms: ["A1", "A2", "A3"] },
  ]);

  const [newBuilding, setNewBuilding] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const addBuilding = () => {
    if (!newBuilding) return;
    setBuildings([...buildings, { name: newBuilding, rooms: [] }]);
    setNewBuilding("");
  };

  const addRoom = () => {
    if (!selectedBuilding || !newRoom) return;
    setBuildings(
      buildings.map((b) =>
        b.name === selectedBuilding ? { ...b, rooms: [...b.rooms, newRoom] } : b
      )
    );
    setNewRoom("");
  };

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center">Admin Dashboard</h1>

        {/* Add New Building */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Add a New Building</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Building Name"
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
              />
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={addBuilding}
              >
                Add Building
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Room Card */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Add a New Room</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Shadcn Select for Buildings */}
              <Select onValueChange={(value) => setSelectedBuilding(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue
                    placeholder="Select Building"
                    value={selectedBuilding}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Buildings</SelectLabel>
                    {buildings.map((bld) => (
                      <SelectItem key={bld.name} value={bld.name}>
                        {bld.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Room Input */}
              <Input
                placeholder="Room Name/Number"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              />

              {/* Add Room Button */}
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={addRoom}
              >
                Add Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Buildings & Rooms List */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Buildings & Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {buildings.map((b) => (
                  <div key={b.name} className="p-4 border rounded-md">
                    <h3 className="font-semibold text-lg">{b.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {b.rooms.length > 0 ? (
                        b.rooms.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-1 bg-primary/20 text-primary rounded-full text-sm"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No rooms yet
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
