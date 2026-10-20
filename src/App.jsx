import { useState, useEffect } from "react";
import "./index.css";
import { supabase } from "./supabaseClient";
import BenchmarkRunner from "./components/BenchmarkRunner";

import Language from "./pages/Language";
import Role from "./pages/Role";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import FarmerDashboard from "./pages/FarmerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import EquipmentDetails from "./pages/EquipmentDetails";
import Booking from "./pages/Booking";
import Agreement from "./pages/Agreement";
import AddEquipment from "./pages/AddEquipment";
import CreateTask from "./pages/CreateTask";
import { getOfflineTasks, clearOfflineTasks } from "./utils/offlineStorage";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState("language");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [ownerTab, setOwnerTab] = useState("home");
  const [farmerTab, setFarmerTab] = useState("home");
  const [showBenchmark, setShowBenchmark] = useState(false);

  // State to hold task details for dynamic equipment pricing & booking calculations
  const [taskForm, setTaskForm] = useState({
    timeSlotStart: "08:00",
    timeSlotEnd: "12:00",
    estimatedWorkHours: 4,
    urgency: "High",
    crop: "Wheat",
    operation: "Sowing",
  });

  // Background offline task sync hook
  useEffect(() => {
    const syncOfflineTasks = async () => {
      if (!navigator.onLine) return;

      const pendingTasks = getOfflineTasks();
      if (!pendingTasks || pendingTasks.length === 0) return;

      console.log("Syncing offline tasks to Supabase...", pendingTasks);

      for (const task of pendingTasks) {
        delete task.local_id; // Remove local storage key before DB insertion
        const { error } = await supabase.from("farm_tasks").insert([task]);
        if (error) {
          console.error("Failed to sync task:", error);
        }
      }

      clearOfflineTasks();
      console.log("Offline sync complete!");
    };

    window.addEventListener("online", syncOfflineTasks);
    syncOfflineTasks(); // Run check on app load/mount

    return () => window.removeEventListener("online", syncOfflineTasks);
  }, []);

  const text = {
    en: {
      title: "Choose your language",
      sub: "Continue in your preferred language",
      button: "Continue",

      roleTitle: "How will you use Farmzy?",
      roleSubtitle: "Choose your role to continue",
      farmer: "Farmer",
      farmerDesc: "Find and rent farm equipment near you",
      owner: "Equipment Owner",
      ownerDesc: "List your machines and earn from rentals",

      loginTitle: "Login with phone",
      loginSub: "We'll send a 6-digit OTP",
      phoneNumberLabel: "Phone Number",
      enter10Digit: "Enter 10 digit number",
      invalidPhone: "Please enter a valid 10-digit mobile number",
      validPhone: "✓ Mobile number looks good",
      sendOtp: "Send OTP",
      autoFillTest: "⚡ Auto-fill test number",
      securityNote: "Your phone number is used securely for login verification.",

      otpHeaderTitle: "Verify your number",
      otpCardTitle: "Enter OTP",
      otpSub: "We've sent a 6-digit verification code to",
      verifyBtn: "Verify & Continue →",
      resendOtp: "Resend OTP",
      demoOtpAlert: "Demo OTP resent",

      greeting: "Good morning 👋",
      welcomeUser: "Namaste, Farmer",
      postTaskBtn: "Post Farm Task ➕",
      searchPlaceholder: "🔍 Search tractors, harvesters, location...",

      soilAll: "Soil: All Types",
      soilBlack: "Black Soil",
      soilRed: "Red Soil",
      soilAlluvial: "Alluvial Soil",
      soilLaterite: "Laterite Soil",

      opAll: "Operation: All",
      opSowing: "Sowing",
      opHarvesting: "Harvesting",
      opTilling: "Tilling",
      opSpraying: "Spraying",

      cropAll: "Crop: All",
      cropWheat: "Wheat",
      cropPaddy: "Paddy",
      cropSugarcane: "Sugarcane",
      cropCotton: "Cotton",

      maxPricePlaceholder: "Max Price (₹/day)",
      categoriesTitle: "Equipment Categories",
      clearFilter: "Clear filter",

      catTractors: "Tractors",
      catHarvesters: "Harvesters",
      catRotavators: "Rotavators",
      catSprayers: "Sprayers",

      availableListings: "Available Listings",
      loadingEquipment: "Loading available equipment...",
      noMatchFilter: "No equipment found matching these filters.",
      availableBadge: "Available",
      perDay: "/day",
      perHr: "/hr",

      myBookingsTitle: "My Farm Bookings",
      myBookingsSub: "Active and past machinery bookings will appear here.",
      noBookings: "No active bookings found.",
      noBookingsSub: "Book an equipment listing or match a task to get started.",

      farmerProfileTitle: "Farmer Profile",
      appVersion: "App Version",
      switchRoleLogout: "Switch Role / Logout",

      navHome: "Home",
      navBookings: "Bookings",
      navProfile: "Profile",

      bookNow: "Book Now",
      proceedToBook: "Proceed to Book",
      totalPrice: "Total Amount",
      estimatedHours: "Estimated Hours",
      urgencyCharge: "Urgency Charge",
      timeSlot: "Time Slot",
      hours: "hrs",
      day: "day",
      hr: "hr",
    },

    hi: {
      title: "अपनी भाषा चुनें",
      sub: "अपनी पसंदीदा भाषा में जारी रखें",
      button: "आगे बढ़ें",

      roleTitle: "आप Farmzy का उपयोग कैसे करेंगे?",
      roleSubtitle: "जारी रखने के लिए अपनी भूमिका चुनें",
      farmer: "किसान",
      farmerDesc: "अपने पास कृषि उपकरण खोजें और किराए पर लें",
      owner: "मशीन मालिक",
      ownerDesc: "अपनी मशीनें सूचीबद्ध करें और किराए से कमाएं",

      loginTitle: "फोन से लॉगिन करें",
      loginSub: "हम 6 अंकों का OTP भेजेंगे",
      phoneNumberLabel: "फोन नंबर",
      enter10Digit: "10 अंकों का नंबर दर्ज करें",
      invalidPhone: "कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें",
      validPhone: "✓ मोबाइल नंबर सही है",
      sendOtp: "OTP भेजें",
      autoFillTest: "⚡ परीक्षण नंबर ऑटो-फिल करें",
      securityNote: "आपके फोन नंबर का उपयोग लॉगिन सत्यापन के लिए सुरक्षित रूप से किया जाता है।",

      otpHeaderTitle: "अपना नंबर सत्यापित करें",
      otpCardTitle: "OTP दर्ज करें",
      otpSub: "हमने इस नंबर पर 6-अंकीय सत्यापन कोड भेजा है:",
      verifyBtn: "सत्यापित करें और आगे बढ़ें →",
      resendOtp: "पुनः OTP भेजें",
      demoOtpAlert: "डेमो OTP पुनः भेजा गया",

      greeting: "शुभ प्रभात 👋",
      welcomeUser: "नमस्ते, किसान",
      postTaskBtn: "कृषि कार्य पोस्ट करें ➕",
      searchPlaceholder: "🔍 ट्रैक्टर, हार्वेस्टर, स्थान खोजें...",

      soilAll: "मिट्टी: सभी प्रकार",
      soilBlack: "काली मिट्टी",
      soilRed: "लाल मिट्टी",
      soilAlluvial: "जलोढ़ मिट्टी",
      soilLaterite: "लैटेराइट मिट्टी",

      opAll: "कार्य: सभी",
      opSowing: "बुवाई",
      opHarvesting: "कटाई",
      opTilling: "जुताई",
      opSpraying: "छिड़काव",

      cropAll: "फसल: सभी",
      cropWheat: "गेहूँ",
      cropPaddy: "धान",
      cropSugarcane: "गन्ना",
      cropCotton: "कपास",

      maxPricePlaceholder: "अधिकतम मूल्य (₹/दिन)",
      categoriesTitle: "उपकरण श्रेणियां",
      clearFilter: "फ़िल्टर हटाएं",

      catTractors: "ट्रैक्टर",
      catHarvesters: "हार्वेस्टर",
      catRotavators: "रोटावेटर",
      catSprayers: "स्प्रेयर",

      availableListings: "उपलब्ध उपकरण",
      loadingEquipment: "उपलब्ध उपकरण लोड हो रहे हैं...",
      noMatchFilter: "इन फ़िल्टरों से मेल खाता कोई उपकरण नहीं मिला।",
      availableBadge: "उपलब्ध",
      perDay: "/दिन",
      perHr: "/घंटा",

      myBookingsTitle: "मेरी बुकिंग्स",
      myBookingsSub: "सक्रिय और पुरानी मशीनरी बुकिंग यहाँ दिखाई देंगी।",
      noBookings: "कोई सक्रिय बुकिंग नहीं मिली।",
      noBookingsSub: "शुरू करने के लिए एक उपकरण बुक करें या कार्य मैच करें।",

      farmerProfileTitle: "किसान प्रोफाइल",
      appVersion: "ऐप संस्करण",
      switchRoleLogout: "भूमिका बदलें / लॉगआउट",

      navHome: "होम",
      navBookings: "बुकिंग्स",
      navProfile: "प्रोफ़ाइल",

      bookNow: "अभी बुक करें",
      proceedToBook: "बुकिंग के लिए आगे बढ़ें",
      totalPrice: "कुल राशि",
      estimatedHours: "अनुमानित घंटे",
      urgencyCharge: "आपातकालीन शुल्क",
      timeSlot: "समय स्लॉट",
      hours: "घंटे",
      day: "दिन",
      hr: "घंटा",
    },

    mr: {
      title: "तुमची भाषा निवडा",
      sub: "तुमच्या पसंतीच्या भाषेत पुढे जा",
      button: "पुढे चला",

      roleTitle: "तुम्ही Farmzy चा वापर कसा कराल?",
      roleSubtitle: "पुढे जाण्यासाठी तुमची भूमिका निवडा",
      farmer: "शेतकरी",
      farmerDesc: "तुमच्या जवळील शेतीची यंत्रे शोधा आणि भाड्याने घ्या",
      owner: "यंत्र मालक",
      ownerDesc: "तुमची यंत्रे सूचीबद्ध करा आणि भाड्याने कमवा",

      loginTitle: "फोनद्वारे लॉगिन करा",
      loginSub: "आम्ही ६ अंकी OTP पाठवू",
      phoneNumberLabel: "फोन नंबर",
      enter10Digit: "१० अंकी नंबर टाका",
      invalidPhone: "कृपया वैध १० अंकी मोबाईल नंबर टाका",
      validPhone: "✓ मोबाईल नंबर योग्य आहे",
      sendOtp: "OTP पाठवा",
      autoFillTest: "⚡ चाचणी नंबर आपोआप भरा",
      securityNote: "तुमचा फोन नंबर सुरक्षितपणे लॉगिन पडताळणीसाठी वापरला जातो.",

      otpHeaderTitle: "तुमचा नंबर पडताळून पहा",
      otpCardTitle: "OTP टाका",
      otpSub: "आम्ही या नंबरवर ६ अंकी पडताळणी कोड पाठवला आहे:",
      verifyBtn: "पडताळणी करा आणि पुढे जा →",
      resendOtp: "पुन्हा OTP पाठवा",
      demoOtpAlert: "डेमो OTP पुन्हा पाठवला",

      greeting: "शुभ प्रभात 👋",
      welcomeUser: "नमस्ते, शेतकरी",
      postTaskBtn: "शेतीचे काम पोस्ट करा ➕",
      searchPlaceholder: "🔍 ट्रॅक्टर, हार्वेस्टर, ठिकाण शोधा...",

      soilAll: "माती: सर्व प्रकार",
      soilBlack: "काळी माती",
      soilRed: "लाल माती",
      soilAlluvial: "गाळाची माती",
      soilLaterite: "जांभा माती",

      opAll: "काम: सर्व",
      opSowing: "पेरणी",
      opHarvesting: "कापणी",
      opTilling: "नांगरणी",
      opSpraying: "फवारणी",

      cropAll: "पीक: सर्व",
      cropWheat: "गहू",
      cropPaddy: "भात",
      cropSugarcane: "ऊस",
      cropCotton: "कापूस",

      maxPricePlaceholder: "जास्तीत जास्त दर (₹/दिवस)",
      categoriesTitle: "यंत्रांचे प्रकार",
      clearFilter: "फिल्टर काढा",

      catTractors: "ट्रॅक्टर",
      catHarvesters: "हार्वेस्टर",
      catRotavators: "रोटाव्हेटर",
      catSprayers: "फवारणी यंत्रे",

      availableListings: "उपलब्ध यंत्रे",
      loadingEquipment: "उपलब्ध यंत्रे लोड होत आहेत...",
      noMatchFilter: "या फिल्टरनुसार कोणतेही यंत्र आढळले नाही.",
      availableBadge: "उपलब्ध",
      perDay: "/दिवस",
      perHr: "/तास",

      myBookingsTitle: "माझ्या बुकिंग्स",
      myBookingsSub: "सक्रिय आणि जुन्या बुकिंग्स येथे दिसतील.",
      noBookings: "कोणतीही सक्रिय बुकिंग आढळली नाही.",
      noBookingsSub: "सुरुवात करण्यासाठी एखादे यंत्र बुक करा.",

      farmerProfileTitle: "शेतकरी प्रोफाईल",
      appVersion: "ॲप आवृत्ती",
      switchRoleLogout: "भूमिका बदला / लॉगआउट",

      navHome: "होम",
      navBookings: "बुकिंग्स",
      navProfile: "प्रोफाईल",

      bookNow: "आत्ताच बुक करा",
      proceedToBook: "बुकिंगसाठी पुढे जा",
      totalPrice: "एकूण रक्कम",
      estimatedHours: "अंदाजित तास",
      urgencyCharge: "तातडीचा शुल्क",
      timeSlot: "वेळेचा स्लॉट",
      hours: "तास",
      day: "दिवस",
      hr: "तास",
    },

    kn: {
      title: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      sub: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ",
      button: "ಮುಂದುವರಿಯಿರಿ",

      roleTitle: "ನೀವು Farmzy ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ?",
      roleSubtitle: "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      farmer: "ರೈತ",
      farmerDesc: "ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಹುಡುಕಿ ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ",
      owner: "ಉಪಕರಣ ಮಾಲೀಕರು",
      ownerDesc: "ನಿಮ್ಮ ಯಂತ್ರಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಬಾಡಿಗೆಯಿಂದ ಸಂಪಾದಿಸಿ",

      loginTitle: "ಫೋನ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
      loginSub: "ನಾವು 6 ಅಂಕಿಗಳ OTP ಕಳುಹಿಸುತ್ತೇವೆ",
      phoneNumberLabel: "ಫೋನ್ ಸಂಖ್ಯೆ",
      enter10Digit: "10 ಅಂಕಿಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
      invalidPhone: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
      validPhone: "✓ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸರಿಯಾಗಿದೆ",
      sendOtp: "OTP ಕಳುಹಿಸಿ",
      autoFillTest: "⚡ ಪರೀಕ್ಷಾ ಸಂಖ್ಯೆಯನ್ನು ಆಟೋ-ಫಿಲ್ ಮಾಡಿ",
      securityNote: "ಲಾಗಿನ್ ಪರಿಶೀಲನೆಗಾಗಿ ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.",

      otpHeaderTitle: "ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
      otpCardTitle: "OTP ನಮೂದಿಸಿ",
      otpSub: "ನಾವು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಕೋಡ್ ಅನ್ನು ಇಲ್ಲಿಗೆ ಕಳುಹಿಸಿದ್ದೇವೆ:",
      verifyBtn: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ →",
      resendOtp: "ಮತ್ತೊಮ್ಮೆ OTP ಕಳುಹಿಸಿ",
      demoOtpAlert: "ಡೆಮೊ OTP ಅನ್ನು ಮರುಕಳುಹಿಸಲಾಗಿದೆ",

      greeting: "ಶುಭೋದಯ 👋",
      welcomeUser: "ನಮಸ್ಕಾರ, ರೈತರೇ",
      postTaskBtn: "ಕೃಷಿ ಕೆಲಸವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ ➕",
      searchPlaceholder: "🔍 ಟ್ರ್ಯಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್, ಸ್ಥಳವನ್ನು ಹುಡುಕಿ...",

      soilAll: "ಮಣ್ಣು: ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
      soilBlack: "ಕಪ್ಪು ಮಣ್ಣು",
      soilRed: "ಕೆಂಪು ಮಣ್ಣು",
      soilAlluvial: "ಪಾಲಿನ ಮಣ್ಣು",
      soilLaterite: "ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು",

      opAll: "ಕೆಲಸ: ಎಲ್ಲಾ",
      opSowing: "ಬಿತ್ತನೆ",
      opHarvesting: "ಕೊಯ್ಲು",
      opTilling: "ಉಳುಮೆ",
      opSpraying: "ಸಿಂಪಡಣೆ",

      cropAll: "ಬೆಳೆ: ಎಲ್ಲಾ",
      cropWheat: "ಗೋಧಿ",
      cropPaddy: "ಭತ್ತ",
      cropSugarcane: "ಕಬ್ಬು",
      cropCotton: "ಹತ್ತಿ",

      maxPricePlaceholder: "ಗರಿಷ್ಠ ಬೆಲೆ (₹/ದಿನ)",
      categoriesTitle: "ಉಪಕರಣದ ವರ್ಗಗಳು",
      clearFilter: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",

      catTractors: "ಟ್ರ್ಯಾಕ್ಟರ್‌ಗಳು",
      catHarvesters: "ಹಾರ್ವೆಸ್ಟರ್‌ಗಳು",
      catRotavators: "ರೊಟಾವೇಟರ್‌ಗಳು",
      catSprayers: "ಸ್ಪ್ರೇಯರ್‌ಗಳು",

      availableListings: "ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳು",
      loadingEquipment: "ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      noMatchFilter: "ಈ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದುವ ಯಾವುದೇ ಉಪಕರಣ ಕಂಡುಬಂದಿಲ್ಲ.",
      availableBadge: "ಲಭ್ಯವಿದೆ",
      perDay: "/ದಿನ",
      perHr: "/ಗಂಟೆ",

      myBookingsTitle: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು",
      myBookingsSub: "ಸಕ್ರಿಯ ಮತ್ತು ಹಿಂದಿನ ಯಂತ್ರೋಪಕರಣಗಳ ಬುಕಿಂಗ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
      noBookings: "ಯಾವುದೇ ಸಕ್ರಿಯ ಬುಕಿಂಗ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      noBookingsSub: "ಪ್ರಾರಂಭಿಸಲು ಉಪಕರಣವನ್ನು ಕಾಯ್ದಿರಿಸಿ.",

      farmerProfileTitle: "ರೈತರ ಪ್ರೊಫೈಲ್",
      appVersion: "ಆಪ್ ಆವೃತ್ತಿ",
      switchRoleLogout: "ಪಾತ್ರವನ್ನು ಬದಲಾಯಿಸಿ / ಲಾಗ್‌ಔಟ್ ಮಾಡಿ",

      navHome: "ಹೋಮ್",
      navBookings: "ಬುಕಿಂಗ್‌ಗಳು",
      navProfile: "ಪ್ರೊಫೈಲ್",

      bookNow: "ಈಗಲೇ ಬುಕ್ ಮಾಡಿ",
      proceedToBook: "ಬುಕಿಂಗ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",
      totalPrice: "ಒಟ್ಟು ಮೊತ್ತ",
      estimatedHours: "ಅಂದಾಜು ಗಂಟೆಗಳು",
      urgencyCharge: "ತುರ್ತು ಶುಲ್ಕ",
      timeSlot: "ಸಮಯದ ಸ್ಲಾಟ್",
      hours: "ಗಂಟೆಗಳು",
      day: "ದಿನ",
      hr: "ಗಂಟೆ",
    },
  };

  // 1. Standalone render when Benchmark Suite is explicitly opened (bypasses .screen phone frame)
  if (showBenchmark) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: "20px" }}>
        <button
          onClick={() => setShowBenchmark(false)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 99999,
            padding: "12px 20px",
            backgroundColor: "#1976d2",
            color: "#ffffff",
            border: "none",
            borderRadius: "30px",
            fontWeight: "bold",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          ⬅️ Back to Farmzy App
        </button>
        <BenchmarkRunner />
      </div>
    );
  }

  // 2. Main Farmzy mobile app render (Clean UI)
  return (
    <div className="screen" style={{ position: "relative" }}>
      {screen === "language" && (
        <Language
          language={language}
          setLanguage={setLanguage}
          text={text}
          setScreen={setScreen}
        />
      )}

      {screen === "role" && (
        <Role
          language={language}
          text={text}
          setScreen={setScreen}
          setRole={setRole}
        />
      )}

      {screen === "login" && (
        <Login
          language={language}
          text={text}
          role={role}
          setScreen={setScreen}
          setPhone={setPhone}
        />
      )}

      {screen === "otp" && (
        <OTP
          language={language}
          text={text}
          phone={phone}
          role={role}
          setScreen={setScreen}
        />
      )}

      {screen === "farmerDashboard" && (
        <FarmerDashboard
          language={language}
          text={text}
          setScreen={setScreen}
          setSelectedEquipment={setSelectedEquipment}
          activeTab={farmerTab}
          setActiveTab={setFarmerTab}
          farmerId={phone || "8fb77df6-4299-4f8e-b2e1-e4898854436b"}
        />
      )}

      {screen === "ownerDashboard" && (
        <OwnerDashboard
          setScreen={setScreen}
          setSelectedEquipment={setSelectedEquipment}
          activeTab={ownerTab}
          setActiveTab={setOwnerTab}
          language={language}
        />
      )}

      {screen === "addEquipment" && <AddEquipment setScreen={setScreen} />}

      {screen === "createTask" && (
        <CreateTask
          setScreen={setScreen}
          setSelectedEquipment={setSelectedEquipment}
          setTaskForm={setTaskForm}
          language={language}
          text={text}
        />
      )}

      {screen === "equipmentDetails" && (
        <EquipmentDetails
          setScreen={setScreen}
          selectedEquipment={selectedEquipment}
          role={role}
          taskForm={taskForm}
          setFarmerTab={setFarmerTab}
          language={language}
          text={text}
        />
      )}

      {screen === "booking" && (
        <Booking
          setScreen={setScreen}
          selectedEquipment={selectedEquipment}
        />
      )}

      {screen === "agreement" && (
        <Agreement
          setScreen={setScreen}
          selectedEquipment={selectedEquipment}
          phone={phone}
        />
      )}
    </div>
  );
}