"use client";
// (removed framer-motion; we render a static path instead)
import { useState, useRef, useEffect, useMemo } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Send, Navigation, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SimpleButton } from "@/components/ui/simple-button";
import { SimpleInput } from "@/components/ui/simple-input";

interface Room {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'room' | 'stairs' | 'elevator';
    floor: number;
}

interface Building {
    id: string;
    name: string;
    floors: number[];
    rooms: Room[];
}



export default function BuildingDetailPage({ params }: { params: { buildingId: string } }) {
    const router = useRouter();
    const mapRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentFloor, setCurrentFloor] = useState<number>(0); // Default to Floor 0
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [userLocation, setUserLocation] = useState({ x: 100, y: 200 });
    const [pinLocation, setPinLocation] = useState<{ x: number; y: number } | null>(null);
    const [animatedPath, setAnimatedPath] = useState<string | null>(null);
    // path refs removed; we render static path directly
    const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [sheetH, setSheetH] = useState(160); // starting/collapsed height
    const sheetMin = 160;                      // tweak
    const [sheetMax, setSheetMax] = useState(600);
    useEffect(() => {
        setSheetMax(Math.round(window.innerHeight * 0.3));
    }, []);

    const dragStartRef = useRef<{ startY: number; startH: number } | null>(null);

    function onHandleDown(e: React.PointerEvent) {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragStartRef.current = { startY: e.clientY, startH: sheetH };
    }
    function onHandleMove(e: React.PointerEvent) {
        if (!dragStartRef.current) return;
        const dy = dragStartRef.current.startY - e.clientY; // dragging up => increase height
        const next = Math.max(sheetMin, Math.min(sheetMax, dragStartRef.current.startH + dy));
        setSheetH(next);
    }
    function onHandleUp() {
        dragStartRef.current = null;
    }

    // Building data - you can expand this with real data
    const buildingData: Record<string, Building> = {
        "ams-nest": {
            id: "ams-nest",
            name: "AMS Nest",
            floors: [0, 1],
            rooms: [
                { id: "wireless-wave", name: "WIRELESS WAVE 1201", x: 50, y: 50, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "honour-roll", name: "HONOUR ROLL 1101", x: 150, y: 50, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "kyros-kitchen", name: "KYROS KITCHEN 1302", x: 250, y: 50, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "teadot-thirsty", name: "TEADOT THIRSTY 1333", x: 350, y: 50, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "broal-hotdog", name: "BROAL HOTDOG 012", x: 50, y: 150, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "artwalk", name: "ARTWALK 1314", x: 150, y: 150, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "security", name: "SECURITY 1312", x: 250, y: 150, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "rbc-campus", name: "RBC ON CAMPUS 1401", x: 350, y: 150, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "grocery-che", name: "GROCERY CHE 1402", x: 50, y: 250, width: 80, height: 60, type: 'room', floor: 0 },
                { id: "stairs-1", name: "STAIRS", x: 200, y: 300, width: 60, height: 40, type: 'stairs', floor: 0 },
                { id: "elev-1", name: "ELEV", x: 300, y: 300, width: 40, height: 40, type: 'elevator', floor: 0 },
            ]
        }
    };

    const currentBuilding = buildingData[params.buildingId];
    const currentFloorRooms = currentBuilding?.rooms.filter(room => room.floor === currentFloor) || [];

    // Handle map interactions
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - mapTransform.x, y: e.clientY - mapTransform.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setMapTransform(prev => ({
            ...prev,
            x: prev.x + (e.movementX / prev.scale), // Adjust for scale
            y: prev.y + (e.movementY / prev.scale),
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05; // Reduce sensitivity
        setMapTransform(prev => {
            const newScale = Math.max(0.5, Math.min(3, prev.scale * delta));
            return {
                ...prev,
                scale: newScale,
                x: prev.x - (e.clientX - mapRef.current!.offsetLeft) * (newScale - prev.scale) / newScale,
                y: prev.y - (e.clientY - mapRef.current!.offsetTop) * (newScale - prev.scale) / newScale,
            };
        });
    };

    const handleMapClick = (e: React.MouseEvent) => {
        // place a pin at the clicked location in map (untransformed) coordinates
        if (!mapRef.current) return;
        const rect = mapRef.current.getBoundingClientRect();
        const scale = mapTransform.scale || 1;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        setPinLocation({ x, y });
    };

    // geometry helpers
    const segsFromSelectedRoom = useMemo(() => {
        const segs: Array<[[number, number], [number, number]]> = [];
        if (selectedRoom) {
            const sx = selectedRoom.x + selectedRoom.width / 2;
            const sy = selectedRoom.y + selectedRoom.height / 2;
            // build the same quadratic used in render: control x is midpoint formula and control y is userLocation.y - 50
            const cxx = (userLocation.x + selectedRoom.x + selectedRoom.width / 2) / 2;
            const cyy = userLocation.y - 50;
            // sample the quadratic into small segments
            const N = 24;
            let prev = quadPoint(0, userLocation.x, userLocation.y, cxx, cyy, sx, sy);
            for (let i = 1; i <= N; i++) {
                const next = quadPoint(i / N, userLocation.x, userLocation.y, cxx, cyy, sx, sy);
                segs.push([prev, next]);
                prev = next;
            }
        }
        return segs;
    }, [selectedRoom, userLocation.x, userLocation.y]);

    function ccw(A: [number, number], B: [number, number], C: [number, number]) {
        return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
    }

    function segmentsIntersect(A: [number, number], B: [number, number], C: [number, number], D: [number, number]) {
        // simple segment intersection test
        return (ccw(A, C, D) !== ccw(B, C, D)) && (ccw(A, B, C) !== ccw(A, B, D));
    }

    function quadPoint(t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) {
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        return [x, y] as [number, number];
    }

    function quadIntersectsSegments(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, segs: Array<[[number, number], [number, number]]>) {
        // sample the quadratic curve and test the polyline segments for intersection
        const samples: [number, number][] = [];
        const N = 12;
        for (let i = 0; i <= N; i++) {
            samples.push(quadPoint(i / N, x0, y0, cx, cy, x1, y1));
        }
        for (let i = 0; i < samples.length - 1; i++) {
            const A: [number, number] = samples[i];
            const B: [number, number] = samples[i + 1];
            for (const s of segs) {
                const C = s[0];
                const D = s[1];
                if (segmentsIntersect(A, B, C, D)) return true;
            }
        }
        return false;
    }

    // build an animated path from userLocation to pinLocation avoiding other segments
    useEffect(() => {
        if (!pinLocation) {
            setAnimatedPath(null);
            return;
        }
        const ux = userLocation.x;
        const uy = userLocation.y + 150; // note: user's dot was offset down by 150 in render
        const px = pinLocation.x;
        const py = pinLocation.y;

        // candidate straight line
        let straightIntersects = false;
        for (const s of segsFromSelectedRoom) {
            if (segmentsIntersect([ux, uy], [px, py], s[0], s[1])) {
                straightIntersects = true;
                break;
            }
        }

        if (!straightIntersects) {
            setAnimatedPath(`M ${ux} ${uy} L ${px} ${py}`);
            return;
        }

        // need to find a quadratic control point that avoids intersections
        const midX = (ux + px) / 2;
        const midY = (uy + py) / 2;
        const dx = px - ux;
        const dy = py - uy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        let chosenPath: string | null = null;
        const offsets = [80, 140, 220, 300];
        for (const off of offsets) {
            for (const sign of [1, -1]) {
                const cx = midX + nx * off * sign;
                const cy = midY + ny * off * sign;
                // if quad avoids intersections with existing segments, choose it
                if (!quadIntersectsSegments(ux, uy, cx, cy, px, py, segsFromSelectedRoom)) {
                    chosenPath = `M ${ux} ${uy} Q ${cx} ${cy} ${px} ${py}`;
                    break;
                }
            }
            if (chosenPath) break;
        }

        if (!chosenPath) {
            // fallback: use a larger offset curve without checks
            const cx = midX + nx * 360;
            const cy = midY + ny * 360;
            chosenPath = `M ${ux} ${uy} Q ${cx} ${cy} ${px} ${py}`;
        }

        setAnimatedPath(chosenPath);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinLocation, selectedRoom, userLocation.x, userLocation.y]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touches = Array.from(e.touches);
            const [touch1, touch2] = touches;
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            dragStartRef.current = { startY: distance, startH: mapTransform.scale };
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            dragStartRef.current = { startY: touch.clientY, startH: sheetH };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && dragStartRef.current) {
            const touches = Array.from(e.touches);
            const [touch1, touch2] = touches;
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            const scaleDelta = distance / dragStartRef.current.startY;
            setMapTransform(prev => ({
                ...prev,
                scale: Math.max(0.5, Math.min(3, dragStartRef.current!.startH * scaleDelta))
            }));
        } else if (e.touches.length === 1 && dragStartRef.current) {
            const touch = e.touches[0];
            const dy = dragStartRef.current.startY - touch.clientY;
            setSheetH(Math.max(sheetMin, Math.min(sheetMax, dragStartRef.current.startH + dy)));
        }
    };

    const handleTouchEnd = () => {
        dragStartRef.current = null;
    };

    const handleStartNavigation = () => {
        if (!selectedRoom) return;
        console.log("Starting navigation to:", selectedRoom.name);
    };

    const handleFloorChange = (floorString: string) => {
        const floorNumber = parseInt(floorString.replace('Floor ', ''), 10);
        if (!isNaN(floorNumber)) {
            setCurrentFloor(floorNumber);
        }
    };

    const START_OVERLAP = 8; // overlap pixels over the top edge
    const [imgBottom, setImgBottom] = useState(160 - START_OVERLAP); // 160 = your sheetMin

    useEffect(() => {
        // if you change sheetMin later, initialize once on mount
        setImgBottom(sheetH - START_OVERLAP);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!currentBuilding) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Building Not Found</h1>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }



    return (
        <main className="min-h-screen" style={{ backgroundColor: '#FDFDF5' }}>
            <div className="max-w-md mx-auto px-6 py-8">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <SimpleButton
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-gray-700 hover:bg-gray-100 p-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </SimpleButton>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 text-gray-900">
                            {currentBuilding.name}
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <SimpleInput
                            type="text"
                            placeholder="Search for room names"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 rounded-sm border-2"
                        />
                    </div>
                </div>

                {/* Map Area */}


                <div
                    className="relative overflow-hidden bg-yellow-50"
                    style={{ height: 'calc(100vh - 200px)' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onClick={handleMapClick}
                >
                    <div
                        ref={mapRef}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        style={{
                            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
                            transformOrigin: '0 0'
                        }}
                    >
                        {/* User Location Marker */}
                        <div
                            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"
                            style={{
                                left: userLocation.x,
                                // move down by a large offset so the dot appears much lower on the map
                                top: userLocation.y + 150,
                                transform: 'translate(-50%, -50%)', // center the dot on the coordinates
                                pointerEvents: 'none' // don't block map interactions
                            }}
                            aria-label="Current location"
                            role="img"
                        />

                        {/* Navigation Path (if room is selected) */}
                        {selectedRoom && (
                            <svg
                                className="absolute inset-0 pointer-events-none"
                                style={{ zIndex: 5 }}
                            >
                                <path
                                    d={`M ${userLocation.x} ${userLocation.y} Q ${(userLocation.x + selectedRoom.x + selectedRoom.width / 2) / 2} ${userLocation.y - 50} ${selectedRoom.x + selectedRoom.width / 2} ${selectedRoom.y + selectedRoom.height / 2}`}
                                    stroke="#3b82f6"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}

                        <div className="relative w-full h-full">
                            {currentFloor === 0 && (
                                <img
                                    src="/pictures/nest level 3.svg"
                                    alt="Floor 0 Map"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            )}
                            {currentFloor === 1 && (
                                <img
                                    src="/pictures/nest level 1.svg"
                                    alt="Floor 1 Map"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Static path from blue dot to pin (if pin exists) - rendered after the images so it's visible */}
                        {animatedPath && (
                            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                                <path
                                    d={animatedPath}
                                    stroke="#2563EB"
                                    strokeWidth={4}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}

                        {/* Pin placed by clicking on the map */}
                        {pinLocation && (
                            <div
                                className="absolute z-20 pointer-events-none"
                                style={{
                                    left: pinLocation.x,
                                    top: pinLocation.y,
                                    transform: 'translate(-50%, -100%)' // pin tip points to the coords
                                }}
                            >
                                <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M12 0C7.02944 0 3 4.02944 3 9C3 16.5 12 32 12 32C12 32 21 16.5 21 9C21 4.02944 16.9706 0 12 0Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="12" cy="9" r="3" fill="#ffffff" />
                                </svg>
                            </div>
                        )}


                        {/* Rooms */}
                        {/* {currentFloorRooms.map((room) => (
                            <div
                                key={room.id}
                                className={`absolute cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedRoom?.id === room.id
                                    ? 'bg-orange-200 border-orange-400'
                                    : room.type === 'stairs'
                                        ? 'bg-gray-200 border-gray-400'
                                        : room.type === 'elevator'
                                            ? 'bg-gray-300 border-gray-500'
                                            : 'bg-blue-200 border-blue-400'
                                    } border-2 rounded-lg flex items-center justify-center text-center p-1`}
                                style={{
                                    left: room.x,
                                    top: room.y,
                                    width: room.width,
                                    height: room.height,
                                    zIndex: selectedRoom?.id === room.id ? 10 : 1
                                }}
                                onClick={() => handleRoomClick(room)}
                            >
                                <span className="text-xs font-medium text-gray-800 leading-tight">
                                    {room.name}
                                </span>
                            </div>
                        ))} */}
                    </div>
                </div>



                {/* Bottom Sheet */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50" style={{ height: sheetH, maxHeight: '30' }}>
                    {/* drag handle (only this thin area is draggable) */}

                    <div
                        onPointerDown={onHandleDown}
                        onPointerMove={onHandleMove}
                        onPointerUp={onHandleUp}
                        className="flex justify-center pb-3 cursor-grab active:cursor-grabbing select-none"
                    >
                        <div className="h-1.5 w-16 rounded-full bg-white/90 shadow" />
                    </div>
                    <img
                        src="/pictures/alligator.svg"
                        alt="alligator"
                        className="absolute -bot-4 right-4 w-[72px] h-auto pointer-events-none"

                        style={{
                            // sits slightly above the sheet (adjust -8)
                            bottom: `${sheetH - 10}px`,
                            right: '40px',
                            width: '100px',
                        }}
                    />

                    {/* sheet body (pinned to bottom; grows upward) */}
                    <div className="h-full bg-[#3F95B2] border-2 border-black rounded-t-[20px] p-4 shadow-lg overflow-auto relative">

                        {selectedRoom ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">ROOM {selectedRoom.name}</h3>
                                        <p color="black">Opening Hours: 10:00AM - 19:00PM</p>
                                    </div>
                                    <Button
                                        onClick={handleStartNavigation}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg"
                                    >
                                        GO!
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Current Floor</h3>
                                    </div>
                                    <Select value={`Floor ${currentFloor}`} onValueChange={handleFloorChange}>
                                        <SelectTrigger className="bg-white w-64 hover:bg-[#3F95B2] border-black border-2 rounded-sm text-black">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentBuilding.floors.map(floor => (
                                                <SelectItem key={floor} value={`Floor ${floor}`}>
                                                    Floor {floor}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Current Floor</h3>
                                    </div>
                                </div>

                                <div className="flex items-center w-full gap-4 justify-between">
                                    <Select value={`Floor ${currentFloor}`} onValueChange={handleFloorChange}>
                                        <SelectTrigger className="bg-white w-64 hover:bg-[#3F95B2] border-black border-2 rounded-sm text-black">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentBuilding.floors.map(floor => (
                                                <SelectItem key={floor} value={`Floor ${floor}`}>
                                                    Floor {floor}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="bg-white hover:bg-grey border-2 border-black rounded-sm"
                                    >
                                        <Navigation className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main >
    );
}
