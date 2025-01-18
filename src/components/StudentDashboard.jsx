import React, { useState } from "react";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [textToInteract, setTextToInteract] = useState("");
  const [interactionResult, setInteractionResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const interactWithText = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("text", textToInteract);

      const response = await fetch("http://localhost:8000/api/interact", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setInteractionResult(data.response);
      setTextToInteract("");
    } catch (error) {
      console.error("Error interacting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="student-dashboard">
      <div className="right-section">
        <div className="answer-box">
          <h3 className="section-subtitle">Retrieved Answer</h3>
          <div className="answer-content">
            {isLoading ? "Thinking..." : (interactionResult || "No response yet")}
          </div>
        </div>

        <div className="interaction-controls">
          <input
            type="text"
            value={textToInteract}
            onChange={(e) => setTextToInteract(e.target.value)}
            placeholder="Enter text to interact"
            className="text-input"
          />
          <button onClick={interactWithText} className="submit-button">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;