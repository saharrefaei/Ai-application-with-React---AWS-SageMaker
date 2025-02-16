import { useState } from 'react';
import './App.scss';

function App() {
  const [date, setDate] = useState("");
  const [minTemp, setMinTemp] = useState("");
  const [temperature, setTemperature] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(false); // Use boolean for loading state

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleMinTemperature = (event) => {
    setMinTemp(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Indicate loading state

    try {
      const minTempFloat = parseFloat(minTemp);
      if (isNaN(minTempFloat)) {
        throw new Error("Invalid Temperature Input");
      }
      if (!date) {
        throw new Error("Invalid Date Input");
      }

      const [year, month, day] = date.split("-"); // Fixed typo (was "data.split")
      const csvData = `${minTempFloat},${year},${month},${day}`;

      const response = await fetch("http://localhost:3001/predict-temperature", {
        method: "POST",
        body: csvData,
        headers: {
          "Content-Type": "text/csv",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const responseBody = await response.json(); // Corrected placement

      // تجزیه کردن پیش‌بینی از داده‌های دریافتی
      const prediction = responseBody.prediction.split(",")[0]; // استخراج اولین عدد پیش‌بینی

      setTemperature({ maxTemp: prediction }); // Update the state with maxTemp

    } catch (error) {
      console.error("Error:", error);
      setTemperature(null); // Reset temperature if there was an error
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <p>Welcome</p>
        <input
          type="text"
          placeholder="Enter Date (e.g., 2027-02-25)"
          value={date}
          onChange={handleDateChange}
          required
        /><br />

        <input
          type="number"
          placeholder="Enter min temperature (F)"
          value={minTemp}
          onChange={handleMinTemperature}
          required
        /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
        <br />
      </form>

      {temperature && (
        <div>
          <p>Max Temperature: {temperature.maxTemp}°F</p>
        </div>
      )}

      <div className="drops">
        <div className="drop drop-1"></div>
        <div className="drop drop-2"></div>
        <div className="drop drop-3"></div>
        <div className="drop drop-4"></div>
        <div className="drop drop-5"></div>
      </div>
    </div>
  );
}

export default App;
