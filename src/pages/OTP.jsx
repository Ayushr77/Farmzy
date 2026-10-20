import { useState } from "react";

export default function OTP({
  language,
  text,
  phone,
  role,
  setScreen,
  setActiveTab,
  setFarmerTab,
}) {
  const [otp, setOtp] = useState("");

  const handleOTPChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const verifyOTP = () => {
    if (otp.length === 6) {
      // Force active tab state to 'home' on login
      if (setActiveTab) setActiveTab("home");
      if (setFarmerTab) setFarmerTab("home");

      if (role === "farmer") {
        setScreen("farmerDashboard");
      } else {
        setScreen("ownerDashboard");
      }
    }
  };

  const t = text?.[language] || text?.en || {};

  return (
    <div className="otpScreen">

      {/* HEADER */}

      <div className="otpHeader">

        <button
          className="iconBack"
          onClick={() => setScreen("login")}
        >
          ←
        </button>

        <div className="otpLogo">
          🔐
        </div>

        <h1>{t.otpHeaderTitle}</h1>

        <p>
          {role === "farmer" ? t.farmer : t.owner}
        </p>

      </div>


      {/* OTP CARD */}

      <div className="otpCard">

        <h2>{t.otpCardTitle}</h2>

        <p className="otpDescription">
          {t.otpSub}
        </p>

        <div className="phoneDisplay">
          +91 {phone}
        </div>


        {/* OTP INPUT */}

        <input
          className="otpInput"
          type="tel"
          inputMode="numeric"
          placeholder="••••••"
          value={otp}
          onChange={handleOTPChange}
          maxLength="6"
          autoFocus
        />


        {/* VERIFY BUTTON */}

        <button
          className="continueBtn"
          disabled={otp.length !== 6}
          onClick={verifyOTP}
        >
          {t.verifyBtn}
        </button>


        {/* RESEND */}

        <button
          className="resendBtn"
          onClick={() => {
            alert(t.demoOtpAlert);
          }}
        >
          {t.resendOtp}
        </button>

      </div>

    </div>
  );
}