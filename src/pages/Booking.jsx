import { useState } from "react";

export default function Booking({ setScreen }) {
  const pricePerDay = 800;

  const [days, setDays] = useState(1);
  const [date, setDate] = useState("");
  const [agree, setAgree] = useState(false);

  const total = pricePerDay * days;

  return (
    <div className="bookingScreen">

      <div className="bookingHeader">
        <button
          className="iconBack"
          onClick={() => setScreen("equipmentDetails")}
        >
          ←
        </button>

        <h1>Book Equipment</h1>
      </div>

      <div className="bookingCard">

        <h2>Mahindra 575 DI</h2>

        <p className="priceTag">₹800 / day</p>

        <label className="label">Rental Date</label>

        <input
          type="date"
          className="dateInput"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="label">Number of Days</label>

        <div className="daySelector">

          <button
            onClick={() => days > 1 && setDays(days - 1)}
          >
            −
          </button>

          <span>{days}</span>

          <button
            onClick={() => setDays(days + 1)}
          >
            +
          </button>

        </div>

        <div className="summary">

          <div>
            <p>Rental</p>
            <strong>{days} day(s)</strong>
          </div>

          <div>
            <p>Total</p>
            <h2>₹{total}</h2>
          </div>

        </div>

        <label className="agreement">

          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />

          <span>
            I accept the digital rental agreement
          </span>

        </label>

        <button
         className="continueBtn"
         disabled={!agree || date === ""}
         onClick={() => setScreen("agreement")}
        >
  Confirm Booking
</button>

      </div>

    </div>
  );
}