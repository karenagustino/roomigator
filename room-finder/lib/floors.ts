// lib/data/client-rooms.ts
import { createClient } from '@/lib/supabaseClient'
import type { Database } from './types'
type RoomRow = Database['public']['Tables']['rooms']['Row']
type FloorRow = Database['public']['Tables']['floors']['Row']

export async function fetchFloorsByBuildingClient(buildingId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('floors')
    .select('id, created_at, building_id, name, rooms, json')
    .eq('building_id', buildingId)
    .order('name', { ascending: true })
  if (error) throw error
  return data as FloorRow[]
}

export async function fetchRoomsByBuildingFloorClient(buildingId: number, floorName: string, q?: string) {
  const supabase = createClient()
  const { data: floors, error: fe } = await supabase
    .from('floors')
    .select('id, name, building_id')
    .eq('building_id', buildingId)
    .eq('name', floorName)
    .limit(1)
  if (fe) throw fe
  const floor = floors?.[0]
  if (!floor) return [] as RoomRow[]

  let query = supabase
    .from('rooms')
    .select('id, created_at, floor_id, name, json')
    .eq('floor_id', floor.id)

  if (q && q.trim()) query = query.ilike('name', `%${q}%`)

  const { data: rooms, error: re } = await query
  if (re) throw re
  return rooms as RoomRow[]
}
