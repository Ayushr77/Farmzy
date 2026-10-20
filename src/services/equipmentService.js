import { supabase } from "../supabaseClient";

/**
 * Fetch detailed equipment capabilities (e.g., HP, attachments)
 */
export const fetchEquipmentCapabilities = async (equipmentId) => {
  const { data, error } = await supabase
    .from("equipment_capabilities")
    .select("*")
    .eq("equipment_id", equipmentId);

  if (error) {
    console.error("Error fetching capabilities:", error);
    return [];
  }

  return data || [];
};

/**
 * Fetch availability calendar slots for a specific equipment item
 */
export const fetchEquipmentAvailability = async (equipmentId) => {
  const { data, error } = await supabase
    .from("equipment_availability")
    .select("*")
    .eq("equipment_id", equipmentId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching availability slots:", error);
    return [];
  }

  return data || [];
};

/**
 * Check if equipment is free within a specific time window
 */
export const checkTimeSlotAvailability = async (equipmentId, startTime, endTime) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("equipment_id", equipmentId)
    .in("booking_status", ["confirmed", "in_transit", "in_progress"])
    .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

  if (error) {
    console.error("Error checking slot overlap:", error);
    return false;
  }

  return data.length === 0;
};
