# main.py
import os
import json
import time
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Config CORS
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

UPLOAD_DIR = "images"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/images", StaticFiles(directory=UPLOAD_DIR), name="images")

class AnalysisResult(BaseModel):
    analysisId: Optional[str] = None
    imageUrl: Optional[str] = None
    data: dict = {}

current_analysis = AnalysisResult()

@app.get("/api/analysis")
async def get_analysis():
    return current_analysis

@app.post("/api/analysis")
async def update_analysis(
    image: Optional[UploadFile] = File(None),
    summary: str = Form(...)
):
    global current_analysis
    try:
        # --- จุดตรวจสอบที่ 1: ดู Terminal นี้ว่า Data เข้ามาไหม ---
        summary_data = json.loads(summary)
        print(f"\n📥 [SERVER] Received Data: {summary_data}")
        
        image_url = current_analysis.imageUrl
        if image:
            filename = f"{int(time.time())}_{image.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                content = await image.read()
                f.write(content)
            image_url = f"/images/{filename}"
            print(f"🖼️ [SERVER] Image saved at: {file_path}")

        current_analysis = AnalysisResult(
            analysisId=f"MP-{int(time.time())}",
            imageUrl=image_url,
            data=summary_data 
        )
        
        return {"success": True, "message": "Data updated"}

    except Exception as e:
        print(f"❌ [SERVER] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Server starting on Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)