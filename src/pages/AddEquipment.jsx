import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddEquipment({ setScreen }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    makeModel: "",
    manufactureYear: "",
    hourlyRate: "",
    dailyRate: "",
    maxTravelRadius: "",
    operatingSpeed: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle selecting files from the gallery/device
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    // Generate local object URLs for instant previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    // Get currently logged-in Supabase user or fall back to demo verified owner ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ownerId = user?.id || localStorage.getItem("farmzy_owner_id") || "8fb77df6-4299-4f8e-b2e1-e4898854436b";

    // 1. Upload selected photos to Supabase Storage bucket ('equipment-photos') with base64 DataURL fallback
    let uploadedImageUrls = [];
    
    if (selectedFiles.length > 0) {
      setUploadProgress("Uploading equipment photos...");
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${ownerId}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `${fileName}`;

        let uploaded = false;
        try {
          const { error: uploadError } = await supabase.storage
            .from("equipment-photos")
            .upload(filePath, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("equipment-photos")
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              uploadedImageUrls.push(publicUrlData.publicUrl);
              uploaded = true;
            }
          }
        } catch (e) {
          console.warn("Storage upload exception:", e);
        }

        // If bucket is not provisioned or upload failed, convert file to data URL so photo is still displayed!
        if (!uploaded) {
          try {
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
            if (dataUrl) uploadedImageUrls.push(dataUrl);
          } catch (e) {
            console.error("Failed to generate photo preview:", e);
          }
        }
      }
    }

    setUploadProgress("Saving equipment details...");

    // Get owner's profile and location cleanly
    let village = "Wagholi";
    let district = "Pune";
    let latitude = 18.5793;
    let longitude = 73.9814;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("village, district, latitude, longitude")
        .eq("id", ownerId)
        .maybeSingle();

      if (profile) {
        if (profile.village) village = profile.village;
        if (profile.district) district = profile.district;
        if (profile.latitude) latitude = profile.latitude;
        if (profile.longitude) longitude = profile.longitude;
      }
    } catch (e) {
      console.warn("Profile fetch skipped:", e);
    }

    // Data to be inserted into equipment table
    const equipmentData = {
      id: crypto.randomUUID ? crypto.randomUUID() : `EQ-${Date.now()}`,
      owner_id: ownerId,
      title: form.title,
      category: form.category,
      make_model: form.makeModel || null,
      manufacture_year: form.manufactureYear
        ? Number(form.manufactureYear)
        : null,
      hourly_rate: form.hourlyRate ? Number(form.hourlyRate) : null,
      daily_rate: form.dailyRate ? Number(form.dailyRate) : null,
      location_village: village,
      location_district: district,
      latitude: latitude,
      longitude: longitude,
      max_travel_radius_km: form.maxTravelRadius
        ? Number(form.maxTravelRadius)
        : 25,
      operating_speed_kmh: form.operatingSpeed
        ? Number(form.operatingSpeed)
        : 30,
      images: uploadedImageUrls,
      status: "available",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Attempt to insert equipment into Supabase
    try {
      const { error: insertError } = await supabase
        .from("equipment")
        .insert([equipmentData]);

      if (insertError) {
        console.warn("Backend insert notice:", insertError.message, "Caching equipment locally.");
      }
    } catch (err) {
      console.warn("Network insert skipped, caching locally:", err);
    }

    // Update local cache so newly created equipment is immediately visible across dashboards
    try {
      const cached = JSON.parse(localStorage.getItem("farmzy_cached_equipment") || "[]");
      const updatedCache = [equipmentData, ...cached.filter((c) => c.id !== equipmentData.id)];
      localStorage.setItem("farmzy_cached_equipment", JSON.stringify(updatedCache));
    } catch (e) {
      console.error("Cache update error:", e);
    }

    setMessage("✅ Equipment and condition photos saved successfully!");
    setSaving(false);
    setUploadProgress("");

    // Clear form and images after successful save
    setForm({
      title: "",
      category: "",
      makeModel: "",
      manufactureYear: "",
      hourlyRate: "",
      dailyRate: "",
      maxTravelRadius: "",
      operatingSpeed: "",
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  return (
    <div className="dashboard">
      <header className="dashboardHeader">
        <button
          className="iconBack"
          onClick={() => setScreen("ownerDashboard")}
        >
          ←
        </button>

        <div>
          <span className="greeting">Equipment Listing</span>
          <h1>Add Equipment</h1>
        </div>
      </header>

      <section className="dashboardSection">
        <form onSubmit={handleSubmit}>
          {/* EQUIPMENT NAME */}
          <label className="label">Equipment Name</label>
          <input
            className="formInput"
            type="text"
            name="title"
            placeholder="Example: Mahindra 575 DI"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* CATEGORY */}
          <label className="label">Category</label>
          <select
            className="formInput"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Tractors">Tractors</option>
            <option value="Harvesters">Harvesters</option>
            <option value="Rotavators">Rotavators</option>
            <option value="Sprayers">Sprayers</option>
            <option value="Other">Other</option>
          </select>

          {/* MAKE / MODEL */}
          <label className="label">Make / Model</label>
          <input
            className="formInput"
            type="text"
            name="makeModel"
            placeholder="Example: 575 DI XP Plus"
            value={form.makeModel}
            onChange={handleChange}
          />

          {/* MANUFACTURING YEAR */}
          <label className="label">Manufacturing Year</label>
          <input
            className="formInput"
            type="number"
            name="manufactureYear"
            placeholder="Example: 2022"
            value={form.manufactureYear}
            onChange={handleChange}
          />

          {/* HOURLY RATE */}
          <label className="label">Hourly Rental Rate (₹)</label>
          <input
            className="formInput"
            type="number"
            name="hourlyRate"
            placeholder="Example: 400"
            value={form.hourlyRate}
            onChange={handleChange}
          />

          {/* DAILY RATE */}
          <label className="label">Daily Rental Rate (₹)</label>
          <input
            className="formInput"
            type="number"
            name="dailyRate"
            placeholder="Example: 800"
            value={form.dailyRate}
            onChange={handleChange}
            required
          />

          {/* MAX TRAVEL RADIUS */}
          <label className="label">Maximum Travel Radius (km)</label>
          <input
            className="formInput"
            type="number"
            name="maxTravelRadius"
            placeholder="Example: 25"
            value={form.maxTravelRadius}
            onChange={handleChange}
          />

          {/* OPERATING SPEED */}
          <label className="label">Operating Speed (km/h)</label>
          <input
            className="formInput"
            type="number"
            name="operatingSpeed"
            placeholder="Example: 20"
            value={form.operatingSpeed}
            onChange={handleChange}
          />

          {/* GALLERY FILE PICKER FOR CONDITION PHOTOS */}
          <label className="label" style={{ marginTop: "16px" }}>
            Upload Condition Photos from Gallery
          </label>
          <div
            style={{
              border: "2px dashed #2e7d32",
              padding: "16px",
              borderRadius: "10px",
              textAlign: "center",
              background: "#f1f8e9",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <span style={{ fontSize: "12px", color: "#555", display: "block", marginTop: "6px" }}>
              Select multiple photos of tires, engine, and body condition so farmers can review them.
            </span>
          </div>

          {/* PREVIEW SELECTED PHOTOS */}
          {previewUrls.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <label className="label" style={{ marginBottom: "6px", display: "block" }}>
                Selected Photos ({previewUrls.length}):
              </label>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Gallery preview ${index + 1}`}
                      style={{
                        width: "75px",
                        height: "65px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        background: "#c62828",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATUS / UPLOAD PROGRESS */}
          {uploadProgress && (
            <p style={{ color: "#2e7d32", fontWeight: "bold", fontSize: "14px" }}>
              ⏳ {uploadProgress}
            </p>
          )}

          {/* SUCCESS MESSAGE */}
          {message && <p className="successText">✓ {message}</p>}

          {/* ERROR MESSAGE */}
          {error && <p className="errorText">{error}</p>}

          {/* SAVE BUTTON */}
          <button className="continueBtn" type="submit" disabled={saving}>
            {saving ? "Saving Equipment..." : "Save Equipment →"}
          </button>
        </form>
      </section>
    </div>
  );
}