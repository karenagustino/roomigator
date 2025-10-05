export type RoomType =
  | "classroom"
  | "office"
  | "lab"
  | "restroom"
  | "elevator"
  | "staircase"
  | "other";

export type CoordinateSystem = "pixel" | "wgs84";

export interface RoomCoordinates {
  // For simplicity, we use {x,y} for both pixel and map (x=lng, y=lat in wgs84)
  x: number;
  y: number;
}

export interface Room {
  id: string;
  floorId: string;
  buildingId?: string;
  number: string;
  name: string;
  type: RoomType;
  floor: number;
  coordinates: RoomCoordinates; // pixel or wgs84 depending on coordinateSystem
  accessible: boolean;
  capacity?: number;
  description?: string;
  coordinateSystem?: CoordinateSystem; // optional hint for stored rows
  createdAt?: string;
  updatedAt?: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  number: number;
  name: string;
  floorPlanUrl?: string;
  rooms: Room[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  floors: Floor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomFeatureProperties {
  roomId: string;
  number: string;
  name: string;
  type: RoomType;
  floor: number;
  accessible: boolean;
  capacity: number | null;
}

export interface RoomFeature {
  type: "Feature";
  properties: RoomFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [x,y] for pixel, [lng,lat] for wgs84
  };
}

export interface RoomPayload {
  buildingId: string;
  floorId: string;
  coordinateSystem: CoordinateSystem;
  room: Room;
  feature: RoomFeature;
  featureCollection: {
    type: "FeatureCollection";
    features: RoomFeature[];
  };
}
