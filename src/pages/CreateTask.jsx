import { useState } from "react";
import { supabase } from "../supabaseClient";
import { saveOfflineTask } from "../utils/offlineStorage";

// Complete Localized Translations Dictionary
const TRANSLATIONS = {
  en: {
    postTaskTitle: "Post Farm Task",
    offlineNoticeText: "⚡ You are offline. Task saved locally and will sync when reconnected.",
    verifyError: "❌ Error verifying schedule availability.",
    operationRequired: "Operation Required",
    cropType: "Crop Type",
    cropPlaceholder: "e.g. Wheat, Paddy",
    landSize: "Land Size (Acres)",
    landSizePlaceholder: "e.g. 5",
    soilType: "Soil Type",
    locationVillage: "Location Village",
    dateWindow: "Date Window",
    deadline: "Deadline",
    slotStartTime: "Slot Start Time",
    slotEndTime: "Slot End Time",
    urgencyLevel: "Urgency Level",
    findMatchingEquipment: "Find Matching Equipment",
    matchingResults: "Matching Results",
    modifyTask: "Modify Task",
    selectedTimeWindow: "Selected Time Window:",
    noMatchingEquipment: "No equipment meets the current compatibility score threshold.",
    available: "Available",
    matchingScore: "Matching Score:",
    selectAndBook: "Select Slot & Book →",
    locationNA: "Location N/A",
    perDay: "/day",
    perHr: "/hr",
    opSowing: "Sowing",
    opHarvesting: "Harvesting",
    opTilling: "Tilling",
    opSpraying: "Spraying",
    soilBlack: "Black Soil",
    soilRed: "Red Soil",
    soilAlluvial: "Alluvial Soil",
    soilLaterite: "Laterite Soil",
    urgencyHigh: "High",
    urgencyMedium: "Medium",
    urgencyLow: "Low",
  },
  hi: {
    postTaskTitle: "खेत का कार्य पोस्ट करें",
    offlineNoticeText: "⚡ आप ऑफलाइन हैं। कार्य स्थानीय रूप से सहेजा गया है और ऑनलाइन होने पर सिंक हो जाएगा।",
    verifyError: "❌ समय-सारणी की उपलब्धता सत्यापित करने में त्रुटि।",
    operationRequired: "आवश्यक कार्य",
    cropType: "फसल का प्रकार",
    cropPlaceholder: "जैसे गेहूं, धान",
    landSize: "जमीन का आकार (एकड़)",
    landSizePlaceholder: "जैसे 5",
    soilType: "मिट्टी का प्रकार",
    locationVillage: "गांव का स्थान",
    dateWindow: "तारीख की सीमा",
    deadline: "अंतिम तिथि",
    slotStartTime: "स्लॉट शुरू होने का समय",
    slotEndTime: "स्लॉट समाप्त होने का समय",
    urgencyLevel: "आपातकाल स्तर",
    findMatchingEquipment: "उपयुक्त उपकरण खोजें",
    matchingResults: "मिलते-जुलते परिणाम",
    modifyTask: "कार्य में संशोधन करें",
    selectedTimeWindow: "चयनित समय अवधि:",
    noMatchingEquipment: "वर्तमान अनुकूलता मानदंड से मेल खाने वाला कोई उपकरण नहीं मिला।",
    available: "उपलब्ध",
    matchingScore: "मैचिंग स्कोर:",
    selectAndBook: "स्लॉट चुनें और बुक करें →",
    locationNA: "स्थान उपलब्ध नहीं",
    perDay: "/दिन",
    perHr: "/घंटा",
    opSowing: "बुआई (Sowing)",
    opHarvesting: "कटाई (Harvesting)",
    opTilling: "जुताई (Tilling)",
    opSpraying: "छिड़काव (Spraying)",
    soilBlack: "काली मिट्टी",
    soilRed: "लाल मिट्टी",
    soilAlluvial: "जलोढ़ मिट्टी",
    soilLaterite: "लैटराइट मिट्टी",
    urgencyHigh: "उच्च (High)",
    urgencyMedium: "मध्यम (Medium)",
    urgencyLow: "कम (Low)",
  },
  mr: {
    postTaskTitle: "शेतातील काम पोस्ट करा",
    offlineNoticeText: "⚡ तुम्ही ऑफलाइन आहात. काम स्थानिक पातळीवर सेव्ह केले आहे आणि ऑनलाइन झाल्यावर सिंक होईल.",
    verifyError: "❌ वेळापत्रक उपलब्धतेची पडताळणी करताना त्रुटी आली.",
    operationRequired: "आवश्यक काम",
    cropType: "पिकाचा प्रकार",
    cropPlaceholder: "उदा. गव्हाचे पिक, भात",
    landSize: "जमिनीचे क्षेत्रफळ (एकर)",
    landSizePlaceholder: "उदा. ५",
    soilType: "मातीचा प्रकार",
    locationVillage: "गावाचे नाव",
    dateWindow: "दिनांक मर्यादा",
    deadline: "अंतिम मुदत",
    slotStartTime: "स्लॉट सुरू होण्याची वेळ",
    slotEndTime: "स्लॉट संपण्याची वेळ",
    urgencyLevel: "तातडीची पातळी",
    findMatchingEquipment: "योग्य उपकरणे शोधा",
    matchingResults: "जुळणारे निकाल",
    modifyTask: "कामात बदल करा",
    selectedTimeWindow: "निवडलेली वेळ:",
    noMatchingEquipment: "सध्याच्या सुसंगतता स्कोअरशी जुळणारे कोणतेही उपकरण नाही.",
    available: "उपलब्ध",
    matchingScore: "मॅचिंग स्कोअर:",
    selectAndBook: "स्लॉट निवडा आणि बुक करा →",
    locationNA: "स्थान उपलब्ध नाही",
    perDay: "/दिवस",
    perHr: "/तास",
    opSowing: "पेरणी (Sowing)",
    opHarvesting: "कापणी (Harvesting)",
    opTilling: "नांगरणी (Tilling)",
    opSpraying: "फवारणी (Spraying)",
    soilBlack: "काळी माती",
    soilRed: "लाल माती",
    soilAlluvial: "गाळाची माती",
    soilLaterite: "जांभी माती",
    urgencyHigh: "जास्त (High)",
    urgencyMedium: "मध्यम (Medium)",
    urgencyLow: "कमी (Low)",
  },
  kn: {
    postTaskTitle: "ಕೃಷಿ ಕೆಲಸವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ",
    offlineNoticeText: "⚡ ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಕೆಲಸವನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ಮರುಸಂಪರ್ಕಗೊಂಡಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.",
    verifyError: "❌ ವೇಳಾಪಟ್ಟಿಯ ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷವಾಗಿದೆ.",
    operationRequired: "ಅಗತ್ಯವಿರುವ ಕಾರ್ಯಾಚರಣೆ",
    cropType: "ಬೆಳೆಯ ಪ್ರಕಾರ",
    cropPlaceholder: "ಉದಾ. ಗೋಧಿ, ಬತ್ತ",
    landSize: "ಜಮೀನಿನ ಗಾತ್ರ (ಎಕರೆ)",
    landSizePlaceholder: "ಉದಾ. 5",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    locationVillage: "ಗ್ರಾಮದ ಸ್ಥಳ",
    dateWindow: "ದಿನಾಂಕದ ಮಿತಿ",
    deadline: "ಕೊನೆಯ ದಿನಾಂಕ",
    slotStartTime: "ಸ್ಲಾಟ್ ಪ್ರಾರಂಭವಾಗುವ ಸಮಯ",
    slotEndTime: "ಸ್ಲಾಟ್ ಮುಕ್ತಾಯದ ಸಮಯ",
    urgencyLevel: "ತುರ್ತು ಮಟ್ಟ",
    findMatchingEquipment: "ಸೂಕ್ತವಾದ ಉಪಕರಣವನ್ನು ಹುಡುಕಿ",
    matchingResults: "ಹೊಂದುವ ಫಲಿತಾಂಶಗಳು",
    modifyTask: "ಕೆಲಸವನ್ನು ಮಾರ್ಪಡಿಸಿ",
    selectedTimeWindow: "ಆಯ್ಕೆಮಾಡಿದ ಸಮಯದ ಮಿತಿ:",
    noMatchingEquipment: "ಪ್ರಸ್ತುತ ಹೊಂದಾಣಿಕೆಯ ಸ್ಕೋರ್‌ಗೆ ಯಾವುದೇ ಉಪಕರಣಗಳು ಸಿಗಲಿಲ್ಲ.",
    available: "ಲಭ್ಯವಿದೆ",
    matchingScore: "ಹೊಂದಾಣಿಕೆಯ ಸ್ಕೋರ್:",
    selectAndBook: "ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಬುಕ್ ಮಾಡಿ →",
    locationNA: "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ",
    perDay: "/ದಿನ",
    perHr: "/ಗಂಟೆಗೆ",
    opSowing: "ಬಿತ್ತನೆ (Sowing)",
    opHarvesting: "ಕೊಯ್ಲು (Harvesting)",
    opTilling: "ಉಳುಮೆ (Tilling)",
    opSpraying: "ಸಿಂಪಡಣೆ (Spraying)",
    soilBlack: "ಕಪ್ಪು ಮಣ್ಣು",
    soilRed: "ಕೆಂಪು ಮಣ್ಣು",
    soilAlluvial: "ಮೆಕ್ಕಲು ಮಣ್ಣು",
    soilLaterite: "ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು",
    urgencyHigh: "ಹೆಚ್ಚು (High)",
    urgencyMedium: "ಮಧ್ಯಮ (Medium)",
    urgencyLow: "ಕಡಿಮೆ (Low)",
  },
};

export default function CreateTask({
  setScreen,
  setSelectedEquipment,
  setTaskForm,
  language = "en",
  text,
}) {
  const [form, setForm] = useState({
    operation: "Sowing",
    crop: "Wheat",
    landSize: "",
    soilType: "Black soil",
    locationVillage: "Wagholi",
    earliestStart: "",
    deadline: "",
    estimatedWorkHours: "",
    urgency: "High",
    timeSlotStart: "08:00",
    timeSlotEnd: "12:00",
  });

  const [matchingEquipment, setMatchingEquipment] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [bookingMessage, setBookingMessage] = useState(null);

  // Safe multi-level fallback mechanism
  const activeLang = TRANSLATIONS[language] ? language : "en";
  const dictFromProp = text?.[language] || text?.[activeLang] || {};
  const dictFromLocal = TRANSLATIONS[activeLang] || TRANSLATIONS.en;

  // Translation helper function
  const getLabel = (key, fallback) => {
    return dictFromProp[key] || dictFromLocal[key] || fallback;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMatchSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setOfflineNotice(false);
    setBookingMessage(null);

    const urgencyEnum = (form.urgency || "high").toLowerCase();
    const validUrgency = ["low", "medium", "high"].includes(urgencyEnum) ? urgencyEnum : "high";

    const taskPayload = {
      operation_type: form.operation,
      crop_type: form.crop,
      land_size_acres: parseFloat(form.landSize) || 1,
      soil_type: form.soilType,
      location_village: form.locationVillage,
      earliest_start: form.earliestStart || new Date().toISOString().split("T")[0],
      duration_hours: parseFloat(form.estimatedWorkHours) || 4,
      urgency_level: validUrgency,
      time_slot_start: form.timeSlotStart ? (form.timeSlotStart.length === 5 ? `${form.timeSlotStart}:00` : form.timeSlotStart) : "08:00:00",
      time_slot_end: form.timeSlotEnd ? (form.timeSlotEnd.length === 5 ? `${form.timeSlotEnd}:00` : form.timeSlotEnd) : "12:00:00",
      status: "pending",
    };

    if (!navigator.onLine) {
      taskPayload.local_id = "offline_" + Date.now();
      saveOfflineTask(taskPayload);
      setOfflineNotice(true);
      setCurrentTaskId(taskPayload.local_id);
    } else {
      try {
        const { data: insertedTask, error: insertError } = await supabase
          .from("farm_tasks")
          .insert([taskPayload])
          .select()
          .single();

        if (insertError) {
          console.warn("Notice: Task saved locally. Backend message:", insertError.message);
          taskPayload.local_id = "task_" + Date.now();
          saveOfflineTask(taskPayload);
          setCurrentTaskId(taskPayload.local_id);
        } else if (insertedTask) {
          setCurrentTaskId(insertedTask.id);
        }
      } catch (err) {
        console.warn("Task insert exception, caching locally:", err);
        taskPayload.local_id = "task_" + Date.now();
        saveOfflineTask(taskPayload);
        setCurrentTaskId(taskPayload.local_id);
      }
    }

    // Filter out unlisted and inactive machines
    const { data, error } = await supabase
  .from("equipment")
  .select("*")
  .eq('is_active', true); // <-- Safely filters active equipment using your boolean column
    if (error) {
      console.error("Error fetching match data:", error);
      setSearching(false);
      return;
    }

    const equipmentList = data || [];

    const scoredList = equipmentList.map((item) => {
      let baseScore = 20;

      const caps = item.equipment_capabilities || [];
      const matchesOp = caps.some(
        (c) => c.operation?.toLowerCase() === form.operation.toLowerCase()
      );
      const matchesSoil = caps.some(
        (c) => c.soil_type?.toLowerCase() === form.soilType.toLowerCase()
      );
      const matchesCrop = caps.some(
        (c) => c.crop?.toLowerCase() === form.crop.toLowerCase()
      );

      let capabilityScore = 0;
      if (matchesOp) capabilityScore += 15;
      if (matchesSoil) capabilityScore += 15;
      if (matchesCrop) capabilityScore += 10;
      if (item.category?.toLowerCase().includes(form.operation.toLowerCase()))
        capabilityScore += 10;

      let availabilityScore = item.status === "available" ? 15 : 0;
      let distanceKm = item.distance_km || 4;
      let distanceScore = Math.max(0, 15 - distanceKm * 0.5);
      let deadlineScore = 10;
      let reliabilityScore = (item.rating || 4.7) * 2;
      let urgencyScore =
        form.urgency === "High" ? 10 : form.urgency === "Medium" ? 6 : 3;

      let totalMatchingScore = Math.round(
        baseScore +
          capabilityScore +
          availabilityScore +
          distanceScore +
          deadlineScore +
          reliabilityScore +
          urgencyScore
      );

      const finalScore = Math.min(totalMatchingScore, 100);
      return { ...item, compatibilityScore: finalScore };
    });

    scoredList.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    setMatchingEquipment(scoredList);
    setSearching(false);
    setSubmitted(true);
  };

  const handleSelectAndBookEquipment = async (item) => {
    if (!currentTaskId) {
      const { data: fallbackTask } = await supabase
        .from("farm_tasks")
        .insert([
          {
            operation: form.operation,
            crop: form.crop,
            land_size_acres: parseFloat(form.landSize) || 1,
            soil_type: form.soilType,
            location_village: form.locationVillage,
            earliest_start:
              form.earliestStart || new Date().toISOString().split("T")[0],
            time_slot_start: form.timeSlotStart,
            time_slot_end: form.timeSlotEnd,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (fallbackTask) setCurrentTaskId(fallbackTask.id);
    }

    const targetDate =
      form.earliestStart || new Date().toISOString().split("T")[0];

    const { data: existingBookings, error: fetchError } = await supabase
      .from("farm_tasks")
      .select("*")
      .eq("equipment_assigned_id", item.id)
      .eq("earliest_start", targetDate);

    if (fetchError) {
      console.error("Error verifying schedule:", fetchError);
      setBookingMessage(getLabel("verifyError", "❌ Error verifying schedule availability."));
      return;
    }

    const toMinutes = (timeStr) => {
      const [h, m] = (timeStr || "00:00").split(":");
      return parseInt(h || 0) * 60 + parseInt(m || 0);
    };

    const newStart = toMinutes(form.timeSlotStart);
    const newEnd = toMinutes(form.timeSlotEnd);

    const hasOverlap = (existingBookings || []).some((booking) => {
      if (!booking.time_slot_start || !booking.time_slot_end) return false;
      if (currentTaskId && booking.id === currentTaskId) return false;

      const existingStart = toMinutes(booking.time_slot_start);
      const existingEnd = toMinutes(booking.time_slot_end);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      setBookingMessage(
        `❌ Conflict: ${item.title} is already booked during ${form.timeSlotStart}–${form.timeSlotEnd}.`
      );
      return;
    }

    if (currentTaskId && typeof currentTaskId === "string" && !currentTaskId.startsWith("offline_") && !currentTaskId.startsWith("task_")) {
      try {
        await supabase
          .from("farm_tasks")
          .update({
            equipment_assigned_id: item.id,
            time_slot_start: form.timeSlotStart.length === 5 ? `${form.timeSlotStart}:00` : form.timeSlotStart,
            time_slot_end: form.timeSlotEnd.length === 5 ? `${form.timeSlotEnd}:00` : form.timeSlotEnd,
            status: "in_progress",
          })
          .eq("id", currentTaskId);
      } catch (e) {
        console.warn("Could not update task on backend:", e);
      }
    }

    if (setTaskForm) {
      setTaskForm({
        timeSlotStart: form.timeSlotStart,
        timeSlotEnd: form.timeSlotEnd,
        estimatedWorkHours: parseFloat(form.estimatedWorkHours) || 4,
        urgency: form.urgency,
        crop: form.crop,
        operation: form.operation,
        soilType: form.soilType,
        locationVillage: form.locationVillage,
        earliestStart: form.earliestStart || new Date().toISOString().split("T")[0],
        taskId: currentTaskId,
      });
    }

    if (setSelectedEquipment) setSelectedEquipment(item);
    setScreen("equipmentDetails");
  };

  return (
    <div className="dashboard">
      <header className="dashboardHeader">
        <button
          className="globalBackButton"
          onClick={() => setScreen("farmerDashboard")}
        >
          ←
        </button>
        <div>
          <h1>{getLabel("postTaskTitle", "Post Farm Task")}</h1>
        </div>
      </header>

      <section className="dashboardSection">
        {offlineNotice && (
          <div
            style={{
              background: "#fff3cd",
              color: "#856404",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "13px",
            }}
          >
            {getLabel("offlineNoticeText", "⚡ You are offline. Task saved locally.")}
          </div>
        )}

        {bookingMessage && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {bookingMessage}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleMatchSearch}>
            <label className="label">
              {getLabel("operationRequired", "Operation Required")}
            </label>
            <select
              className="formInput"
              name="operation"
              value={form.operation}
              onChange={handleChange}
            >
              <option value="Sowing">{getLabel("opSowing", "Sowing")}</option>
              <option value="Harvesting">{getLabel("opHarvesting", "Harvesting")}</option>
              <option value="Tilling">{getLabel("opTilling", "Tilling")}</option>
              <option value="Spraying">{getLabel("opSpraying", "Spraying")}</option>
            </select>

            <label className="label">
              {getLabel("cropType", "Crop Type")}
            </label>
            <input
              className="formInput"
              type="text"
              name="crop"
              placeholder={getLabel("cropPlaceholder", "e.g. Wheat, Paddy")}
              value={form.crop}
              onChange={handleChange}
              required
            />

            <label className="label">
              {getLabel("landSize", "Land Size (Acres)")}
            </label>
            <input
              className="formInput"
              type="number"
              name="landSize"
              placeholder={getLabel("landSizePlaceholder", "e.g. 5")}
              value={form.landSize}
              onChange={handleChange}
              required
            />

            <label className="label">
              {getLabel("soilType", "Soil Type")}
            </label>
            <select
              className="formInput"
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
            >
              <option value="Black soil">{getLabel("soilBlack", "Black Soil")}</option>
              <option value="Red soil">{getLabel("soilRed", "Red Soil")}</option>
              <option value="Alluvial soil">{getLabel("soilAlluvial", "Alluvial Soil")}</option>
              <option value="Laterite soil">{getLabel("soilLaterite", "Laterite Soil")}</option>
            </select>

            <label className="label">
              {getLabel("locationVillage", "Location Village")}
            </label>
            <input
              className="formInput"
              type="text"
              name="locationVillage"
              value={form.locationVillage}
              onChange={handleChange}
              required
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className="label">
                  {getLabel("dateWindow", "Date Window")}
                </label>
                <input
                  className="formInput"
                  type="date"
                  name="earliestStart"
                  value={form.earliestStart}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">
                  {getLabel("deadline", "Deadline")}
                </label>
                <input
                  className="formInput"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className="label">
                  {getLabel("slotStartTime", "Slot Start Time")}
                </label>
                <input
                  className="formInput"
                  type="time"
                  name="timeSlotStart"
                  value={form.timeSlotStart}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">
                  {getLabel("slotEndTime", "Slot End Time")}
                </label>
                <input
                  className="formInput"
                  type="time"
                  name="timeSlotEnd"
                  value={form.timeSlotEnd}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="label" style={{ marginTop: "10px" }}>
              {getLabel("urgencyLevel", "Urgency Level")}
            </label>
            <select
              className="formInput"
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
            >
              <option value="High">{getLabel("urgencyHigh", "High")}</option>
              <option value="Medium">{getLabel("urgencyMedium", "Medium")}</option>
              <option value="Low">{getLabel("urgencyLow", "Low")}</option>
            </select>

            <button
              className="continueBtn"
              type="submit"
              disabled={searching}
              style={{
                marginTop: "20px",
                background: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              {searching ? "..." : getLabel("findMatchingEquipment", "Find Matching Equipment")}
            </button>
          </form>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2>
                {getLabel("matchingResults", "Matching Results")} ({matchingEquipment.length})
              </h2>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#2e7d32",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={() => setSubmitted(false)}
              >
                {getLabel("modifyTask", "Modify Task")}
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
              {getLabel("selectedTimeWindow", "Selected Time Window:")}{" "}
              <strong>
                {form.timeSlotStart} - {form.timeSlotEnd}
              </strong>
            </p>

            {matchingEquipment.length === 0 && (
              <p style={{ color: "#666" }}>
                {getLabel("noMatchingEquipment", "No equipment meets current compatibility score threshold.")}
              </p>
            )}

            {matchingEquipment.map((item) => (
              <div
                key={item.id}
                className="equipmentCard"
                onClick={() => handleSelectAndBookEquipment(item)}
                style={{ cursor: "pointer", marginBottom: "12px" }}
              >
                <div className="equipmentInfo" style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span className="availableBadge">
                      ● {getLabel("available", "Available")}
                    </span>
                    <span
                      style={{
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {getLabel("matchingScore", "Matching Score:")} {item.compatibilityScore}%
                    </span>
                  </div>

                  <h3 style={{ margin: "6px 0" }}>{item.title}</h3>
                  <p className="location">
                    📍 {item.location_village || getLabel("locationNA", "Location N/A")} • {item.category}
                  </p>

                  <div className="equipmentBottom">
                    <strong>
                      ₹{item.daily_rate || item.hourly_rate || "N/A"}
                      <small>{item.daily_rate ? getLabel("perDay", "/day") : getLabel("perHr", "/hr")}</small>
                    </strong>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#2e7d32",
                        fontWeight: "bold",
                      }}
                    >
                      {getLabel("selectAndBook", "Select Slot & Book →")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}