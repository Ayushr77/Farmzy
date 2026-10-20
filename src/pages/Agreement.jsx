export default function Agreement({ setScreen, selectedEquipment, phone }) {
  let latestBooking = null;
  try {
    const bookings = JSON.parse(localStorage.getItem("farmzy_bookings") || "[]");
    if (bookings && bookings.length > 0) {
      latestBooking = bookings[0];
    }
  } catch (e) {
    console.error("Failed to load booking for agreement:", e);
  }

  const bookingId = latestBooking?.id || "FMZ-2026-00128";
  const equipmentName = selectedEquipment?.title || latestBooking?.equipmentName || "Mahindra 575 DI";
  const farmerContact = phone ? `+91 ${phone}` : "Verified Farmer";
  const ownerName = selectedEquipment?.make_model || "Verified Equipment Owner";
  const duration = latestBooking?.timeSlot || "4 hrs";
  const totalAmount = latestBooking?.totalPrice ? `₹${latestBooking.totalPrice}` : "₹2400";
  const dateStr = latestBooking?.date || new Date().toLocaleDateString("en-IN");

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="agreementScreen">

      <div className="agreementHeader">
        <div className="successIcon">✓</div>
        <h1>Booking Confirmed</h1>
        <p>Your digital rental agreement is ready</p>
      </div>

      <div className="agreementCard">

        <div className="bookingId">
          Booking ID: {bookingId}
        </div>

        <div className="row">
          <span>Farmer</span>
          <strong>{farmerContact}</strong>
        </div>

        <div className="row">
          <span>Owner / Model</span>
          <strong>{ownerName}</strong>
        </div>

        <div className="row">
          <span>Equipment</span>
          <strong>{equipmentName}</strong>
        </div>

        <div className="row">
          <span>Duration / Slot</span>
          <strong>{duration}</strong>
        </div>

        <div className="row">
          <span>Total Amount</span>
          <strong>{totalAmount}</strong>
        </div>

        <div className="row">
          <span>Booking Date</span>
          <strong>{dateStr}</strong>
        </div>

        <hr />

        <h3>Rental Agreement Terms</h3>

        <p className="agreementText">
          The owner agrees to provide the listed machinery in verified working
          condition, and the farmer agrees to operate the machine responsibly
          and return it within the allocated time window.
        </p>

        <div className="signatureBox">
          <div>
            <p>Farmer Signature</p>
            <div className="line">✓ Digitally Signed</div>
          </div>

          <div>
            <p>Owner Signature</p>
            <div className="line">✓ Digitally Signed</div>
          </div>
        </div>

        <button className="continueBtn" onClick={handleDownloadPDF}>
          🖨️ Download / Print Agreement PDF
        </button>

        <button
          className="secondaryBtn"
          onClick={() => setScreen("farmerDashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>

    </div>
  );
}