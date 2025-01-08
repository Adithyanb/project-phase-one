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
import PyPDF2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = "AIzaSyAcoxDlozTg6cuS2x3cWPkdPPr90w9zGCE"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("data")
TEXT_DIR = Path("texts")
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)
TEXT_DIR.mkdir(exist_ok=True)

ITEMS_FILE = DATA_DIR / "uploaded_items.json"

class TextUpload(BaseModel):
    content: str

def load_items():
    if ITEMS_FILE.exists():
        return json.loads(ITEMS_FILE.read_text())
    return []

def save_items(items):
    ITEMS_FILE.write_text(json.dumps(items))

def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = []
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text.append(f"Page {page_num + 1}:\n{page.extract_text()}")
            return "\n\n".join(text)
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

def get_document_content(item_id):
    items = load_items()
    item = next((item for item in items if item["id"] == item_id), None)
    
    if not item:
        return None
        
    file_path = Path(item["content"])
    if not file_path.exists():
        return None
    
    try:
        if item["fileType"] == "text":
            return file_path.read_text()
        elif item["fileType"] == "application/pdf":
            return extract_text_from_pdf(file_path)
        return None
    except Exception as e:
        print(f"Error getting document content: {e}")
        return None

@app.post("/api/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        timestamp = datetime.now().timestamp()
        filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract and store content immediately for PDFs
        content = None
        if file.content_type == "application/pdf":
            content = extract_text_from_pdf(file_path)
            if content:
                text_filename = f"pdf_content_{timestamp}.txt"
                text_path = TEXT_DIR / text_filename
                text_path.write_text(content)
        
        items = load_items()
        new_item = {
            "id": str(timestamp),
            "fileName": file.filename,
            "fileType": file.content_type,
            "uploadedAt": datetime.now().isoformat(),
            "content": str(file_path),
            "extractedContent": content
        }
        items.append(new_item)
        save_items(items)
        
        return {"message": "File uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/text")
async def upload_text(text_upload: TextUpload):
    try:
        timestamp = datetime.now().timestamp()
        filename = f"text_{timestamp}.txt"
        file_path = TEXT_DIR / filename
        
        # Save the text content to a file
        file_path.write_text(text_upload.content)
        
        items = load_items()
        new_item = {
            "id": str(timestamp),
            "fileName": filename,
            "fileType": "text",
            "uploadedAt": datetime.now().isoformat(),
            "content": str(file_path),
            "extractedContent": text_upload.content
        }
        items.append(new_item)
        save_items(items)
        
        return {"message": "Text uploaded successfully", "item": new_item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interact")
async def interact_with_text(text: str = Form(...), document_id: Optional[str] = Form(None)):
    try:
        if document_id:
            items = load_items()
            item = next((item for item in items if item["id"] == document_id), None)
            
            if not item:
                raise HTTPException(status_code=404, detail="Document not found")
            
            # Get document content
            document_content = None
            if "extractedContent" in item and item["extractedContent"]:
                document_content = item["extractedContent"]
            else:
                document_content = get_document_content(document_id)
            
            if not document_content:
                raise HTTPException(status_code=500, detail="Could not extract document content")
            
            # Construct prompt with document content
            prompt = f"""Based on the following document content, please answer the question.

Document content:
{document_content}

Question: {text}

Please provide a detailed answer based on the document content above."""

            print(f"Sending prompt to Gemini: {prompt[:200]}...")  # Log first 200 chars of prompt
            
            response = model.generate_content(prompt)
            return {"response": response.text}
        else:
            response = model.generate_content(text)
            return {"response": response.text}
            
    except Exception as e:
        print(f"Error in interact_with_text: {e}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/items")
async def get_items():
    items = load_items()
    for item in items:
        if "extractedContent" not in item:
            item["extractedContent"] = get_document_content(item["id"])
    return items

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
    
    return {"message": "Item deleted successfully"}