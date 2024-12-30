# main.py (place this in the backend directory)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import os
from pathlib import Path
import shutil
import json
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyAcoxDlozTg6cuS2x3cWPkdPPr90w9zGCE"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Create directories for storing files and data
UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("data")
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# File to store uploaded items data
ITEMS_FILE = DATA_DIR / "uploaded_items.json"

class TextUpload(BaseModel):
    content: str

def load_items():
    if ITEMS_FILE.exists():
        return json.loads(ITEMS_FILE.read_text())
    return []

def save_items(items):
    ITEMS_FILE.write_text(json.dumps(items))

@app.post("/api/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        items = load_items()
        new_item = {
            "id": str(datetime.now().timestamp()),
            "fileName": file.filename,
            "fileType": file.content_type,
            "uploadedAt": datetime.now().isoformat(),
            "content": str(file_path)
        }
        items.append(new_item)
        save_items(items)
        
        return {"message": "File uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/text")
async def upload_text(text_upload: TextUpload):
    try:
        items = load_items()
        new_item = {
            "id": str(datetime.now().timestamp()),
            "fileName": "Text Upload",
            "fileType": "text",
            "uploadedAt": datetime.now().isoformat(),
            "content": text_upload.content
        }
        items.append(new_item)
        save_items(items)
        
        return {"message": "Text uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/items")
async def get_items():
    return load_items()

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    items = load_items()
    items = [item for item in items if item["id"] != item_id]
    save_items(items)
    return {"message": "Item deleted successfully"}

@app.post("/api/interact")
async def interact_with_text(text: str = Form(...)):
    try:
        response = model.generate_content(text)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))