import { useState } from "react";
import { supabase } from "../supabaseClient";

// Localization dictionary for English, Hindi, Marathi, and Kannada
const TRANSLATIONS = {
  en: {
    noEquipment: "No equipment selected.",
    backToDashboard: "Back to Dashboard",
    conditionReview: "Equipment Condition Review",
    clickToInspect: "🔍 Click to inspect full photo",
    available: "available",
    location: "Location:",
    category: "Category:",
    makeModel: "Make / Model:",
    year: "Year:",
    operatingSpeed: "Operating Speed:",
    maxRadius: "Max Travel Radius:",
    hourlyRate: "Hourly Rate:",
    dailyRate: "Daily Rate:",
    perHr: "/hr",
    perDay: "/day",
    na: "N/A",
    pricingTitle: "📊 Dynamic Time-Slot Pricing",
    allocatedWindow: "Allocated Window:",
    baseRate: "Base Rate",
    hours: "Hours",
    urgencySurge: "Urgency Surge",
    surcharge: "+20% Surcharge",
    standard: "Standard",
    totalRentalCost: "Total Rental Cost:",
    agreementTitle: "📝 Rental Agreement & Terms",
    termStrictWindow: "Strict Time Window: Equipment must be operated strictly between",
    and: "and",
    termOperator: "Operator & Fuel: Covers standard operation for",
    task: "task",
    termOverstay: "Overstay Penalty: Delaying past",
    termOverstayEnd: "incurs priority shift violation fees.",
    deleteConfirm: "Are you sure you want to unlist/delete",
    deleteFailed: "Failed to delete equipment. Please try again.",
    unlisting: "Unlisting Equipment...",
    unlistBtn: "🗑️ Unlist / Delete Equipment",
    bookingConfirmedTitle: "Booking Confirmed!",
    bookingConfirmedDesc: "Time slot secured successfully without scheduling conflicts.",
    viewBookings: "View My Bookings",
    securingSlot: "Securing Slot...",
    confirmAndPay: "Confirm & Pay",
    photo: "Photo",
    of: "of",
  },
  hi: {
    noEquipment: "कोई उपकरण चुना नहीं गया है।",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    conditionReview: "उपकरण स्थिति समीक्षा",
    clickToInspect: "🔍 पूरी फोटो देखने के लिए क्लिक करें",
    available: "उपलब्ध",
    location: "स्थान:",
    category: "श्रेणी:",
    makeModel: "मेक / मॉडल:",
    year: "वर्ष:",
    operatingSpeed: "ऑपरेटिंग गति:",
    maxRadius: "अधिकतम यात्रा त्रिज्या:",
    hourlyRate: "प्रति घंटा दर:",
    dailyRate: "प्रति दिन दर:",
    perHr: "/घंटा",
    perDay: "/दिन",
    na: "उपलब्ध नहीं",
    pricingTitle: "📊 गतिशील समय-स्लॉट मूल्य निर्धारण",
    allocatedWindow: "आवंटित समय:",
    baseRate: "मूल दर",
    hours: "घंटे",
    urgencySurge: "आपातकालीन शुल्क",
    surcharge: "+20% अतिरिक्त शुल्क",
    standard: "मानक",
    totalRentalCost: "कुल किराया लागत:",
    agreementTitle: "📝 किराया समझौता और शर्तें",
    termStrictWindow: "सख्त समय सीमा: उपकरण का संचालन कड़ाई से",
    and: "और",
    termOperator: "ऑपरेटर और ईंधन: मानक संचालन को कवर करता है",
    task: "कार्य",
    termOverstay: "अधिक समय रुकने का जुर्माना:",
    termOverstayEnd: "के बाद देरी करने पर प्राथमिकता उल्लंघन शुल्क लगेगा।",
    deleteConfirm: "क्या आप वाकई हटाना चाहते हैं",
    deleteFailed: "उपकरण हटाने में विफल। कृपया पुनः प्रयास करें।",
    unlisting: "उपकरण हटाया जा रहा है...",
    unlistBtn: "🗑️ सूची से हटाएं / उपकरण हटाएं",
    bookingConfirmedTitle: "बुकिंग की पुष्टि हो गई!",
    bookingConfirmedDesc: "बिना किसी शेड्यूलिंग संघर्ष के समय स्लॉट सफलतापूर्वक सुरक्षित किया गया।",
    viewBookings: "मेरी बुकिंग देखें",
    securingSlot: "स्लॉट सुरक्षित किया जा रहा है...",
    confirmAndPay: "पुष्टि करें और भुगतान करें",
    photo: "फोटो",
    of: "का",
  },
  mr: {
    noEquipment: "कोणतेही साहित्य निवडलेले नाही.",
    backToDashboard: "डॅशबोर्डवर परत जा",
    conditionReview: "साहित्य स्थिती पुनरावलोकन",
    clickToInspect: "🔍 संपूर्ण फोटो पाहण्यासाठी क्लिक करा",
    available: "उपलब्ध",
    location: "स्थान:",
    category: "वर्ग:",
    makeModel: "मेक / मॉडेल:",
    year: "वर्ष:",
    operatingSpeed: "कार्यरत गती:",
    maxRadius: "कमाल प्रवास त्रिज्या:",
    hourlyRate: "प्रति तास दर:",
    dailyRate: "प्रति दिन दर:",
    perHr: "/तास",
    perDay: "/दिवस",
    na: "लागू नाही",
    pricingTitle: "📊 डायनॅमिक टाइम-स्लॉट किंमत",
    allocatedWindow: "नियुक्त वेळ:",
    baseRate: "मूळ दर",
    hours: "तास",
    urgencySurge: "तातडीचे शुल्क",
    surcharge: "+20% अतिरिक्त शुल्क",
    standard: "मानक",
    totalRentalCost: "एकूण भाडे खर्च:",
    agreementTitle: "📝 भाडे करार आणि अटी",
    termStrictWindow: "सक्तीची वेळ मर्यादा: साहित्य काटेकोरपणे",
    and: "आणि",
    termOperator: "चालक आणि इंधन: मानकीकृत ऑपरेशन समाविष्ट आहे",
    task: "काम",
    termOverstay: "उशिरा जमा दंड:",
    termOverstayEnd: "नंतर उशीर झाल्यास उल्लंघन शुल्क आकारले जाईल.",
    deleteConfirm: "तुम्हाला खरोखर हटवायचे आहे का",
    deleteFailed: "साहित्य हटवण्यात अक्षम. कृपया पुन्हा प्रयत्न करा.",
    unlisting: "साहित्य हटवले जात आहे...",
    unlistBtn: "🗑️ सूचीतून काढा / साहित्य हटवा",
    bookingConfirmedTitle: "बुकिंगची पुष्टी झाली!",
    bookingConfirmedDesc: "कोणत्याही वेळापत्रक संघर्षाशिवाय वेळेचा स्लॉट यशस्वीरित्या सुरक्षित झाला.",
    viewBookings: "माझ्या बुकिंग पहा",
    securingSlot: "स्लॉट सुरक्षित केला जात आहे...",
    confirmAndPay: "पुष्टी करा आणि भरणा करा",
    photo: "फोटो",
    of: "पैकी",
  },
  kn: {
    noEquipment: "ಯಾವುದೇ ಉಪಕರಣವನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ.",
    backToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    conditionReview: "ಉಪಕರಣದ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ",
    clickToInspect: "🔍 ಪೂರ್ಣ ಫೋಟೋ ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    available: "ಲಭ್ಯವಿದೆ",
    location: "ಸ್ಥಳ:",
    category: "ವರ್ಗ:",
    makeModel: "ತಯಾರಿಕೆ / ಮಾದರಿ:",
    year: "ವರ್ಷ:",
    operatingSpeed: "ಕಾರ್ಯಾಚರಣೆಯ ವೇಗ:",
    maxRadius: "ಗರಿಷ್ಠ ಪ್ರಯಾಣದ ತ್ರಿಜ್ಯ:",
    hourlyRate: "ಗಂಟೆಯ ದರ:",
    dailyRate: "ದೈನಂದಿನ ದರ:",
    perHr: "/ಗಂಟೆ",
    perDay: "/ದಿನ",
    na: "ಲಭ್ಯವಿಲ್ಲ",
    pricingTitle: "📊 ಡೈನಾಮಿಕ್ ಸಮಯ-ಸ್ಲಾಟ್ ಬೆಲೆ",
    allocatedWindow: "ನಿಯೋಜಿತ ಸಮಯ:",
    baseRate: "ಮೂಲ ದರ",
    hours: "ಗಂಟೆಗಳು",
    urgencySurge: "ತುರ್ತು ಸರ್ಚಾರ್ಜ್",
    surcharge: "+20% ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ",
    standard: "ಸಾಮಾನ್ಯ",
    totalRentalCost: "ಒಟ್ಟು ಬಾಡಿಗೆ ವೆಚ್ಚ:",
    agreementTitle: "📝 ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಮತ್ತು ನಿಯಮಗಳು",
    termStrictWindow: "ಕಟ್ಟುನಿಟ್ಟಾದ ಸಮಯದ ಮಿತಿ: ಉಪಕರಣವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ",
    and: "ಮತ್ತು",
    termOperator: "ಆಪರೇಟರ್ ಮತ್ತು ಇಂಧನ: ನಿಯಮಿತ ಕಾರ್ಯಾಚರಣೆಯನ್ನು ಒಳಗೊಂಡಿದೆ",
    task: "ಕೆಲಸ",
    termOverstay: "ಹೆಚ್ಚುವರಿ ಸಮಯದ ದಂಡ:",
    termOverstayEnd: "ನಂತರ ವಿಳಂಬ ಮಾಡಿದರೆ ಆದ್ಯತೆ ಉಲ್ಲಂಘನೆ ಶುಲ್ಕ ಅನ್ವಯಿಸುತ್ತದೆ.",
    deleteConfirm: "ನೀವು ನಿಜವಾಗಿಯೂ ಅಳಿಸಲು ಬಯಸುತ್ತೀರಾ",
    deleteFailed: "ಉಪಕರಣವನ್ನು ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    unlisting: "ಉಪಕರಣವನ್ನು ತೆಗೆದುಹಾಕಲಾಗುತ್ತಿದೆ...",
    unlistBtn: "🗑️ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಿ / ಅಳಿಸಿ",
    bookingConfirmedTitle: "ಬುಕಿಂಗ್ ಖಚಿತವಾಗಿದೆ!",
    bookingConfirmedDesc: "ಸಮಯದ ಸ್ಲಾಟ್ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    viewBookings: "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    securingSlot: "ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಲಾಗುತ್ತಿದೆ...",
    confirmAndPay: "ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಪಾವತಿಸಿ",
    photo: "ಫೋಟೋ",
    of: "ರ",
  },
};

export default function EquipmentDetails({
  setScreen,
  selectedEquipment,
  role,
  taskForm,
  setFarmerTab,
  language = "en",
  translations,
}) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOwner = role === "owner";

  // Resolve language translation dictionary
  const t =
    translations?.[language] ||
    TRANSLATIONS[language] ||
    TRANSLATIONS.en;

  if (!selectedEquipment) {
    return (
      <div className="dashboard">
        <p style={{ padding: "20px" }}>{t.noEquipment}</p>
        <button
          className="continueBtn"
          onClick={() =>
            setScreen(isOwner ? "ownerDashboard" : "farmerDashboard")
          }
        >
          {t.backToDashboard}
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `${t.deleteConfirm} "${selectedEquipment.title}"?`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    setDeleteError("");

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", selectedEquipment.id);

    if (error) {
      console.error("Error deleting equipment:", error);
      setDeleteError(t.deleteFailed);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setScreen("ownerDashboard");
  };

  const village =
    selectedEquipment.location_village || selectedEquipment.locationVillage;
  const district =
    selectedEquipment.location_district || selectedEquipment.locationDistrict;
  const locationText = village
    ? `${village}${district ? ", " + district : ""}`
    : t.na;

  const categoryText = selectedEquipment.category || t.na;
  const makeModelText =
    selectedEquipment.make_model || selectedEquipment.makeModel || t.na;
  const yearText =
    selectedEquipment.manufacture_year ||
    selectedEquipment.manufactureYear ||
    t.na;

  const speedValue =
    selectedEquipment.operating_speed_kmh || selectedEquipment.operatingSpeed;
  const speedText = speedValue ? `${speedValue} km/h` : t.na;

  const radiusValue =
    selectedEquipment.max_travel_radius_km || selectedEquipment.maxTravelRadius;
  const radiusText = radiusValue ? `${radiusValue} km` : t.na;

  const hourlyRateValue =
    selectedEquipment.hourly_rate || selectedEquipment.hourlyRate || 500;
  const dailyRateText =
    selectedEquipment.daily_rate || selectedEquipment.dailyRate;

  const imagesList = selectedEquipment.images || [];

  const activeForm = taskForm || {
    timeSlotStart: "08:00",
    timeSlotEnd: "12:00",
    estimatedWorkHours: 4,
    urgency: "High",
    crop: "Wheat",
    operation: "Sowing",
  };

  const calculateDurationHours = () => {
    if (!activeForm.timeSlotStart || !activeForm.timeSlotEnd)
      return parseFloat(activeForm.estimatedWorkHours) || 4;
    const [hStart, mStart] = activeForm.timeSlotStart.split(":").map(Number);
    const [hEnd, mEnd] = activeForm.timeSlotEnd.split(":").map(Number);
    const diffHours = hEnd + mEnd / 60 - (hStart + mStart / 60);
    return diffHours > 0 ? diffHours : 4;
  };

  const durationHours = calculateDurationHours();
  const basePrice = durationHours * Number(hourlyRateValue);
  const urgencyMultiplier = activeForm.urgency === "High" ? 1.2 : 1.0;
  const finalCalculatedPrice = Math.round(basePrice * urgencyMultiplier);

  const handleConfirmBooking = async () => {
    setConfirmingBooking(true);

    try {
      if (activeForm.taskId && typeof activeForm.taskId === "string" && !activeForm.taskId.startsWith("offline_") && !activeForm.taskId.startsWith("task_")) {
        await supabase
          .from("farm_tasks")
          .update({ status: "in_progress" })
          .eq("id", activeForm.taskId);
      }
    } catch (err) {
      console.warn("Could not update task status on backend:", err);
    }

    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.title,
      location: locationText,
      timeSlot: `${activeForm.timeSlotStart} – ${activeForm.timeSlotEnd} (${durationHours} ${t.hours})`,
      totalPrice: finalCalculatedPrice,
      status: "Confirmed",
      date: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString(),
      crop: activeForm.crop,
      operation: activeForm.operation,
    };

    const existingBookings = JSON.parse(
      localStorage.getItem("farmzy_bookings") || "[]"
    );
    const updatedBookings = [newBooking, ...existingBookings];
    localStorage.setItem("farmzy_bookings", JSON.stringify(updatedBookings));

    setConfirmingBooking(false);
    setBookingConfirmed(true);
  };

  const handleViewBookings = () => {
    if (setFarmerTab) {
      setFarmerTab("bookings");
    }
    setScreen("farmerDashboard");
  };

  return (
    <div className="dashboard">
      <header className="dashboardHeader">
        <button
          className="globalBackButton"
          onClick={() =>
            setScreen(isOwner ? "ownerDashboard" : "farmerDashboard")
          }
        >
          ←
        </button>

        <div>
          <span className="greeting">{t.conditionReview}</span>
          <h1>{selectedEquipment.title}</h1>
        </div>
      </header>

      <section className="dashboardSection">
        <div className="equipmentCard" style={{ flexDirection: "column" }}>
          <div
            className="equipmentImage"
            onClick={() => imagesList.length > 0 && setIsModalOpen(true)}
            style={{
              width: "100%",
              height: "220px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9f9f9",
              borderRadius: "15px",
              overflow: "hidden",
              position: "relative",
              cursor: imagesList.length > 0 ? "zoom-in" : "default",
            }}
          >
            {imagesList.length > 0 ? (
              <>
                <img
                  src={imagesList[activeImageIndex] || imagesList[0]}
                  alt={selectedEquipment.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {t.clickToInspect} ({activeImageIndex + 1}/
                  {imagesList.length})
                </div>
              </>
            ) : (
              <span style={{ fontSize: "64px" }}>🚜</span>
            )}
          </div>

          {imagesList.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "10px",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              {imagesList.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`Condition angle ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                  style={{
                    width: "65px",
                    height: "55px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      activeImageIndex === index
                        ? "2px solid #2e7d32"
                        : "2px solid transparent",
                    opacity: activeImageIndex === index ? 1 : 0.6,
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          )}

          <div
            className="equipmentInfo"
            style={{ width: "100%", marginTop: "14px" }}
          >
            <span className="availableBadge">
              ● {selectedEquipment.status || t.available}
            </span>

            <h3 style={{ fontSize: "20px", margin: "8px 0" }}>
              {selectedEquipment.title}
            </h3>

            <p className="location">📍 {t.location} {locationText}</p>

            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              <p>
                <strong>{t.category}</strong> {categoryText}
              </p>
              <p>
                <strong>{t.makeModel}</strong> {makeModelText}
              </p>
              <p>
                <strong>{t.year}</strong> {yearText}
              </p>
              <p>
                <strong>{t.operatingSpeed}</strong> {speedText}
              </p>
              <p>
                <strong>{t.maxRadius}</strong> {radiusText}
              </p>
            </div>

            <hr
              style={{
                margin: "14px 0",
                border: "0",
                borderTop: "1px solid #ccc",
              }}
            />

            <div className="equipmentBottom">
              <div>
                <p style={{ margin: 0 }}>
                  <strong>{t.hourlyRate}</strong> ₹{hourlyRateValue}{t.perHr}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>{t.dailyRate}</strong>{" "}
                  {dailyRateText ? `₹${dailyRateText}${t.perDay}` : t.na}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isOwner && !bookingConfirmed && (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                background: "#f1f8e9",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #c8e6c9",
              }}
            >
              <h3 style={{ color: "#2e7d32", marginBottom: "10px" }}>
                {t.pricingTitle}
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                <span>{t.allocatedWindow}</span>
                <strong>
                  {activeForm.timeSlotStart} – {activeForm.timeSlotEnd} (
                  {durationHours} {t.hours})
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                <span>
                  {t.baseRate} ({durationHours} hrs × ₹{hourlyRateValue}{t.perHr}):
                </span>
                <span>₹{basePrice}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                <span>{t.urgencySurge} ({activeForm.urgency}):</span>
                <span>
                  {urgencyMultiplier > 1 ? t.surcharge : t.standard}
                </span>
              </div>
              <hr
                style={{
                  border: "0",
                  borderTop: "1px solid #c8e6c9",
                  margin: "10px 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1b5e20",
                }}
              >
                <span>{t.totalRentalCost}</span>
                <span>₹{finalCalculatedPrice}</span>
              </div>
            </div>

            <div
              style={{
                background: "#fafafa",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #e0e0e0",
                fontSize: "13px",
                color: "#444",
              }}
            >
              <h4 style={{ marginBottom: "8px", color: "#333" }}>
                {t.agreementTitle}
              </h4>
              <ul style={{ paddingLeft: "20px", margin: 0, lineHeight: "1.6" }}>
                <li>
                  {t.termStrictWindow} {activeForm.timeSlotStart} {t.and}{" "}
                  {activeForm.timeSlotEnd}.
                </li>
                <li>
                  {t.termOperator} {activeForm.crop} ({activeForm.operation} {t.task}).
                </li>
                <li>
                  {t.termOverstay} {activeForm.timeSlotEnd} {t.termOverstayEnd}
                </li>
              </ul>
            </div>
          </div>
        )}

        {deleteError && (
          <p className="errorText" style={{ marginTop: "10px" }}>
            {deleteError}
          </p>
        )}

        {isOwner ? (
          <button
            className="continueBtn"
            style={{ marginTop: "20px", background: "#c62828" }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? t.unlisting : t.unlistBtn}
          </button>
        ) : bookingConfirmed ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎉</div>
            <h3 style={{ color: "#2e7d32", marginBottom: "6px" }}>
              {t.bookingConfirmedTitle}
            </h3>
            <p
              style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}
            >
              {t.bookingConfirmedDesc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="continueBtn"
                onClick={() => setScreen("agreement")}
                style={{ background: "#1b5e20", margin: 0 }}
              >
                📄 View Digital Agreement & PDF
              </button>
              <button
                className="continueBtn"
                onClick={handleViewBookings}
                style={{ background: "#2e7d32", margin: 0 }}
              >
                📋 {t.viewBookings}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="continueBtn"
            style={{
              marginTop: "20px",
              background: "#2e7d32",
              fontWeight: "bold",
            }}
            onClick={handleConfirmBooking}
            disabled={confirmingBooking}
          >
            {confirmingBooking
              ? t.securingSlot
              : `${t.confirmAndPay} ₹${finalCalculatedPrice} →`}
          </button>
        )}
      </section>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <img
            src={imagesList[activeImageIndex]}
            alt="Full Inspection"
            style={{
              maxWidth: "90%",
              maxHeight: "75vh",
              objectFit: "contain",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          />

          <div
            style={{ color: "#fff", fontSize: "16px", marginBottom: "15px" }}
          >
            {t.photo} {activeImageIndex + 1} {t.of} {imagesList.length}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              maxWidth: "100%",
            }}
          >
            {imagesList.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: "60px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border:
                    activeImageIndex === idx
                      ? "2px solid #fff"
                      : "2px solid transparent",
                  opacity: activeImageIndex === idx ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}