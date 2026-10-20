export const generateScenarioData = (numFarmers, numMachines) => {
  const baseLat = 18.5204;
  const baseLng = 73.8567;

  const machines = Array.from({ length: numMachines }, (_, i) => ({
    id: `M-${i + 1}`,
    name: `Tractor ${i + 1}`,
    horsepower: 35 + (i % 4) * 10, // 35 to 65 HP
    location_lat: baseLat + (Math.random() - 0.5) * 0.2,
    location_lng: baseLng + (Math.random() - 0.5) * 0.2,
  }));

  const tasks = Array.from({ length: numFarmers }, (_, i) => ({
    id: `T-${i + 1}`,
    farmer_id: `F-${i + 1}`,
    required_hp: 30 + (i % 3) * 10,
    hours_until_deadline: Math.floor(Math.random() * 36) + 12, // 12 to 48 hours deadline
    duration_hours: 3 + (i % 3), // 3 to 5 hours work
    location_lat: baseLat + (Math.random() - 0.5) * 0.2,
    location_lng: baseLng + (Math.random() - 0.5) * 0.2,
  }));

  return { tasks, machines };
};