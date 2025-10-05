"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@/lib/saveRoom";
import { saveRoomToSupabase } from "@/lib/saveRoom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Plus, Trash2, Layers, Search } from "lucide-react";

import type { BuildingRow, FloorRow, RoomRow, Database } from "@/lib/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const LOCAL_KEYS = {
  BUILDING: "admin_selected_building",
  FLOOR: "admin_selected_floor",
};

export default function AdminMapEditor() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  // Flat DB-like state
  const [buildings, setBuildings] = useState<BuildingRow[]>([]);
  const [floors, setFloors] = useState<FloorRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);

  // selection state (persisted)
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingRow | null>(
    null
  );
  const [selectedFloor, setSelectedFloor] = useState<FloorRow | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRow | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // form state
  const [newBuilding, setNewBuilding] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
  });
  const [newRoom, setNewRoom] = useState<any>({
    number: "",
    name: "",
    type: "classroom",
    accessible: false,
    capacity: "",
    description: "",
    // coordinates or geo_json set by draw or click
  });

  // ---------- init sample data & map ----------
  useEffect(() => {
    loadSampleData();

    if (!hasMapbox) return;
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-122.9199, 49.2781],
      zoom: 17,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: { point: true, polygon: true, line_string: true, trash: true },
      styles: [
        {
          id: "room-point",
          type: "circle",
          paint: {
            "circle-radius": 8,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        },
        {
          id: "room-polygon",
          type: "fill",
          paint: { "fill-color": "#3b82f6", "fill-opacity": 0.3 },
        },
        {
          id: "room-polygon-stroke",
          type: "line",
          paint: { "line-color": "#3b82f6", "line-width": 2 },
        },
      ],
    });

    map.current.addControl(draw.current);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("draw.create", handleDrawCreate);
    map.current.on("draw.update", handleDrawUpdate);
    map.current.on("draw.delete", handleDrawDelete);
    map.current.on("click", handleMapClick);
  }, [hasMapbox]);

  // ---------- persistence helpers ----------
  useEffect(() => {
    // restore persisted selection after sample data loads
    const bIdRaw = localStorage.getItem(LOCAL_KEYS.BUILDING);
    const fIdRaw = localStorage.getItem(LOCAL_KEYS.FLOOR);
    const bId = bIdRaw ? Number(bIdRaw) : null;
    const fId = fIdRaw ? Number(fIdRaw) : null;
    if (bId != null && !Number.isNaN(bId)) {
      const b = buildings.find((x) => x.id === bId);
      if (b) setSelectedBuilding(b);
    }
    if (fId != null && !Number.isNaN(fId)) {
      const f = floors.find((x) => x.id === fId);
      if (f) setSelectedFloor(f);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings.length, floors.length]);

  const persistSelection = (
    building?: BuildingRow | null,
    floor?: FloorRow | null
  ) => {
    if (building) localStorage.setItem(LOCAL_KEYS.BUILDING, String(building.id));
    if (floor) localStorage.setItem(LOCAL_KEYS.FLOOR, String(floor.id));
  };

  // ---------- small helpers ----------
  const getAddrLine = (b: BuildingRow) => {
    const a = b.address as any;
    return a?.line1 ?? a?.address ?? JSON.stringify(a ?? "");
  };

  const extractRoomProps = (r: RoomRow) => {
    const props = (r.json as any)?.properties ?? {};
    const coords =
      (r.json as any)?.geometry?.coordinates ?? (r.json as any)?.coordinates ?? null;
    return { props, coords };
  };

  // ---------- sample data ----------
  const loadSampleData = () => {
    // numeric IDs to match DB shape
    const b1: BuildingRow = {
      id: 1,
      created_at: new Date().toISOString(),
      name: "Academic Quadrangle",
      address: { line1: "8888 University Dr, Burnaby, BC" },
      floors: 2,
      json: {},
    };

    const f1: FloorRow = {
      id: 10,
      name: "Ground Floor",
      building_id: b1.id,
      created_at: new Date().toISOString(),
      rooms: 2,
      json: {},
    };
    const f2: FloorRow = {
      id: 11,
      name: "Second Floor",
      building_id: b1.id,
      created_at: new Date().toISOString(),
      rooms: 1,
      json: {},
    };

    const r1: RoomRow = {
      id: 100,
      name: "Main Lecture Hall",
      floor_id: f1.id,
      json: {
        type: "Feature",
        properties: {
          roomNumber: "AQ 1001",
          type: "classroom",
          accessible: true,
          capacity: 200,
          description: "Large lecture hall with AV equipment",
        },
        geometry: { type: "Point", coordinates: [-122.9195, 49.2783] },
      },
      created_at: new Date().toISOString(),
    };
    const r2: RoomRow = {
      id: 101,
      name: "Computer Lab",
      floor_id: f1.id,
      json: {
        type: "Feature",
        properties: {
          roomNumber: "AQ 1002",
          type: "lab",
          accessible: true,
          capacity: 30,
        },
        geometry: { type: "Point", coordinates: [-122.9197, 49.2781] },
      },
      created_at: new Date().toISOString(),
    };
    const r3: RoomRow = {
      id: 102,
      name: "Faculty Office",
      floor_id: f2.id,
      json: {
        type: "Feature",
        properties: {
          roomNumber: "AQ 2001",
          type: "office",
          accessible: true,
          capacity: 4,
        },
        geometry: { type: "Point", coordinates: [-122.9193, 49.2785] },
      },
      created_at: new Date().toISOString(),
    };

    setBuildings([b1]);
    setFloors([f1, f2]);
    setRooms([r1, r2, r3]);
    setSelectedBuilding(b1);
    setSelectedFloor(f1);
    persistSelection(b1, f1);
  };

  // ---------- Map handlers ----------
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isEditing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    setNewRoom((p: any) => ({ ...p, coordinates: { x, y } }));
    console.log("[SVG CLICK]", { x, y });
  };

  const handleDrawCreate = (e: any) => {
    const feature = e.features?.[0];
    if (!feature) return;
    setNewRoom((p: any) => ({ ...p, json: feature }));
    if (feature.geometry?.type === "Point") {
      const [x, y] = feature.geometry.coordinates;
      setNewRoom((p: any) => ({ ...p, coordinates: { x, y } }));
    }
    console.log("[DRAW CREATE]", feature);
  };

  const handleDrawUpdate = (e: any) => {
    const feature = e.features?.[0];
    if (feature) {
      setNewRoom((p: any) => ({ ...p, json: feature }));
      if (feature.geometry?.type === "Point") {
        const [x, y] = feature.geometry.coordinates;
        setNewRoom((p: any) => ({ ...p, coordinates: { x, y } }));
      }
    }
    console.log("[DRAW UPDATE]", e.features);
  };

  const handleDrawDelete = (e: any) => {
    console.log("[DRAW DELETE]", e.features);
    setNewRoom((p: any) => {
      const { number, name, type, accessible, capacity, description } = p;
      return { number, name, type, accessible, capacity, description };
    });
  };

  const handleMapClick = (e: any) => {
    if (!isEditing) return;
    const lng = e.lngLat?.lng;
    const lat = e.lngLat?.lat;
    if (typeof lng === "number" && typeof lat === "number") {
      setNewRoom((p: any) => ({ ...p, coordinates: { x: lng, y: lat } }));
      console.log("[MAP CLICK]", { lng, lat });
    }
  };

  // ---------- CRUD handlers ----------
  const handleAddBuilding = () => {
    if (!newBuilding.name || !newBuilding.address) return;
    const id = Date.now();
    const b: BuildingRow = {
      id,
      created_at: new Date().toISOString(),
      name: newBuilding.name,
      address: { line1: newBuilding.address, lat: newBuilding.lat || undefined, lng: newBuilding.lng || undefined },
      floors: 0,
      json: {},
    };
    console.log("[BUILDING ADD]", b);
    setBuildings((p) => [...p, b]);
    setSelectedBuilding(b);
    persistSelection(b, selectedFloor || null);
    setNewBuilding({ name: "", address: "", lat: "", lng: "" });
  };

  const handleAddFloor = () => {
    if (!selectedBuilding) {
      console.warn("Select a building first");
      return;
    }
    const id = Date.now();
    const floor: FloorRow = {
      id,
      name: `Floor ${floors.filter((f) => f.building_id === selectedBuilding.id).length + 1}`,
      building_id: selectedBuilding.id,
      created_at: new Date().toISOString(),
      rooms: 0,
      json: {},
    };
    console.log("[FLOOR ADD]", floor);
    setFloors((p) => [...p, floor]);
    // update denormalized floors count on building
    setBuildings((p) =>
      p.map((b) => (b.id === selectedBuilding.id ? { ...b, floors: (b.floors || 0) + 1 } : b))
    );
    setSelectedFloor(floor);
    persistSelection(selectedBuilding, floor);
    setRooms((prev) => prev.filter((r) => r.floor_id !== floor.id)); // defensive
  };

  const handleAddRoom = async () => {
    // Enforce presence of building and floor
    if (!selectedBuilding) {
      console.warn("Cannot add room: no building selected");
      return;
    }
    if (!selectedFloor) {
      console.warn("Cannot add room: no floor selected");
      return;
    }
    if (!newRoom.number || !newRoom.name) {
      console.warn("Cannot add room: number & name required");
      return;
    }

    const pendingCoords = newRoom.coordinates as { x: number; y: number } | undefined;
    const featureFromDraw = newRoom.json as any | undefined;

    if (!pendingCoords && !featureFromDraw) {
      console.warn("Cannot add room: no coordinates or drawn geometry");
      return;
    }

    const geoFeature =
      featureFromDraw?.type === "Feature"
        ? {
            ...featureFromDraw,
            properties: {
              ...(featureFromDraw.properties || {}),
              roomNumber: newRoom.number,
              roomName: newRoom.name,
              type: newRoom.type,
              accessible: newRoom.accessible,
              capacity: newRoom.capacity ? parseInt(newRoom.capacity) : undefined,
              description: newRoom.description,
            },
          }
        : {
            type: "Feature" as const,
            properties: {
              roomNumber: newRoom.number,
              roomName: newRoom.name,
              type: newRoom.type,
              accessible: newRoom.accessible,
              capacity: newRoom.capacity ? parseInt(newRoom.capacity) : undefined,
              description: newRoom.description,
            },
            geometry: {
              type: "Point" as const,
              coordinates: pendingCoords ? [pendingCoords.x, pendingCoords.y] : [0, 0],
            },
          };

    const roomId = Date.now();
    const room: RoomRow = {
      id: roomId,
      name: newRoom.name,
      floor_id: selectedFloor.id,
      json: geoFeature as unknown as Database["public"]["Tables"]["rooms"]["Row"]["json"],
      created_at: new Date().toISOString(),
    };

    const payload = {
      building: selectedBuilding,
      floor: selectedFloor,
      room,
      feature: geoFeature,
      featureCollection: { type: "FeatureCollection" as const, features: [geoFeature] },
    };

    // 1) Print out the data when Add Room is clicked
    console.log("[ADD ROOM] payload:", payload);

    // 2) Save to supabase (placeholder file you provided)
    const result = await saveRoomToSupabase(selectedBuilding, selectedFloor, room);

    if (result?.error) {
      console.warn("[SAVE FAILED]", result.error);
      // fallback: add the local room object so UI isn't blocked
      setRooms((p) => [...p, room]);
    } else if (result?.data) {
      const { building: savedB, floor: savedF, room: savedRoom } = result.data;
      console.log("[SAVE OK] savedRoom:", savedRoom);

      // Upsert building in local state (building.floors is a number)
      setBuildings((prev) => {
        const found = prev.find((x) => x.id === savedB.id);
        if (found) return prev.map((x) => (x.id === savedB.id ? savedB : x));
        return [...prev, savedB];
      });

      // Upsert floor
      setFloors((prev) => {
        const found = prev.find((x) => x.id === savedF.id);
        if (found) return prev.map((x) => (x.id === savedF.id ? savedF : x));
        return [...prev, savedF];
      });

      // Add room returned from DB
      setRooms((p) => [...p, savedRoom]);

      // keep selected building/floor persistent
      setSelectedBuilding(savedB);
      setSelectedFloor(savedF);
      persistSelection(savedB, savedF);
    }

    // increment room count locally for the selected floor
    setFloors((prev) => prev.map((f) => (f.id === selectedFloor.id ? { ...f, rooms: (f.rooms || 0) + 1 } : f)));

    // keep building/floor selected but clear room inputs
    setNewRoom({ number: "", name: "", type: "classroom", accessible: false, capacity: "", description: "" });

    // add to draw layer for feedback
    if (draw.current) {
      try {
        draw.current.add(geoFeature);
      } catch (err) {
        console.warn("draw.add failed:", err);
      }
    }
  };

  const handleDeleteRoom = (roomId: number) => {
    setRooms((p) => p.filter((r) => r.id !== roomId));
    if (selectedFloor) {
      setFloors((prev) =>
        prev.map((f) =>
          f.id === selectedFloor.id ? { ...f, rooms: Math.max(0, (f.rooms || 1) - 1) } : f
        )
      );
    }
    // remove from draw if exists
    if (draw.current) {
      const all = draw.current.getAll();
      const found = all.features.find((ft: any) => {
        const props = ft.properties || {};
        return props.roomId === roomId || props.roomNumber === roomId || ft.id === roomId;
      });
      if (found) {
        try { draw.current.delete(found.id); } catch {}
      }
    }
    console.log("[ROOM DELETE]", roomId);
  };

  // ---------- filters ----------
  const floorRooms = selectedFloor ? rooms.filter((r) => r.floor_id === selectedFloor.id) : [];
  const filteredRooms = floorRooms.filter((room) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const { props } = extractRoomProps(room);
    return (room.name || "").toLowerCase().includes(q) || (props.roomNumber || "").toLowerCase().includes(q) || JSON.stringify(props).toLowerCase().includes(q);
  });

  // ---------- JSX (keeps your design) ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Building & Room Management</h1>
          <p className="text-gray-600 mt-2">Map and manage buildings, floors, and rooms for your organization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Tabs defaultValue="buildings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="buildings">Buildings</TabsTrigger>
                <TabsTrigger value="floors">Floors</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
              </TabsList>

              {/* Buildings Tab */}
              <TabsContent value="buildings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Buildings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="building-name">Building Name</Label>
                      <Input id="building-name" value={newBuilding.name} onChange={(e) => setNewBuilding((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Academic Quadrangle" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="building-address">Address</Label>
                      <Input id="building-address" value={newBuilding.address} onChange={(e) => setNewBuilding((p) => ({ ...p, address: e.target.value }))} placeholder="e.g., 8888 University Dr" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="building-lat">Latitude</Label>
                        <Input id="building-lat" type="number" step="any" value={newBuilding.lat} onChange={(e) => setNewBuilding((p) => ({ ...p, lat: e.target.value }))} placeholder="49.2781" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-lng">Longitude</Label>
                        <Input id="building-lng" type="number" step="any" value={newBuilding.lng} onChange={(e) => setNewBuilding((p) => ({ ...p, lng: e.target.value }))} placeholder="-122.9199" />
                      </div>
                    </div>
                    <Button onClick={handleAddBuilding} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Building</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Existing Buildings</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {buildings.map((b) => (
                        <div key={b.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedBuilding?.id === b.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`} onClick={() => { setSelectedBuilding(b); persistSelection(b, selectedFloor || null); const firstFloor = floors.find((f) => f.building_id === b.id); if (firstFloor) setSelectedFloor(firstFloor); }}>
                          <div className="font-medium">{b.name}</div>
                          <div className="text-sm text-gray-600">{getAddrLine(b)}</div>
                          <Badge variant="secondary" className="mt-1">{b.floors ?? 0} floors</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Floors Tab */}
              <TabsContent value="floors" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Floors</CardTitle></CardHeader>
                  <CardContent>
                    {selectedBuilding ? (
                      <div className="space-y-4">
                        <Button onClick={handleAddFloor} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Floor</Button>
                        <Separator />
                        <div className="space-y-2">
                          {floors.filter((f) => f.building_id === selectedBuilding.id).map((fl) => (
                            <div key={fl.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedFloor?.id === fl.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`} onClick={() => { setSelectedFloor(fl); persistSelection(selectedBuilding, fl); }}>
                              <div className="font-medium">{fl.name}</div>
                              <Badge variant="secondary" className="mt-1">{fl.rooms ?? 0} rooms</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Select a building first</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rooms Tab */}
              <TabsContent value="rooms" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Rooms</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFloor ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="room-search">Search Rooms</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="room-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by room number or name..." className="pl-10" />
                          </div>
                        </div>

                        <div className="space-y-2"><Label htmlFor="room-number">Room Number</Label><Input id="room-number" value={newRoom.number} onChange={(e) => setNewRoom((p:any)=>({...p, number: e.target.value}))} placeholder="e.g., AQ 1001" /></div>
                        <div className="space-y-2"><Label htmlFor="room-name">Room Name</Label><Input id="room-name" value={newRoom.name} onChange={(e) => setNewRoom((p:any)=>({...p, name: e.target.value}))} placeholder="e.g., Main Lecture Hall" /></div>

                        <div className="space-y-2">
                          <Label htmlFor="room-type">Room Type</Label>
                          <Select value={newRoom.type} onValueChange={(value:any)=>setNewRoom((p:any)=>({...p, type:value}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="classroom">Classroom</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="lab">Lab</SelectItem>
                              <SelectItem value="restroom">Restroom</SelectItem>
                              <SelectItem value="elevator">Elevator</SelectItem>
                              <SelectItem value="staircase">Staircase</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2"><Label htmlFor="room-capacity">Capacity (optional)</Label><Input id="room-capacity" type="number" value={newRoom.capacity} onChange={(e)=>setNewRoom((p:any)=>({...p, capacity: e.target.value}))} placeholder="e.g., 30" /></div>

                        <div className="space-y-2"><Label htmlFor="room-description">Description (optional)</Label><Input id="room-description" value={newRoom.description} onChange={(e)=>setNewRoom((p:any)=>({...p, description: e.target.value}))} placeholder="e.g., Computer lab with 30 workstations" /></div>

                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="room-accessible" checked={newRoom.accessible} onChange={(e)=>setNewRoom((p:any)=>({...p, accessible: e.target.checked}))} className="rounded" />
                          <Label htmlFor="room-accessible">Wheelchair Accessible</Label>
                        </div>

                        <div className="space-y-2">
                          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "default"} className="w-full">{isEditing ? "Stop Editing" : "Start Placing Room"}</Button>
                          <Button onClick={handleAddRoom} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Room</Button>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="font-medium">Existing Rooms</h4>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredRooms.map((room) => {
                              const { props } = extractRoomProps(room);
                              return (
                                <div key={room.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{props.roomNumber ?? room.name}</div>
                                      <div className="text-xs text-gray-600">{room.name}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">{props.type ?? "room"}</Badge>
                                        {props.accessible && <Badge variant="outline" className="text-xs text-green-600">Accessible</Badge>}
                                        {props.capacity && <Badge variant="outline" className="text-xs">{props.capacity} seats</Badge>}
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteRoom(room.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Select a floor first</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />Interactive Map
                  {isEditing && <Badge variant="destructive" className="ml-2">Click to place room</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasMapbox ? (
                  <div ref={mapContainer} className="w-full h-[600px] rounded-lg border border-gray-300" />
                ) : (
                  <div className="w-full h-[600px] rounded-lg border border-gray-300 bg-muted/30 relative">
                    <div className="absolute inset-0 pointer-events-none flex items-start justify-end p-2">
                      <Badge variant="secondary">Placeholder map (no API key)</Badge>
                    </div>
                    <svg onClick={handleSvgClick} className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect x="0" y="0" width="1000" height="600" fill="url(#grid)" />
                      {rooms.map((r) => {
                        const { coords } = extractRoomProps(r);
                        if (!coords) return null;
                        const [cx, cy] = coords;
                        return (
                          <g key={r.id}>
                            <circle cx={cx as any} cy={cy as any} r="8" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                            <text x={(cx as any) + 12} y={(cy as any) + 4} fontSize="12" fill="#111827">{(r.json as any)?.properties?.roomNumber ?? r.name}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
