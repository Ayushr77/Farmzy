export default function Language({
  language,
  setLanguage,
  text,
  setScreen,
}) {
  return (
    <>
      <div className="hero">
        <div className="logo">🚜</div>

        <h1>Farmzy</h1>

        <p>Smart Farm Equipment Rental</p>
      </div>

      <div className="card">
        <h2>{text[language]?.title || text.en.title}</h2>

        <p className="sub">{text[language]?.sub || text.en.sub}</p>

        <button
          className={language === "en" ? "language active" : "language"}
          onClick={() => setLanguage("en")}
        >
          🇬🇧 English
        </button>

        <button
          className={language === "hi" ? "language active" : "language"}
          onClick={() => setLanguage("hi")}
        >
          🇮🇳 हिन्दी
        </button>

        <button
          className={language === "mr" ? "language active" : "language"}
          onClick={() => setLanguage("mr")}
        >
          🌾 मराठी
        </button>

        <button
          className={language === "kn" ? "language active" : "language"}
          onClick={() => setLanguage("kn")}
        >
          🌻 ಕನ್ನಡ
        </button>

        <button
          className="continueBtn"
          onClick={() => setScreen("role")}
        >
          {text[language]?.button || text.en.button}
        </button>
      </div>
    </>
  );
}