import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function FarmerDashboard({
  language = "en",
  text,
  setScreen,
  setSelectedEquipment,
  activeTab = "home",
  setActiveTab,
  farmerId: propFarmerId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [soilFilter, setSoilFilter] = useState("all");
  const [opFilter, setOpFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  
  // Marketplace Enhancements: Sorting & Availability Filters
  const [sortBy, setSortBy] = useState("default");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(propFarmerId || null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Resolve localization text object
  const t = text?.[language] || text?.en || {};

  // 0. Resolve Logged-in User ID
  useEffect(() => {
    const resolveUser = async () => {
      if (propFarmerId) {
        setCurrentUserId(propFarmerId);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    };
    resolveUser();
  }, [propFarmerId]);

  // 1. Fetch machinery listings & Subscribe to Realtime Updates
  useEffect(() => {
    let isMounted = true;

    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("equipment").select("*");
        if (error) throw error;

        if (data && isMounted) {
          const availableEquipment = data.filter((item) => {
            if (item.status && item.status.toLowerCase() === "unlisted") return false;
            if (item.is_active === false) return false;
            if (item.is_available === false) return false;
            return true;
          });

          setEquipmentList(availableEquipment);
          localStorage.setItem("farmzy_cached_equipment", JSON.stringify(availableEquipment));
        }
      } catch (error) {
        console.error("Error fetching equipment, serving offline data:", error);
        const cached = localStorage.getItem("farmzy_cached_equipment");
        if (cached && isMounted) {
          try {
            const parsed = JSON.parse(cached);
            const availableCached = parsed.filter((item) => {
              if (item.status && item.status.toLowerCase() === "unlisted") return false;
              if (item.is_active === false) return false;
              if (item.is_available === false) return false;
              return true;
            });
            setEquipmentList(availableCached);
          } catch (e) {
            console.error("Failed to parse cached equipment:", e);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEquipment();

    const equipmentChannel = supabase
      .channel("realtime_farmer_equipment")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        (payload) => {
          if (!isMounted) return;
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === "INSERT") {
            if (newRow.is_active !== false && newRow.status !== "unlisted" && newRow.is_available !== false) {
              setEquipmentList((prev) => [newRow, ...prev]);
            }
          } else if (eventType === "UPDATE") {
            const isUnlisted = newRow.status === "unlisted" || newRow.is_active === false || newRow.is_available === false;
            setEquipmentList((prev) => {
              if (isUnlisted) {
                return prev.filter((item) => item.id !== newRow.id);
              }
              const exists = prev.some((item) => item.id === newRow.id);
              if (exists) {
                return prev.map((item) => (item.id === newRow.id ? newRow : item));
              }
              return [newRow, ...prev];
            });
          } else if (eventType === "DELETE") {
            setEquipmentList((prev) => prev.filter((item) => item.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(equipmentChannel);
    };
  }, []);

  // 2. Fetch Notifications & Listen for Live Updates
  useEffect(() => {
    let isMounted = true;
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && isMounted) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.is_read).length);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`realtime_notifications_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (!isMounted) return;
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const markNotificationsAsRead = async () => {
    setShowNotificationPanel(!showNotificationPanel);

    if (unreadCount > 0 && currentUserId) {
      setUnreadCount(0);
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", currentUserId);
      } catch (err) {
        console.error("Error updating notification status:", err);
      }
    }
  };

  // 3. Fetch User-Specific Bookings & Listen for Status Changes
  useEffect(() => {
    let isMounted = true;
    if (!currentUserId) return;

    const fetchFarmerBookings = async () => {
      setBookingsLoading(true);

      try {
        const { data, error } = await supabase
          .from("farm_tasks")
          .select("*, equipment(title, daily_rate, hourly_rate)")
          .eq("farmer_id", currentUserId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && isMounted) {
          const mappedBookings = data.map((b) => ({
            id: b.id,
            status: b.status,
            equipmentName: b.equipment?.title || "Equipment Request",
            location: b.location_village || "Local Farm",
            totalPrice:
              (b.equipment?.daily_rate || 0) * (b.duration_days || 1) ||
              (b.equipment?.hourly_rate || 0) * 8 * (b.duration_days || 1) ||
              0,
            date: b.earliest_start || new Date(b.created_at).toLocaleDateString(),
            duration: b.duration_days,
          }));

          setBookings(mappedBookings);
        }
      } catch (err) {
        console.error("Error fetching farmer bookings from DB:", err);
        setBookings([]);
      } finally {
        if (isMounted) setBookingsLoading(false);
      }
    };

    fetchFarmerBookings();

    const taskChannel = supabase
      .channel(`realtime_farmer_tasks_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "farm_tasks",
          filter: `farmer_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === "UPDATE") {
            const updatedTask = payload.new;
            setBookings((prev) =>
              prev.map((b) =>
                b.id === updatedTask.id ? { ...b, status: updatedTask.status } : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(taskChannel);
    };
  }, [activeTab, currentUserId]);

  const handleEquipmentClick = (item) => {
    if (setSelectedEquipment) setSelectedEquipment(item);
    if (setScreen) setScreen("equipmentDetails");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSoilFilter("all");
    setOpFilter("all");
    setCropFilter("all");
    setSelectedCategory("all");
    setMaxPrice("");
    setSortBy("default");
    setAvailabilityFilter("all");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    soilFilter !== "all" ||
    opFilter !== "all" ||
    cropFilter !== "all" ||
    searchTerm !== "" ||
    maxPrice !== "" ||
    sortBy !== "default" ||
    availabilityFilter !== "all";

  // Dynamic District Benchmark Calculation
  const categoryAverages = equipmentList.reduce((acc, item) => {
    const cat = item.category || "Tractors";
    const rate = Number(item.daily_rate) || (Number(item.hourly_rate) ? Number(item.hourly_rate) * 8 : 0);
    
    if (rate > 0) {
      if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
      acc[cat].total += rate;
      acc[cat].count += 1;
    }
    return acc;
  }, {});

  const renderBenchmarkBadge = (item) => {
    const cat = item.category || "Tractors";
    const itemRate = Number(item.daily_rate) || (Number(item.hourly_rate) ? Number(item.hourly_rate) * 8 : 0);
    const catStats = categoryAverages[cat];

    if (!catStats || catStats.count === 0 || itemRate === 0) return null;

    const avgRate = Math.round(catStats.total / catStats.count);
    const isFairOrBelow = itemRate <= avgRate;

    return (
      <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: "600" }}>
        {isFairOrBelow ? (
          <span style={{ color: "#2e7d32" }}>🏷️ Fair Price (District Avg: ₹{avgRate}/day)</span>
        ) : (
          <span style={{ color: "#e65100" }}>⚠️ Above District Avg (Avg: ₹{avgRate}/day)</span>
        )}
      </div>
    );
  };

  // Demand-Aware Multi-Criteria Allocation (DPM) Matching Score Function
  const calculateEquipmentSuitabilityScore = (item) => {
    let score = 0;

    // 1. Price Competitiveness Factor (30% weight)
    const itemRate = Number(item.daily_rate) || 1500;
    const catStats = categoryAverages[item.category || "Tractors"];
    const avgRate = catStats && catStats.count > 0 ? catStats.total / catStats.count : 2000;
    const priceScore = Math.max(0, 1 - itemRate / (avgRate * 1.5));
    score += priceScore * 0.30;

    // 2. Suitability Factor based on active filters (30% weight)
    let suitabilityMatch = 0.7; // default base match
    if (cropFilter !== "all" && Array.isArray(item.suitable_crops) && item.suitable_crops.includes(cropFilter)) {
      suitabilityMatch = 1.0;
    }
    if (soilFilter !== "all" && Array.isArray(item.suitable_soil_types) && item.suitable_soil_types.includes(soilFilter)) {
      suitabilityMatch = 1.0;
    }
    score += suitabilityMatch * 0.30;

    // 3. Availability Status Factor (20% weight)
    const availabilityScore = item.status === "allocated" ? 0.2 : 1.0;
    score += availabilityScore * 0.20;

    // 4. Peak-Season / Demand Relevance Factor (20% weight)
    const demandScore = item.peak_season_active ? 1.0 : 0.7;
    score += demandScore * 0.20;

    return Math.min(100, Math.max(10, Math.round(score * 100)));
  };

  // Farmer Analytics Calculations
  const totalRentalsCount = bookings.length;
  const completedRentalsCount = bookings.filter((b) => b.status === "allocated" || b.status === "completed").length;
  const upcomingRentalsCount = bookings.filter((b) => b.status === "pending").length;
  const totalFarmerSpending = bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  // Filter Logic
  const filteredEquipment = equipmentList.filter((item) => {
    const searchMatch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location_village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location_district?.toLowerCase().includes(searchTerm.toLowerCase());

    const soilMatch =
      soilFilter === "all" ||
      (Array.isArray(item.suitable_soil_types)
        ? item.suitable_soil_types.includes(soilFilter)
        : true);

    const catLower = (item.category || "").toLowerCase();
    const titleLower = (item.title || "").toLowerCase();

    const opMatch =
      opFilter === "all" ||
      (Array.isArray(item.suitable_operations)
        ? item.suitable_operations.includes(opFilter)
        : opFilter.toLowerCase() === "harvesting"
        ? catLower.includes("harvest") || titleLower.includes("harvest")
        : opFilter.toLowerCase() === "spraying"
        ? catLower.includes("spray") || titleLower.includes("spray")
        : opFilter.toLowerCase() === "sowing" || opFilter.toLowerCase() === "tilling"
        ? catLower.includes("tractor") || catLower.includes("rotavator")
        : true);

    const cropMatch =
      cropFilter === "all" ||
      (Array.isArray(item.suitable_crops)
        ? item.suitable_crops.includes(cropFilter)
        : true);

    const categoryMatch =
      selectedCategory === "all" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    const effectiveDailyPrice =
      Number(item.daily_rate) ||
      (Number(item.hourly_rate) ? Number(item.hourly_rate) * 8 : 0);

    const priceMatch = !maxPrice || effectiveDailyPrice <= Number(maxPrice);

    const availabilityMatch =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.status !== "allocated");

    return (
      searchMatch &&
      soilMatch &&
      opMatch &&
      cropMatch &&
      categoryMatch &&
      priceMatch &&
      availabilityMatch
    );
  });

  // Sorting Logic (Includes DPM Score Sorting & Price Sorting)
  const sortedFilteredEquipment = filteredEquipment.sort((a, b) => {
    const priceA = Number(a.daily_rate) || (Number(a.hourly_rate) ? Number(a.hourly_rate) * 8 : 0);
    const priceB = Number(b.daily_rate) || (Number(b.hourly_rate) ? Number(b.hourly_rate) * 8 : 0);

    if (sortBy === "priceLow") return priceA - priceB;
    if (sortBy === "priceHigh") return priceB - priceA;
    
    // Default Sorting by DPM Multi-Criteria Match Score (Highest first)
    const scoreA = calculateEquipmentSuitabilityScore(a);
    const scoreB = calculateEquipmentSuitabilityScore(b);
    return scoreB - scoreA;
  });

  return (
    <div className="dashboard">
      <header className="dashboardHeader">
        <div>
          <span className="greeting">{t.greeting || "Good morning 👋"}</span>
          <h1>{t.welcomeUser || "Namaste, Farmer"}</h1>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
          <button
            className="globalBackButton"
            onClick={() => setScreen && setScreen("role")}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            ← {t.switchRoleLogout || "Role"}
          </button>

          <div
            className="bell"
            role="button"
            onClick={markNotificationsAsRead}
            style={{ position: "relative", cursor: "pointer", fontSize: "20px" }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#d32f2f",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {showNotificationPanel && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "0",
                width: "280px",
                maxHeight: "300px",
                overflowY: "auto",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 200,
                padding: "8px",
              }}
            >
              <h4 style={{ margin: "4px 8px", fontSize: "14px" }}>
                {t.notifications || "Notifications"}
              </h4>
              <hr style={{ margin: "6px 0", borderTop: "1px solid #eee" }} />
              {notifications.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#666", padding: "8px" }}>
                  No new notifications.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      background: n.type === "cancellation" ? "#ffebee" : "#f5f5f5",
                      borderLeft:
                        n.type === "cancellation" ? "4px solid #d32f2f" : "4px solid #2e7d32",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>
                      {n.title || "Booking Alert"}
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#444" }}>
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      <div style={{ paddingBottom: "80px" }}>
        {activeTab === "home" && (
          <section className="dashboardSection">
            <div
              style={{
                background: "#e8f5e9",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #c8e6c9",
              }}
            >
              <div>
                <h4 style={{ margin: 0, color: "#2e7d32" }}>
                  {t.postTaskBtn || "Post Farm Task ➕"}
                </h4>
              </div>
              <button
                className="continueBtn"
                style={{ width: "auto", padding: "8px 14px", fontSize: "13px", margin: 0 }}
                onClick={() => setScreen && setScreen("createTask")}
              >
                +
              </button>
            </div>

            <input
              type="text"
              placeholder={t.searchPlaceholder || "🔍 Search tractors, harvesters..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchInput"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                marginBottom: "12px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <select
                value={soilFilter}
                onChange={(e) => setSoilFilter(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              >
                <option value="all">{t.soilAll || "Soil: All Types"}</option>
                <option value="Black Soil">{t.soilBlack || "Black Soil"}</option>
                <option value="Red Soil">{t.soilRed || "Red Soil"}</option>
                <option value="Alluvial Soil">{t.soilAlluvial || "Alluvial Soil"}</option>
                <option value="Laterite Soil">{t.soilLaterite || "Laterite Soil"}</option>
              </select>

              <select
                value={opFilter}
                onChange={(e) => setOpFilter(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              >
                <option value="all">{t.opAll || "Operation: All"}</option>
                <option value="Sowing">{t.opSowing || "Sowing"}</option>
                <option value="Harvesting">{t.opHarvesting || "Harvesting"}</option>
                <option value="Tilling">{t.opTilling || "Tilling"}</option>
                <option value="Spraying">{t.opSpraying || "Spraying"}</option>
              </select>

              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              >
                <option value="all">{t.cropAll || "Crop: All"}</option>
                <option value="Wheat">{t.cropWheat || "Wheat"}</option>
                <option value="Paddy">{t.cropPaddy || "Paddy"}</option>
                <option value="Sugarcane">{t.cropSugarcane || "Sugarcane"}</option>
                <option value="Cotton">{t.cropCotton || "Cotton"}</option>
              </select>

              <input
                type="number"
                placeholder={t.maxPricePlaceholder || "Max Price (₹/day)"}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>

            {/* Sorting & Availability Dropdowns */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="default">Sort by: DPM Match Score</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>

              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="all">Availability: All Active</option>
                <option value="available">Available Now Only</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h3 style={{ fontSize: "15px", margin: 0 }}>
                  {t.categoriesTitle || "Equipment Categories"}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c62828",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {t.clearFilter || "Clear filter"}
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "6px",
                }}
              >
                {[
                  { key: "all", label: "All" },
                  { key: "Tractors", label: t.catTractors || "Tractors" },
                  { key: "Harvesters", label: t.catHarvesters || "Harvesters" },
                  { key: "Rotavators", label: t.catRotavators || "Rotavators" },
                  { key: "Sprayers", label: t.catSprayers || "Sprayers" },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid #2e7d32",
                      background:
                        selectedCategory.toLowerCase() === cat.key.toLowerCase()
                          ? "#2e7d32"
                          : "#fff",
                      color:
                        selectedCategory.toLowerCase() === cat.key.toLowerCase()
                          ? "#fff"
                          : "#2e7d32",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>
              {t.availableListings || "Available Listings"}
            </h3>

            {loading ? (
              <p style={{ textAlign: "center", color: "#666" }}>
                {t.loadingEquipment || "Loading available equipment..."}
              </p>
            ) : sortedFilteredEquipment.length === 0 ? (
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                <p>
                  {t.noMatchFilter || "No equipment found matching these filters."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {sortedFilteredEquipment.map((item) => {
                  const location = item.location_village
                    ? `${item.location_village}${
                        item.location_district ? ", " + item.location_district : ""
                      }`
                    : "Pune";

                  const imageSrc =
                    Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0]
                      : "https://via.placeholder.com/80?text=Tractor";

                  const matchScore = calculateEquipmentSuitabilityScore(item);

                  return (
                    <div
                      key={item.id}
                      className="equipmentCard"
                      onClick={() => handleEquipmentClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="equipmentImage">
                        <img
                          src={imageSrc}
                          alt={item.title || "Equipment"}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                      <div className="equipmentInfo" style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="availableBadge">
                            ● {item.status === "allocated" ? "Currently Booked" : t.availableBadge || "Available"}
                          </span>
                          <span
                            style={{
                              background: "#e8f5e9",
                              color: "#2e7d32",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            ⭐ Match: {matchScore}%
                          </span>
                        </div>
                        <h4>{item.title}</h4>
                        <p className="location">📍 {location}</p>
                        <p className="price">
                          {item.hourly_rate
                            ? `₹${item.hourly_rate}${t.perHr || "/hr"}`
                            : ""}
                          {item.hourly_rate && item.daily_rate ? " | " : ""}
                          {item.daily_rate ? (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                fontWeight: "normal",
                              }}
                            >
                              ₹{item.daily_rate}{t.perDay || "/day"}
                            </span>
                          ) : null}
                        </p>
                        {renderBenchmarkBadge(item)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="dashboardSection">
            <h2 style={{ marginBottom: "4px" }}>
              {t.myBookingsTitle || "My Farm Bookings"}
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
              {t.myBookingsSub || "Active and past machinery bookings will appear here."}
            </p>

            {bookingsLoading ? (
              <p style={{ color: "#666" }}>Loading your bookings history...</p>
            ) : bookings.length === 0 ? (
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #eee",
                }}
              >
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {t.noBookings || "No active bookings found."}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
                  {t.noBookingsSub || "Book an equipment listing or match a task to get started."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {bookings.map((booking, idx) => {
                  const isCancelled =
                    booking.status === "Cancelled" ||
                    booking.status === "cancelled_by_owner" ||
                    booking.status === "rejected";

                  const isAllocated =
                    booking.status === "allocated" || booking.status === "completed";

                  return (
                    <div
                      key={booking.id || idx}
                      style={{
                        background: "#fff",
                        border: isCancelled ? "1px solid #ef9a9a" : "1px solid #c8e6c9",
                        borderRadius: "12px",
                        padding: "16px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            background: isCancelled
                              ? "#ffebee"
                              : isAllocated
                              ? "#e8f5e9"
                              : "#fff3e0",
                            color: isCancelled
                              ? "#c62828"
                              : isAllocated
                              ? "#2e7d32"
                              : "#e65100",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {isCancelled
                            ? "❌ Cancelled / Rejected"
                            : isAllocated
                            ? "✓ Confirmed"
                            : "⏳ Pending Approval"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          {booking.date || "Scheduled"}
                        </span>
                      </div>

                      <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#1b5e20" }}>
                        {booking.equipmentName || "Machinery Booking"}
                      </h3>

                      {booking.location && (
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#555" }}>
                          📍 {booking.location}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "10px",
                          paddingTop: "10px",
                          borderTop: "1px dashed #e0e0e0",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                          {t.totalPrice || "Total Amount"}:
                        </span>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32" }}>
                          ₹{booking.totalPrice || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "profile" && (
          <section className="dashboardSection">
            <h2>{t.farmerProfileTitle || "Farmer Profile"}</h2>
            <div
              style={{
                background: "#f9f9f9",
                padding: "16px",
                borderRadius: "12px",
                marginTop: "12px",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Role:</strong> Farmer
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Language:</strong> {language.toUpperCase()}
              </p>

              {/* FARMER ANALYTICS METRICS */}
              <div style={{ margin: "12px 0", padding: "12px", background: "#e8f5e9", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#2e7d32" }}>📊 Farmer Rental Analytics</h4>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  <strong>Total Rentals:</strong> {totalRentalsCount}
                </p>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  <strong>Completed Rentals:</strong> {completedRentalsCount}
                </p>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  <strong>Upcoming / Pending Rentals:</strong> {upcomingRentalsCount}
                </p>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  <strong>Total Spending:</strong> ₹{totalFarmerSpending.toLocaleString()}
                </p>
              </div>

              <p style={{ margin: "0 0 16px 0" }}>
                <strong>{t.appVersion || "App Version"}:</strong> 1.0.0 (Offline-Ready)
              </p>
              <button
                className="continueBtn"
                style={{ background: "#c62828" }}
                onClick={() => setScreen && setScreen("role")}
              >
                {t.switchRoleLogout || "Switch Role / Logout"}
              </button>
            </div>
          </section>
        )}
      </div>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "480px",
          height: "60px",
          background: "#fff",
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setActiveTab && setActiveTab("home")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: activeTab === "home" ? "#2e7d32" : "#888",
            fontWeight: activeTab === "home" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🏠</span>
          {t.navHome || "Home"}
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("bookings")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: activeTab === "bookings" ? "#2e7d32" : "#888",
            fontWeight: activeTab === "bookings" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>📋</span>
          {t.navBookings || "Bookings"}
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("profile")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: activeTab === "profile" ? "#2e7d32" : "#888",
            fontWeight: activeTab === "profile" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>👤</span>
          {t.navProfile || "Profile"}
        </button>
      </nav>
    </div>
  );
}