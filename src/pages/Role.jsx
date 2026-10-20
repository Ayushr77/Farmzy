export default function Role({
  language,
  text,
  setScreen,
  setRole,
}) {
  const selectFarmer = () => {
    setRole("farmer");
    setScreen("login");
  };

  const selectOwner = () => {
    setRole("owner");
    setScreen("login");
  };

  return (
    <div className="roleScreen">

      <div className="roleHeader">

        <button
          className="iconBack"
          onClick={() => setScreen("language")}
        >
          ←
        </button>

        <div className="smallLogo">
          🚜
        </div>

        <h1>Farmzy</h1>

        <p>{text[language].roleTitle}</p>

        <span className="roleSubtitle">
          {text[language].roleSubtitle}
        </span>

      </div>


      <div className="roleContainer">

        {/* FARMER */}
        <button
          type="button"
          className="roleCard"
          onClick={selectFarmer}
        >
          <div className="roleIcon farmerIcon">
            👨‍🌾
          </div>

          <div className="roleContent">
            <h2>{text[language].farmer}</h2>

            <p>{text[language].farmerDesc}</p>
          </div>

          <div className="roleArrow">
            →
          </div>
        </button>


        {/* EQUIPMENT OWNER */}
        <button
          type="button"
          className="roleCard"
          onClick={selectOwner}
        >
          <div className="roleIcon ownerIcon">
            🚜
          </div>

          <div className="roleContent">
            <h2>{text[language].owner}</h2>

            <p>{text[language].ownerDesc}</p>
          </div>

          <div className="roleArrow">
            →
          </div>
        </button>


        {/* BACK */}
        <button
          type="button"
          className="backBtn"
          onClick={() => setScreen("language")}
        >
          ← Back
        </button>

      </div>

    </div>
  );
}