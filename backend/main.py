from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import shutil
import json
from datetime import datetime
from query_data import query_rag  # Import the query function
from populate_database import load_documents, split_documents, add_to_chroma  # Import database functions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory setup
DATA_DIR = Path("data")
UPLOADS_DIR = Path("uploads")
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

ITEMS_FILE = UPLOADS_DIR / "uploaded_items.json"

class TextUpload(BaseModel):
    content: str

# Initialize the database when the application starts
@app.on_event("startup")
async def startup_event():
    try:
        # Initial database population
        documents = load_documents()
        chunks = split_documents(documents)
        add_to_chroma(chunks)
    except Exception as e:
        print(f"Error initializing database: {e}")

def load_items():
    if ITEMS_FILE.exists():
        return json.loads(ITEMS_FILE.read_text())
    return []

def save_items(items):
    ITEMS_FILE.write_text(json.dumps(items))

def get_document_content(item_id):
    items = load_items()
    item = next((item for item in items if item["id"] == item_id), None)
    
    if not item:
        return None
        
    file_path = Path(item["content"])
    if not file_path.exists():
        return None
    
    try:
        return file_path.read_text()
    except Exception as e:
        print(f"Error getting document content: {e}")
        return None

@app.post("/api/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = DATA_DIR / file.filename
        
        # If file already exists, return an error for PDFs
        if file_path.exists():
            if file.filename.lower().endswith('.pdf'):
                return {"message": "File already exists", "exists": True}
        
        timestamp = datetime.now().timestamp()
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        items = load_items()
        new_item = {
            "id": str(timestamp),
            "fileName": file.filename,
            "uploadedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "content": str(file_path)
        }
        items.append(new_item)
        save_items(items)
        
        # Update the database after file upload
        documents = load_documents()
        chunks = split_documents(documents)
        add_to_chroma(chunks)
        
        return {"message": "File uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/text")
async def upload_text(text_upload: TextUpload):
    try:
        timestamp = datetime.now()
        filename = f"text_{timestamp.strftime('%Y%m%d_%H%M%S')}.txt"
        file_path = DATA_DIR / filename
        
        file_path.write_text(text_upload.content)
        
        items = load_items()
        new_item = {
            "id": str(timestamp.timestamp()),
            "fileName": filename,
            "uploadedAt": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "content": str(file_path)
        }
        items.append(new_item)
        save_items(items)
        
        # Update the database after text upload
        documents = load_documents()
        chunks = split_documents(documents)
        add_to_chroma(chunks)
        
        return {"message": "Text uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interact")
async def interact_with_text(text: str = Form(...), document_id: Optional[str] = Form(None)):
    try:
        # Use the query_rag function to get the response
        response = query_rag(text)
        return {"response": response}
            
    except Exception as e:
        print(f"Error in interact_with_text: {e}")  
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/items")
async def get_items():
    items = load_items()
    # Return only necessary information
    simplified_items = [{
        "id": item["id"],
        "fileName": item["fileName"],
        "uploadedAt": item["uploadedAt"]
    } for item in items]
    return simplified_items

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    items = load_items()
    item_to_delete = next((item for item in items if item["id"] == item_id), None)
    
    if item_to_delete:
        file_path = Path(item_to_delete["content"])
        if file_path.exists():
            file_path.unlink()
            
        items = [item for item in items if item["id"] != item_id]
        save_items(items)
        
        # Update the database after file deletion
        documents = load_documents()
        chunks = split_documents(documents)
        add_to_chroma(chunks)
    
    return {"message": "Item deleted successfully"}