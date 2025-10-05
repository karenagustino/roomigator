import {supabase} from "@/lib/supabaseClient"
import {BuildingRow, FloorRow, RoomRow} from "@/lib/types"

export async function saveRoomToSupabase(b: BuildingRow, f: FloorRow, r: RoomRow) {
    try {
      // 1) Ensure building exists (select by name)
      const { data: existingB } = await supabase
        .from("buildings")
        .select("*")
        .eq("name", b.name)
        .maybeSingle();

      let buildingId = existingB?.id ?? b.id;

      if (!existingB) {
        const { data: createdB, error: createBError } = await supabase
          .from("buildings")
          .insert([{ name: b.name, address_json: b.address_json }])
          .select()
          .single();
        if (createBError) throw createBError;
        buildingId = createdB.id;
      }

      // 2) Ensure floor exists (by name + building_id)
      const { data: existingF } = await supabase
        .from("floors")
        .select("*")
        .eq("name", f.name)
        .eq("building_id", buildingId)
        .maybeSingle();

      let floorId = existingF?.id ?? f.id;

      if (!existingF) {
        const { data: createdF, error: createFError } = await supabase
          .from("floors")
          .insert([{ name: f.name, building_id: buildingId }])
          .select()
          .single();
        if (createFError) throw createFError;
        floorId = createdF.id;
      }

      // 3) Insert room
      const roomPayload = {
        name: r.name,
        floor_id: floorId,
        geo_json: r.geo_json,
      };

      const { data: createdRoom, error: createRoomError } = await supabase
        .from("rooms")
        .insert([roomPayload])
        .select()
        .single();

      if (createRoomError) throw createRoomError;

      console.log("[SUPABASE] createdRoom:", createdRoom);
      return { error: null, data: createdRoom };
    } catch (err) {
      console.error("[SUPABASE ERROR]", err);
      return { error: err, data: null };
    }
  }