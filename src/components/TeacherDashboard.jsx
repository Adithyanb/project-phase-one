import React, { useState, useEffect } from "react";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [textToUpload, setTextToUpload] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedItems, setUploadedItems] = useState([]);
  const [textToInteract, setTextToInteract] = useState("");
  const [interactionResult, setInteractionResult] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/items");
      const data = await response.json();
      setUploadedItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleFileSelection = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFileAndText = async () => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        await fetch("http://localhost:8000/api/upload/file", {
          method: "POST",
          body: formData,
        });
      } else if (textToUpload) {
        await fetch("http://localhost:8000/api/upload/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: textToUpload }),
        });
      }

      fetchItems();
      setTextToUpload("");
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/items/${id}`, {
        method: "DELETE",
      });
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const interactWithText = async () => {
    try {
      const formData = new FormData();
      formData.append("text", textToInteract);
      if (selectedDocument) {
        formData.append("document_id", selectedDocument.id);
      }

      const response = await fetch("http://localhost:8000/api/interact", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setInteractionResult(data.response);
      setTextToInteract("");
    } catch (error) {
      console.error("Error interacting:", error);
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="content">
        <div className="left-section">
          <h2 className="section-title">File Upload</h2>

          <div className="upload-controls">
            <input
              type="file"
              onChange={handleFileSelection}
              className="file-input"
              accept=".pdf"
            />
            <input
              type="text"
              value={textToUpload}
              onChange={(e) => setTextToUpload(e.target.value)}
              placeholder="Enter text to upload"
              className="text-input"
            />
            <button onClick={uploadFileAndText} className="upload-button">
              Upload
            </button>
          </div>

          <div className="uploaded-items">
            <h3 className="section-subtitle">Uploaded Items</h3>
            {uploadedItems.map((item) => (
              <div 
                key={item.id} 
                className={`item-card ${selectedDocument?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedDocument(selectedDocument?.id === item.id ? null : item)}
              >
                <div className="item-name">
                  {item.fileName} ({item.fileType})
                  {selectedDocument?.id === item.id && " (Selected)"}
                </div>
                <div className="item-date">Uploaded at: {item.uploadedAt}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="right-section">
          <div className="answer-box">
            <h3 className="section-subtitle">
              {selectedDocument 
                ? `Interacting with: ${selectedDocument.fileName}`
                : "General Interaction"}
            </h3>
            <div className="answer-content">
              {interactionResult || "No response yet"}
            </div>
          </div>

          <div className="interaction-controls">
            <input
              type="text"
              value={textToInteract}
              onChange={(e) => setTextToInteract(e.target.value)}
              placeholder={selectedDocument 
                ? `Ask questions about ${selectedDocument.fileName}`
                : "Enter text to interact"
              }
              className="text-input"
            />
            <button onClick={interactWithText} className="submit-button">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;