import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";

const DEFAULT_TRANSLATIONS = {
  en: {
    welcome: "Welcome back 👋",
    title: "Equipment Owner",
    quickActions: "Quick Actions",
    addEquipment: "+ Add New Equipment",
    myListedEquipment: "My Listed Equipment",
    loadingEquipment: "Loading your equipment...",
    noEquipment: "You have not added any equipment yet.",
    available: "Available",
    unlisted: "Unlisted",
    active: "Active",
    inactive: "Inactive",
    perDay: "/day",
    perHr: "/hr",
    locationSet: "Location set",
    rentalBookings: "Rental Bookings & Requests",
    ownerProfile: "Owner Profile",
    roleLabel: "Role:",
    roleValue: "Equipment Owner",
    contactLabel: "Phone / Email:",
    totalRented: "Total Equipment Rented",
    totalEarnings: "Total Profit / Earnings",
    avgRating: "Avg Rating",
    historyTitle: "Rental History & Priority Requests",
    loadingHistory: "Loading requests & history...",
    noHistory: "No pending requests, completed rentals, or ratings logged yet.",
    farmerLabel: "Farmer:",
    ratingGiven: "Rating Given:",
    noRating: "No rating yet",
    signOut: "Sign Out",
    navHome: "Home",
    navBookings: "Requests & History",
    navProfile: "Profile",
    notAuth: "Not authenticated.",
    fetchError: "Unable to fetch your listed equipment.",
    cancelBooking: "Cancel Booking",
    unlistEquipment: "Unlist Equipment",
    relistEquipment: "Relist Equipment",
    editEquipment: "Edit Details",
    activeBookings: "Currently Booked Details:",
    bookingEnds: "Booking Ends:",
    confirmCancelBooking: "Are you sure you want to cancel this booking? The farmer will be notified.",
    confirmUnlist: "This equipment has active booking(s). Unlisting will cancel them. Proceed?",
    bookingCancelledSuccess: "✅ Booking cancelled successfully.",
    equipmentUnlistedSuccess: "✅ Equipment unlisted successfully.",
    equipmentRelistedSuccess: "✅ Equipment relisted successfully.",
    equipmentDetails: "Equipment Details",
    close: "Close",
    description: "Description",
    pendingRequests: "Incoming Booking Requests (DPM Sorted)",
    approve: "Approve Request",
    reject: "Reject Request",
    priorityScore: "Priority Score (DPM):",
    urgency: "Urgency:",
    status: "Status:",
    actionSuccess: "✅ Task updated successfully.",
    actionError: "❌ Failed to update request.",
  },
  hi: {
    welcome: "वापसी पर स्वागत है 👋",
    title: "उपकरण मालिक",
    quickActions: "त्वरित कार्रवाई",
    addEquipment: "+ नया उपकरण जोड़ें",
    myListedEquipment: "मेरे सूचीबद्ध उपकरण",
    loadingEquipment: "आपके उपकरण लोड हो रहे हैं...",
    noEquipment: "आपने अभी तक कोई उपकरण नहीं जोड़ा है।",
    available: "उपलब्ध",
    unlisted: "सूचीबद्ध नहीं",
    active: "सक्रिय",
    inactive: "निष्क्रीय",
    perDay: "/दिन",
    perHr: "/घंटा",
    locationSet: "स्थान निर्धारित",
    rentalBookings: "किराया बुकिंग और अनुरोध",
    ownerProfile: "मालिक प्रोफ़ाइल",
    roleLabel: "भूमिका:",
    roleValue: "उपकरण मालिक",
    contactLabel: "फोन / ईमेल:",
    totalRented: "कुल किराये पर दिए गए उपकरण",
    totalEarnings: "कुल लाभ / कमाई",
    avgRating: "औसत रेटिंग",
    historyTitle: "किराया इतिहास और प्राथमिकता अनुरोध",
    loadingHistory: "अनुरोध और इतिहास लोड हो रहा है...",
    noHistory: "कोई लंबित अनुरोध या पूर्ण किराया दर्ज नहीं है।",
    farmerLabel: "किसान:",
    ratingGiven: "दी गई रेटिंग:",
    noRating: "अभी तक कोई रेटिंग नहीं",
    signOut: "साइन आउट",
    navHome: "होम",
    navBookings: "अनुरोध और इतिहास",
    navProfile: "प्रोफ़ाइल",
    notAuth: "प्रमाणित नहीं है।",
    fetchError: "आपके सूचीबद्ध उपकरणों को प्राप्त करने में असमर्थ।",
    cancelBooking: "बुकिंग रद्द करें",
    unlistEquipment: "उपकरण सूची से हटाएं",
    relistEquipment: "उपकरण पुनः सूचीबद्ध करें",
    editEquipment: "विवरण संपादित करें",
    activeBookings: "वर्तमान में बुक किए गए विवरण:",
    bookingEnds: "बुकिंग समाप्त:",
    confirmCancelBooking: "क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं?",
    confirmUnlist: "इस उपकरण की सक्रिय बुकिंग हैं। हटाने से वे रद्द हो जाएंगी। जारी रखें?",
    bookingCancelledSuccess: "✅ बुकिंग सफलतापूर्वक रद्द कर दी गई।",
    equipmentUnlistedSuccess: "✅ उपकरण सफलतापूर्वक हटा दिया गया।",
    equipmentRelistedSuccess: "✅ उपकरण सफलतापूर्वक पुनः सूचीबद्ध किया गया।",
    equipmentDetails: "उपकरण विवरण",
    close: "बंद करें",
    description: "विवरण",
    pendingRequests: "आने वाले बुकिंग अनुरोध (DPM प्राथमिकता)",
    approve: "स्वीकार करें",
    reject: "अस्वीकार करें",
    priorityScore: "प्राथमिकता स्कोर (DPM):",
    urgency: "अत्यावश्यकता:",
    status: "स्थिति:",
    actionSuccess: "✅ अनुरोध सफलतापूर्वक अपडेट किया गया।",
    actionError: "❌ अनुरोध अपडेट करने में विफल।",
  },
  mr: {
    welcome: "परत स्वागत आहे 👋",
    title: "साहित्य मालक",
    quickActions: "जलद कृती",
    addEquipment: "+ नवीन साहित्य जोडा",
    myListedEquipment: "माझे सूचीबद्ध साहित्य",
    loadingEquipment: "तुमचे साहित्य लोड होत आहे...",
    noEquipment: "तुम्ही अद्याप कोणतेही साहित्य जोडलेले नाही.",
    available: "उपलब्ध",
    unlisted: "अनलिस्ट केलेले",
    active: "सक्रिय",
    inactive: "अक्रिय",
    perDay: "/दिवस",
    perHr: "/तास",
    locationSet: "स्थान सेट केले",
    rentalBookings: "भाडे बुकिंग आणि विनंत्या",
    ownerProfile: "मालक प्रोफाइल",
    roleLabel: "भूमिका:",
    roleValue: "साहित्य मालक",
    contactLabel: "फोन / ईमेल:",
    totalRented: "एकूण भाड्याने दिलेले साहित्य",
    totalEarnings: "एकूण नफा / कमाई",
    avgRating: "सरासरी रेटिंग",
    historyTitle: "भाडे इतिहास आणि प्राधान्य विनंत्या",
    loadingHistory: "विनंत्या आणि इतिहास लोड होत आहे...",
    noHistory: "अद्याप कोणतीही प्रलंबित विनंती किंवा पूर्ण झालेले भाडे नाही.",
    farmerLabel: "शेतकरी:",
    ratingGiven: "दिलेले रेटिंग:",
    noRating: "अद्याप रेटिंग नाही",
    signOut: "साइन आउट",
    navHome: "होम",
    navBookings: "विनंत्या आणि इतिहास",
    navProfile: "प्रोफाइल",
    notAuth: "प्रमाणित नाही.",
    fetchError: "तुमचे सूचीबद्ध साहित्य मिळवण्यात अक्षम.",
    cancelBooking: "बुकिंग रद्द करा",
    unlistEquipment: "साहित्य अनलिस्ट करा",
    relistEquipment: "साहित्य पुन्हा लिस्ट करा",
    editEquipment: "तपशील संपादन करा",
    activeBookings: "सध्या बुक केलेले तपशील:",
    bookingEnds: "बुकिंग संपण्याची वेळ:",
    confirmCancelBooking: "तुम्हाला नक्की ही बुकिंग रद्द करायची आहे का?",
    confirmUnlist: "या साहित्यासाठी सक्रिय बुकिंग आहेत. अनलिस्ट केल्यास त्या रद्द होतील. पुढे जायचे?",
    bookingCancelledSuccess: "✅ बुकिंग यशस्वीरीत्या रद्द केली.",
    equipmentUnlistedSuccess: "✅ साहित्य यशस्वीरीत्या अनलिस्ट केले.",
    equipmentRelistedSuccess: "✅ साहित्य यशस्वीरीत्या पुन्हा लिस्ट केले.",
    equipmentDetails: "उपकरण तपशील",
    close: "बंद करा",
    description: "वर्णन",
    pendingRequests: "येणाऱ्या बुकिंग विनंत्या (DPM क्रमवारी)",
    approve: "मंजूर करा",
    reject: "नाकारा",
    priorityScore: "प्राधान्य गुण (DPM):",
    urgency: "तात्काळता:",
    status: "स्थिती:",
    actionSuccess: "✅ कार्य यशस्वीरित्या अद्ययावत केले.",
    actionError: "❌ अद्यतन अयशस्वी.",
  },
  kn: {
    welcome: "ಮತ್ತೆ ಸುಸ್ವಾಗತ 👋",
    title: "ಉಪಕರಣದ ಮಾಲೀಕರು",
    quickActions: "ತ್ವರಿತ ಕ್ರಮಗಳು",
    addEquipment: "+ ಹೊಸ ಉಪಕರಣವನ್ನು ಸೇರಿಸಿ",
    myListedEquipment: "ನನ್ನ ಪಟ್ಟಿಮಾಡಿದ ಉಪಕರಣಗಳು",
    loadingEquipment: "ನಿಮ್ಮ ಉಪಕರಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    noEquipment: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಉಪಕರಣಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ.",
    available: "ಲಭ್ಯವಿದೆ",
    unlisted: "ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ",
    active: "ಸಕ್ರಿಯ",
    inactive: "ನಿಷ್ಕ್ರಿಯ",
    perDay: "/ದಿನ",
    perHr: "/ಗಂಟೆ",
    locationSet: "ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಲಾಗಿದೆ",
    rentalBookings: "ಬಾಡಿಗೆ ಬುಕಿಂಗ್‌ಗಳು",
    ownerProfile: "ಮಾಲೀಕರ ಪ್ರೊಫೈಲ್",
    roleLabel: "ಪಾತ್ರ:",
    roleValue: "ಉಪಕರಣದ ಮಾಲೀಕರು",
    contactLabel: "ಫೋನ್ / ಇಮೇಲ್:",
    totalRented: "ಒಟ್ಟು ಬಾಡಿಗೆಗೆ ನೀಡಿದ ಉಪಕರಣಗಳು",
    totalEarnings: "ಒಟ್ಟು ಲಾಭ / ಗಳಿಕೆ",
    avgRating: "ಸರಾಸರಿ ರೇಟಿಂಗ್",
    historyTitle: "ಬಾಡಿಗೆ ಇತಿಹಾಸ ಮತ್ತು ವಿನಂತಿಗಳು",
    loadingHistory: "ವಿನಂತಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    noHistory: "ಇನ್ನೂ ಯಾವುದೇ ಬಾಕಿ ವಿನಂತಿಗಳು ಅಥವಾ ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆಗಳಿಲ್ಲ.",
    farmerLabel: "ರೈತ:",
    ratingGiven: "ನೀಡಿದ ರೇಟಿಂಗ್:",
    noRating: "ಇನ್ನೂ ಯಾವುದೇ ರೇಟಿಂಗ್ ನೀಡಿಲ್ಲ",
    signOut: "ಸೈನ್ ಔಟ್",
    navHome: "ಮುಖಪುಟ",
    navBookings: "ವಿನಂತಿಗಳು ಮತ್ತು ಇತಿಹಾಸ",
    navProfile: "ಪ್ರೊಫೈಲ್",
    notAuth: "ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿಲ್ಲ.",
    fetchError: "ನಿಮ್ಮ ಪಟ್ಟಿಮಾಡಿದ ಉಪಕರಣಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.",
    cancelBooking: "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಿ",
    unlistEquipment: "ಉಪಕರಣವನ್ನು ಅನ್‌ಲಿಸ್ಟ್ ಮಾಡಿ",
    relistEquipment: "ಉಪಕರಣವನ್ನು ಮರು ಪಟ್ಟಿ ಮಾಡಿ",
    editEquipment: "ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ",
    activeBookings: "ಪ್ರಸ್ತುತ ಬುಕ್ ಮಾಡಲಾದ ವಿವರಗಳು:",
    bookingEnds: "ಬುಕಿಂಗ್ ಮುಕ್ತಾಯ:",
    confirmCancelBooking: "ನೀವು ಖಚಿತವಾಗಿ ಈ ಬುಕಿಂಗ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲು ಬಯಸುತ್ತೀರಾ?",
    confirmUnlist: "ಈ ಉಪಕರಣವು ಸಕ್ರಿಯ ಬುಕಿಂಗ್‌ಗಳನ್ನು ಹೊಂದಿದೆ. ಅನ್‌ಲಿಸ್ಟ್ ಮಾಡುವುದರಿಂದ ಅವು ರದ್ದಾಗುತ್ತವೆ. ಮುಂದುವರಿಯಬೇಕೆ?",
    bookingCancelledSuccess: "✅ ಬುಕಿಂಗ್ ಸಾಫಲ್ಯವಾಗಿ ರದ್ದಾಗಿದೆ.",
    equipmentUnlistedSuccess: "✅ ಉಪಕರಣವನ್ನು ಸಾಫಲ್ಯವಾಗಿ ಅನ್‌ಲಿಸ್ಟ್ ಮಾಡಲಾಗಿದೆ.",
    equipmentRelistedSuccess: "✅ ಉಪಕರಣವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮರು ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ.",
    equipmentDetails: "ಉಪಕರಣದ ವಿವರಗಳು",
    close: "ಮುಚ್ಚಿ",
    description: "ವಿವರಣೆ",
    pendingRequests: "ಆಗಮಿಸುವ ಬುಕಿಂಗ್ ವಿನಂತಿಗಳು",
    approve: "ಅನುಮೋದಿಸಿ",
    reject: "ನಿರಾಕರಿಸಿ",
    priorityScore: "ಆದ್ಯತೆಯ ಸ್ಕೋರ್ (DPM):",
    urgency: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ:",
    status: "ಸ್ಥಿತಿ:",
    actionSuccess: "✅ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    actionError: "❌ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ.",
  },
};

const getEquipmentImage = (item) => {
  if (!item) return null;

  const rawFields = [
    item.images,
    item.image_url,
    item.photo_url,
    item.image,
    item.photo,
    item.img,
    item.imageUrl,
    item.photoUrl,
    item.image_path,
    item.photo_path,
    item.file_path,
    item.media,
  ];

  for (let rawImg of rawFields) {
    if (!rawImg) continue;

    if (Array.isArray(rawImg)) {
      rawImg = rawImg.find((el) => typeof el === "string" && el.trim() !== "");
    }

    if (typeof rawImg === "string" && rawImg.trim() !== "") {
      const trimmed = rawImg.trim();
      const cleanPath = trimmed.replace(/^[{"']+|["'}]+$/g, "");

      if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://") ||
        cleanPath.startsWith("data:") ||
        cleanPath.startsWith("blob:")
      ) {
        return cleanPath;
      }

      const buckets = ["equipment", "images", "uploads", "public"];
      for (const bucket of buckets) {
        try {
          const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        } catch (err) {
          // continue
        }
      }
      return cleanPath;
    }
  }

  return null;
};

const calculateDpmScore = (task) => {
  if (task.priority_score) return Number(task.priority_score).toFixed(2);

  const urgencyWeight = task.urgency === "high" ? 40 : task.urgency === "medium" ? 25 : 10;
  const landWeight = Math.min(Number(task.land_size_acres || 1) * 5, 30);
  const flexWeight = task.flexibility === "fixed" ? 20 : 10;
  
  return (urgencyWeight + landWeight + flexWeight).toFixed(2);
};

export default function OwnerDashboard({
  setScreen,
  setSelectedEquipment,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  language = "en",
  translations,
}) {
  const [internalTab, setInternalTab] = useState("home");
  const activeTab = externalActiveTab || internalTab;
  const setActiveTab = externalSetActiveTab || setInternalTab;

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [imageErrors, setImageErrors] = useState({});
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Edit Equipment Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    daily_rate: "",
    hourly_rate: "",
    district: "",
    description: "",
  });

  const [rentalHistory, setRentalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({ totalRented: 0, totalEarnings: 0, avgRating: "N/A" });

  const timerRef = useRef(null);

  const t = translations?.[language] || DEFAULT_TRANSLATIONS[language] || DEFAULT_TRANSLATIONS.en;

  const showNotice = (msg) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActionNotice(msg);
    timerRef.current = setTimeout(() => setActionNotice(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;

    if (!externalActiveTab) {
      setInternalTab("home");
    }
    fetchOwnerData();

    // REALTIME SUBSCRIPTION FOR EQUIPMENT & TASKS ON OWNER SIDE
    const ownerChannel = supabase
      .channel("realtime_owner_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        () => {
          if (isMounted) fetchOwnerData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "farm_tasks" },
        () => {
          if (isMounted) fetchOwnerData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(ownerChannel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { data: publicData, error: fetchError } = await supabase
        .from("equipment")
        .select("*, farm_tasks!equipment_assigned_id(*)");

      if (fetchError) {
        console.error("Owner equipment fetch error:", fetchError);
        setError(t.fetchError);
      } else {
        const rawDbItems = publicData || [];
        const cached = JSON.parse(localStorage.getItem("farmzy_cached_equipment") || "[]");
        const dbIds = new Set(rawDbItems.map((i) => i.id));
        const items = [...cached.filter((c) => !dbIds.has(c.id)), ...rawDbItems];
        setEquipmentList(items);
        if (items.length > 0) {
          fetchRentalHistory(items);
        }
      }
      setLoading(false);
      return;
    }

    setUserProfile(user);

    const { data: equipmentData, error: fetchError } = await supabase
      .from("equipment")
      .select("*, farm_tasks!equipment_assigned_id(*)")
      .eq("owner_id", user.id);

    if (fetchError) {
      console.error("Owner equipment fetch error:", fetchError);
      setError(t.fetchError);
    } else {
      const items = equipmentData || [];
      setEquipmentList(items);
      if (items.length > 0) {
        fetchRentalHistory(items);
      }
    }
    setLoading(false);
  };

  const fetchRentalHistory = async (equipmentItems) => {
    setHistoryLoading(true);
    const equipmentIds = equipmentItems.map((eq) => eq.id);

    if (equipmentIds.length === 0) {
      setHistoryLoading(false);
      return;
    }

    const { data: bookingsData, error: bookingError } = await supabase
      .from("farm_tasks")
      .select("*, equipment(title, daily_rate, hourly_rate)")
      .in("equipment_assigned_id", equipmentIds)
      .order("created_at", { ascending: false });

    if (bookingError) {
      console.error("Error fetching rental history:", bookingError);
      setHistoryLoading(false);
      return;
    }

    const history = (bookingsData || []).sort((a, b) => {
      const scoreA = parseFloat(calculateDpmScore(a));
      const scoreB = parseFloat(calculateDpmScore(b));
      return scoreB - scoreA;
    });

    setRentalHistory(history);

    const completedOrAllocated = history.filter(
      (b) => b.status === "completed" || b.status === "allocated"
    );

    const totalProfits = completedOrAllocated.reduce((acc, booking) => {
      const daily = booking.equipment?.daily_rate || 0;
      const hourly = booking.equipment?.hourly_rate || 0;
      const days = booking.duration_days || 1;
      const amount = daily ? daily * days : hourly ? hourly * 8 * days : 0;
      return acc + amount;
    }, 0);

    const ratedRentals = history.filter((b) => b.rating && b.rating > 0);
    const avg =
      ratedRentals.length > 0
        ? (
            ratedRentals.reduce((acc, curr) => acc + curr.rating, 0) /
            ratedRentals.length
          ).toFixed(1)
        : "N/A";

    setStats({
      totalRented: completedOrAllocated.length || history.length,
      totalEarnings: totalProfits,
      avgRating: avg,
    });

    setHistoryLoading(false);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, equipmentId) => {
    setProcessingId(taskId);

    const { error: updateError } = await supabase
      .from("farm_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (updateError) {
      showNotice(t.actionError);
    } else {
      if (newStatus === "allocated") {
        await supabase
          .from("equipment")
          .update({ status: "allocated" })
          .eq("id", equipmentId);
      }
      showNotice(t.actionSuccess);
      fetchOwnerData();
    }
    setProcessingId(null);
  };

  const handleRelistEquipment = async (item) => {
    setProcessingId(item.id);
    const { error: relistError } = await supabase
      .from("equipment")
      .update({
        is_active: true,
        status: "available",
      })
      .eq("id", item.id);

    if (relistError) {
      showNotice("❌ Failed to relist equipment: " + relistError.message);
    } else {
      showNotice(t.equipmentRelistedSuccess);
      fetchOwnerData();
    }
    setProcessingId(null);
  };

  const handleCancelBooking = async (taskId, equipmentId) => {
    if (!window.confirm(t.confirmCancelBooking)) return;

    setProcessingId(taskId);
    const { error: taskError } = await supabase
      .from("farm_tasks")
      .update({
        status: "cancelled_by_owner",
        equipment_assigned_id: null,
      })
      .eq("id", taskId);

    if (taskError) {
      showNotice("❌ Failed to cancel booking.");
      setProcessingId(null);
      return;
    }

    await supabase
      .from("equipment")
      .update({ status: "available" })
      .eq("id", equipmentId);

    showNotice(t.bookingCancelledSuccess);
    setProcessingId(null);
    fetchOwnerData();
  };

  const handleUnlistEquipment = async (item) => {
    console.log("Unlisting equipment item:", item);
    console.log("Primary key ID passed to .eq():", item?.id);

    if (!item?.id) {
      showNotice("❌ Cannot unlist: Missing equipment ID.");
      return;
    }

    const activeBookings = (item.farm_tasks || []).filter(
      (t) => t.status === "allocated" || t.status === "pending"
    );

    if (activeBookings.length > 0) {
      if (!window.confirm(t.confirmUnlist)) return;

      const activeBookingIds = activeBookings.map((b) => b.id);
      const { error: batchCancelError } = await supabase
        .from("farm_tasks")
        .update({
          status: "cancelled_by_owner",
          equipment_assigned_id: null,
        })
        .in("id", activeBookingIds);

      if (batchCancelError) {
        console.error("Batch cancel error:", batchCancelError);
        showNotice("❌ Failed to cancel active bookings during unlist.");
        return;
      }
    }

    setProcessingId(item.id);

    const { data: updatedRows, error: unlistError } = await supabase
      .from("equipment")
      .update({
        is_active: false,
        status: "unlisted",
      })
      .eq("id", item.id)
      .select();

    if (unlistError) {
      console.error("Unlist error from Supabase:", unlistError);
      showNotice("❌ Failed to unlist equipment: " + unlistError.message);
    } else if (!updatedRows || updatedRows.length === 0) {
      console.warn("0 rows updated in Supabase. Check RLS policies on 'equipment' table.");
      showNotice("❌ Permission denied: RLS policy is blocking database update.");
    } else {
      console.log("Successfully unlisted row in DB:", updatedRows);
      showNotice(t.equipmentUnlistedSuccess);
      fetchOwnerData();
    }

    setProcessingId(null);
  };

  // Open Edit Equipment Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || "",
      category: item.category || "Tractors",
      daily_rate: item.daily_rate || "",
      hourly_rate: item.hourly_rate || "",
      district: item.district || item.location || "",
      description: item.description || "",
    });
  };

  // Submit Edit Equipment Changes to Supabase
  const handleSaveEquipmentEdit = async (e) => {
    e.preventDefault();
    if (!editingItem?.id) return;

    setProcessingId(editingItem.id);
    const { error: updateError } = await supabase
      .from("equipment")
      .update({
        title: editForm.title,
        category: editForm.category,
        daily_rate: editForm.daily_rate ? Number(editForm.daily_rate) : null,
        hourly_rate: editForm.hourly_rate ? Number(editForm.hourly_rate) : null,
        district: editForm.district,
        description: editForm.description,
      })
      .eq("id", editingItem.id);

    if (updateError) {
      console.error("Edit Equipment Error:", updateError);
      showNotice("❌ Failed to update equipment details: " + updateError.message);
    } else {
      showNotice("✅ Equipment details updated successfully!");
      setEditingItem(null);
      fetchOwnerData();
    }
    setProcessingId(null);
  };

  const activeListedEquipment = equipmentList.filter(
    (item) => item.is_active !== false && item.status !== "unlisted"
  );

  const unlistedEquipment = equipmentList.filter(
    (item) => item.is_active === false || item.status === "unlisted"
  );

  const pendingRequests = rentalHistory.filter((task) => task.status === "pending");
  const processedRequests = rentalHistory.filter((task) => task.status !== "pending");

  // Calculate Utilization & Demand Metrics for Analytics Widget
  const totalEquipmentCount = equipmentList.length;
  const currentlyRentedCount = equipmentList.filter((e) => e.status === "allocated").length;
  const utilizationPercentage = totalEquipmentCount > 0
    ? Math.round((currentlyRentedCount / totalEquipmentCount) * 100)
    : 0;

  const urgentTasksCount = pendingRequests.filter((r) => r.urgency === "high" || r.urgency === "High").length;

  const equipmentRequestCounts = rentalHistory.reduce((acc, task) => {
    const name = task.equipment?.title || "Unknown Equipment";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const mostRequestedEquipment = Object.keys(equipmentRequestCounts).length > 0
    ? Object.keys(equipmentRequestCounts).reduce((a, b) => equipmentRequestCounts[a] > equipmentRequestCounts[b] ? a : b)
    : "No requests yet";

  // Calculate benchmark average for selected edit category
  const currentEditCat = editForm.category || "Tractors";
  const matchingCatItems = equipmentList.filter(
    (i) => (i.category || "").toLowerCase() === currentEditCat.toLowerCase() && i.daily_rate
  );
  const catAvgRate = matchingCatItems.length > 0
    ? Math.round(matchingCatItems.reduce((sum, i) => sum + Number(i.daily_rate), 0) / matchingCatItems.length)
    : null;

  return (
    <div className="dashboard" style={{ paddingBottom: "80px", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <header className="dashboardHeader">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setScreen("role")} style={styles.backButton}>
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px" }}>{t.title}</h1>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>{t.welcome}</p>
          </div>
        </div>
      </header>

      <section className="dashboardSection" style={{ padding: "16px" }}>
        {actionNotice && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: actionNotice.includes("❌") ? "#ffebee" : "#e8f5e9",
              color: actionNotice.includes("❌") ? "#c62828" : "#2e7d32",
              fontWeight: "bold",
              fontSize: "13px",
              border: actionNotice.includes("❌") ? "1px solid #ffcdd2" : "1px solid #c8e6c9",
            }}
          >
            {actionNotice}
          </div>
        )}

        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <div>
            <div style={styles.profitBannerCard}>
              <div>
                <span style={{ fontSize: "12px", opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  💰 {t.totalEarnings}
                </span>
                <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "800" }}>
                  ₹{stats.totalEarnings.toLocaleString()}
                </h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", opacity: 0.85 }}>Completed Rentals</span>
                <p style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "bold" }}>{stats.totalRented}</p>
              </div>
            </div>

            <div className="quickActions" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>{t.quickActions}</h3>
              <button
                className="actionBtn"
                onClick={() => setScreen("addEquipment")}
                style={styles.addBtn}
              >
                {t.addEquipment}
              </button>
            </div>

            <h2 style={{ fontSize: "18px", marginBottom: "14px", color: "#333" }}>{t.myListedEquipment}</h2>

            {loading && <p style={{ color: "#666" }}>{t.loadingEquipment}</p>}

            {error && <div style={styles.errorBox}>❌ {error}</div>}

            {!loading && !error && activeListedEquipment.length === 0 && (
              <p style={{ color: "#666" }}>{t.noEquipment}</p>
            )}

            {!loading &&
              !error &&
              activeListedEquipment.map((item) => {
                const activeTasks = (item.farm_tasks || []).filter(
                  (task) => task.status === "allocated" || task.status === "pending"
                );

                const imageUrl = getEquipmentImage(item);
                const hasImageError = imageErrors[item.id];

                return (
                  <div
                    key={item.id}
                    style={styles.cardContainer}
                    onClick={() => setSelectedItemDetail(item)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        {imageUrl && !hasImageError ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            style={styles.thumbnailImg}
                            onError={() => {
                              setImageErrors((prev) => ({ ...prev, [item.id]: true }));
                            }}
                          />
                        ) : (
                          <div style={styles.iconBox}>🚜</div>
                        )}
                        <div>
                          <h3 style={{ margin: 0, fontSize: "16px", color: "#1a1a1a", fontWeight: "700" }}>
                            {item.title}
                          </h3>
                          <span style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                            📁 {item.category}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: item.status === "allocated" ? "#fff3e0" : "#e8f5e9",
                          color: item.status === "allocated" ? "#e65100" : "#2e7d32",
                          border: item.status === "allocated" ? "1px solid #ffe0b2" : "1px solid #c8e6c9",
                          letterSpacing: "0.3px",
                        }}
                      >
                        ● {item.status === "allocated" ? "Currently Booked" : t.active}
                      </span>
                    </div>

                    <div style={styles.divider} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#555" }}>Rental Rate:</span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#2e7d32" }}>
                        ₹{item.daily_rate || item.hourly_rate}
                        <span style={{ fontSize: "12px", fontWeight: "normal", color: "#666" }}>
                          {item.daily_rate ? t.perDay : t.perHr}
                        </span>
                      </span>
                    </div>

                    {activeTasks.length > 0 && (
                      <div style={styles.bookingBox} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ fontSize: "12px", color: "#b78103", display: "block", marginBottom: "6px" }}>
                          ⚠️ {t.activeBookings}
                        </strong>
                        {activeTasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              marginTop: "6px",
                              fontSize: "12px",
                              background: "#fff",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #ffe082",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ color: "#333", fontWeight: "600" }}>
                                📅 Start: {task.earliest_start || "Today"} ({task.time_slot_start || "08:00"}–{task.time_slot_end || "18:00"})
                              </span>
                              <button
                                disabled={processingId === task.id}
                                onClick={() => handleCancelBooking(task.id, item.id)}
                                style={{
                                  ...styles.cancelBtn,
                                  opacity: processingId === task.id ? 0.6 : 1,
                                }}
                              >
                                {t.cancelBooking}
                              </button>
                            </div>
                            <span style={{ color: "#d84315", fontWeight: "bold", fontSize: "11px" }}>
                              ⏳ {t.bookingEnds} {task.latest_end || "End of sequence"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={styles.divider} />

                    {/* CARD ACTIONS: EDIT & UNLIST */}
                    <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(item)}
                        style={{
                          ...styles.actionBtnBase,
                          background: "#e3f2fd",
                          color: "#1976d2",
                          border: "1px solid #90caf9",
                          flex: 1,
                        }}
                      >
                        ✏️ {t.editEquipment || "Edit Details"}
                      </button>
                      <button
                        disabled={processingId === item.id}
                        onClick={() => handleUnlistEquipment(item)}
                        style={{
                          ...styles.actionBtnBase,
                          background: "#fff",
                          color: "#d32f2f",
                          border: "1px solid #ef9a9a",
                          flex: 1,
                          opacity: processingId === item.id ? 0.6 : 1,
                        }}
                      >
                        🔒 {t.unlistEquipment}
                      </button>
                    </div>
                  </div>
                );
              })}

            {unlistedEquipment.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", color: "#666", marginBottom: "12px" }}>Unlisted / Inactive Equipment</h3>
                {unlistedEquipment.map((item) => (
                  <div key={item.id} style={styles.unlistedCardContainer}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#555" }}>{item.title}</h4>
                        <span style={{ fontSize: "12px", color: "#888" }}>📁 {item.category}</span>
                      </div>
                      <button
                        disabled={processingId === item.id}
                        onClick={() => handleRelistEquipment(item)}
                        style={styles.relistBtn}
                      >
                        🔓 {t.relistEquipment}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUESTS & HISTORY */}
        {activeTab === "bookings" && (
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "14px" }}>{t.historyTitle}</h2>
            {historyLoading && <p>{t.loadingHistory}</p>}
            
            {!historyLoading && rentalHistory.length === 0 && (
              <p style={{ color: "#666" }}>{t.noHistory}</p>
            )}

            {!historyLoading && pendingRequests.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", color: "#2e7d32", marginBottom: "10px" }}>
                  {t.pendingRequests}
                </h3>
                {pendingRequests.map((b) => {
                  const score = calculateDpmScore(b);
                  return (
                    <div key={b.id} style={styles.requestCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>
                          {b.equipment?.title || "Equipment Request"}
                        </h4>
                        <span style={styles.priorityBadge}>⚡ {score}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#555", margin: "0 0 4px 0" }}>
                        {t.farmerLabel} {b.location_village || "Local Area"} • Crop: {b.crop || "N/A"}
                      </p>
                      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px 0" }}>
                        📅 Dates: {b.earliest_start || "Flexible"} | {t.urgency} <strong>{b.urgency || "Normal"}</strong>
                      </p>
                      
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          disabled={processingId === b.id}
                          onClick={() => handleUpdateTaskStatus(b.id, "allocated", b.equipment_assigned_id)}
                          style={styles.approveBtn}
                        >
                          {t.approve}
                        </button>
                        <button
                          disabled={processingId === b.id}
                          onClick={() => handleUpdateTaskStatus(b.id, "rejected", b.equipment_assigned_id)}
                          style={styles.rejectBtn}
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!historyLoading && processedRequests.length > 0 && (
              <div>
                <h3 style={{ fontSize: "15px", color: "#555", marginBottom: "10px" }}>Completed & Managed Tasks</h3>
                {processedRequests.map((b) => (
                  <div key={b.id} style={styles.historyCard}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>{b.equipment?.title || "Equipment"}</h4>
                    <p style={{ fontSize: "13px", color: "#666", margin: "0 0 4px 0" }}>
                      {t.farmerLabel} {b.location_village || "N/A"} • Crop: {b.crop || "N/A"}
                    </p>
                    <p style={{ fontSize: "12px", color: b.status === "allocated" ? "#2e7d32" : "#757575", fontWeight: "bold", margin: 0 }}>
                      {t.status} {b.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & ANALYTICS */}
        {activeTab === "profile" && (
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "14px" }}>{t.ownerProfile}</h2>
            <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #e0e0e0" }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>{t.roleLabel}</strong> {t.roleValue}
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>{t.contactLabel}</strong> {userProfile?.email || "N/A"}
              </p>
              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eee" }} />
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>{t.totalEarnings}:</strong> ₹{stats.totalEarnings.toLocaleString()}
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>{t.totalRented}:</strong> {stats.totalRented}
              </p>
              <p style={{ margin: "0 0 16px 0" }}>
                <strong>{t.avgRating}:</strong> ⭐ {stats.avgRating}
              </p>

              {/* ANALYTICS & UTILIZATION WIDGET */}
              <div style={{ marginTop: "16px", background: "#f8f9fa", padding: "14px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#2e7d32" }}>
                  📊 Fleet Utilization & Demand Insights
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#555" }}>Active Fleet Utilization:</span>
                  <strong style={{ fontSize: "13px", color: "#1b5e20" }}>{utilizationPercentage}%</strong>
                </div>
                {/* Progress bar */}
                <div style={{ background: "#e0e0e0", height: "8px", borderRadius: "4px", width: "100%", marginBottom: "12px" }}>
                  <div style={{ background: "#2e7d32", height: "100%", borderRadius: "4px", width: `${utilizationPercentage}%` }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>Incoming Pending Requests:</span>
                  <strong style={{ fontSize: "12px" }}>{pendingRequests.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>High-Urgency Demand Tasks:</span>
                  <strong style={{ fontSize: "12px", color: "#d32f2f" }}>{urgentTasksCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>Most Requested Equipment:</span>
                  <strong style={{ fontSize: "12px", color: "#2e7d32" }}>{mostRequestedEquipment}</strong>
                </div>
              </div>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setScreen("role");
                }}
                style={{ ...styles.signOutBtn, marginTop: "16px" }}
              >
                {t.signOut}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* EDIT EQUIPMENT MODAL */}
      {editingItem && (
        <div style={styles.modalOverlay} onClick={() => setEditingItem(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1a1a1a", fontWeight: "700" }}>✏️ Edit Equipment Details</h3>
              <button onClick={() => setEditingItem(null)} style={styles.closeModalBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveEquipmentEdit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Equipment Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="Tractors">Tractors</option>
                  <option value="Harvesters">Harvesters</option>
                  <option value="Rotavators">Rotavators</option>
                  <option value="Sprayers">Sprayers</option>
                  <option value="Tillage">Tillage</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={editForm.daily_rate}
                    onChange={(e) => setEditForm({ ...editForm, daily_rate: e.target.value })}
                    style={styles.modalInput}
                  />
                  {catAvgRate && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#2e7d32", fontWeight: "600" }}>
                      💡 Recommended District Avg for {currentEditCat}: ₹{catAvgRate}/day
                    </p>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editForm.hourly_rate}
                    onChange={(e) => setEditForm({ ...editForm, hourly_rate: e.target.value })}
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Location / District</label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Description</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ ...styles.modalInput, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ ...styles.modalCloseFooterBtn, background: "#757575", flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === editingItem.id}
                  style={{ ...styles.modalCloseFooterBtn, flex: 2 }}
                >
                  {processingId === editingItem.id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Details Modal */}
      {selectedItemDetail && (
        <div style={styles.modalOverlay} onClick={() => setSelectedItemDetail(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1a1a1a", fontWeight: "700" }}>{t.equipmentDetails}</h3>
              <button onClick={() => setSelectedItemDetail(null)} style={styles.closeModalBtn}>✕</button>
            </div>

            {getEquipmentImage(selectedItemDetail) ? (
              <img
                src={getEquipmentImage(selectedItemDetail)}
                alt={selectedItemDetail.title}
                style={styles.modalImage}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div style={styles.modalPlaceholderImage}>🚜</div>
            )}

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <h2 style={{ margin: "0 0 2px 0", fontSize: "20px", color: "#2e7d32" }}>{selectedItemDetail.title}</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>📁 <strong>Category:</strong> {selectedItemDetail.category}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>💰 <strong>Rate:</strong> ₹{selectedItemDetail.daily_rate || selectedItemDetail.hourly_rate} {selectedItemDetail.daily_rate ? t.perDay : t.perHr}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>📍 <strong>Location / District:</strong> {selectedItemDetail.district || selectedItemDetail.location || "N/A"}</p>
              
              {selectedItemDetail.description && (
                <div style={{ marginTop: "6px", background: "#f8f9fa", padding: "10px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                  <strong style={{ fontSize: "13px", color: "#333" }}>{t.description}:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#555", lineHeight: "1.4" }}>{selectedItemDetail.description}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedItemDetail(null)}
              style={styles.modalCloseFooterBtn}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav style={styles.navBar}>
        <button onClick={() => setActiveTab("home")} style={styles.navBtn(activeTab === "home")}>
          🏠 {t.navHome}
        </button>
        <button onClick={() => setActiveTab("bookings")} style={styles.navBtn(activeTab === "bookings")}>
          📋 {t.navBookings}
        </button>
        <button onClick={() => setActiveTab("profile")} style={styles.navBtn(activeTab === "profile")}>
          👤 {t.navProfile}
        </button>
      </nav>
    </div>
  );
}

const styles = {
  backButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    fontSize: "18px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  profitBannerCard: {
    background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "14px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
  },
  addBtn: {
    width: "100%",
    padding: "12px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  errorBox: {
    color: "#d32f2f",
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  cardContainer: {
    marginBottom: "16px",
    padding: "18px",
    border: "1px solid #e0e0e0",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  unlistedCardContainer: {
    padding: "12px 16px",
    border: "1px dashed #bdbdbd",
    borderRadius: "10px",
    background: "#fafafa",
    marginBottom: "10px",
  },
  relistBtn: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#f1f8e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  thumbnailImg: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "1px solid #e0e0e0",
    flexShrink: 0,
    backgroundColor: "#f5f5f5",
  },
  divider: {
    height: "1px",
    background: "#f0f0f0",
    width: "100%",
  },
  bookingBox: {
    background: "#fffde7",
    border: "1px solid #fff59d",
    padding: "10px 12px",
    borderRadius: "10px",
  },
  cancelBtn: {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  actionBtnBase: {
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  requestCard: {
    border: "1px solid #c8e6c9",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "12px",
    background: "#f1f8e9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  priorityBadge: {
    background: "#2e7d32",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  approveBtn: {
    flex: 1,
    padding: "8px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12px",
  },
  rejectBtn: {
    flex: 1,
    padding: "8px",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12px",
  },
  historyCard: {
    border: "1px solid #e0e0e0",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "12px",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  signOutBtn: {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
    backdropFilter: "blur(2px)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    width: "100%",
    maxWidth: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxSizing: "border-box",
  },
  modalInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "13px",
    boxSizing: "border-box",
    marginTop: "4px",
  },
  closeModalBtn: {
    background: "#f1f3f5",
    border: "none",
    fontSize: "16px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  modalPlaceholderImage: {
    width: "100%",
    height: "140px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    border: "1px solid #e0e0e0",
  },
  modalCloseFooterBtn: {
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    width: "100%",
  },
  navBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    padding: "12px 0",
    borderTop: "1px solid #e0e0e0",
    zIndex: 1000,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },
  navBtn: (isActive) => ({
    background: "none",
    border: "none",
    color: isActive ? "#2e7d32" : "#6c757d",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  }),
};