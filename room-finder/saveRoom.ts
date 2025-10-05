// lib/saveRoom.ts
import { supabase } from "@/lib/supabaseClient";
import type { Database, BuildingRow, FloorRow, RoomRow } from "@/lib/types";

type DB = Database;

/**
 * Ensure building -> floor -> room exist in that order.
 * Returns { error, data: { building, floor, room } }
 */
export async function saveRoomToSupabase(
  b: BuildingRow,
  f: FloorRow,
  r: RoomRow
): Promise<
  | { error: null; data: { building: BuildingRow; floor: FloorRow; room: RoomRow } }
  | { error: unknown; data: null }
> {
  try {
    // 1) find or create building (match by name)
    const { data: existingB, error: existingBErr } = await supabase
      .from("buildings")
      .select("*")
      .eq("name", b.name)
      .maybeSingle();
    if (existingBErr) throw existingBErr;

    let building: BuildingRow;
    if (existingB) {
      building = existingB as BuildingRow;
    } else {
      const { data: createdB, error: createBError } = await supabase
        .from("buildings")
        .insert([
          {
            name: b.name,
            address: b.address ?? {},
            // initial floors count (0 if not provided)
            floors: typeof b.floors === "number" ? b.floors : 0,
            json: b.json ?? {},
          },
        ])
        .select()
        .single();
      if (createBError) throw createBError;
      building = createdB as BuildingRow;
    }

    // 2) find or create floor (match by name + building_id)
    const { data: existingF, error: existingFErr } = await supabase
      .from("floors")
      .select("*")
      .eq("name", f.name)
      .eq("building_id", building.id)
      .maybeSingle();
    if (existingFErr) throw existingFErr;

    let floor: FloorRow;
    let createdFloorThisCall = false;
    if (existingF) {
      floor = existingF as FloorRow;
    } else {
      const { data: createdF, error: createFError } = await supabase
        .from("floors")
        .insert([
          {
            name: f.name,
            building_id: building.id,
            rooms: typeof f.rooms === "number" ? f.rooms : 0,
            json: f.json ?? {},
          },
        ])
        .select()
        .single();
      if (createFError) throw createFError;
      floor = createdF as FloorRow;
      createdFloorThisCall = true;
    }

    // If we created the floor just now, increment building.floors (denormalized count)
    if (createdFloorThisCall) {
      const newFloorsCount = (building.floors ?? 0) + 1;
      const { data: updatedB, error: updateBError } = await supabase
        .from("buildings")
        .update({ floors: newFloorsCount })
        .eq("id", building.id)
        .select()
        .single();
      if (updateBError) {
        console.warn("[saveRoomToSupabase] failed to update building.floors:", updateBError);
      } else {
        building = updatedB as BuildingRow;
      }
    }

    // 3) insert the room (store geo/properties in `json`)
    const roomPayload: DB["public"]["Tables"]["rooms"]["Insert"] = {
      name: r.name,
      floor_id: floor.id,
      json: r.json ?? {},
    };

    const { data: createdRoom, error: createRoomError } = await supabase
      .from("rooms")
      .insert([roomPayload])
      .select()
      .single();
    if (createRoomError) throw createRoomError;

    // 4) increment rooms count on the floor (denormalized)
    const newRoomsCount = (floor.rooms ?? 0) + 1;
    const { data: updatedF, error: updateFError } = await supabase
      .from("floors")
      .update({ rooms: newRoomsCount })
      .eq("id", floor.id)
      .select()
      .single();
    if (updateFError) {
      console.warn("[saveRoomToSupabase] failed to update floor.rooms:", updateFError);
    } else {
      floor = updatedF as FloorRow;
    }

    return {
      error: null,
      data: {
        building: building as BuildingRow,
        floor: floor as FloorRow,
        room: createdRoom as RoomRow,
      },
    };
  } catch (err) {
    console.error("[saveRoomToSupabase] error:", err);
    return { error: err, data: null };
  }
}
