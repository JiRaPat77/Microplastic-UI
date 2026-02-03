import os
import json
import time
import httpx
import base64
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional


app = FastAPI(root_path="/api", root_path_in_servers=True)
# app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/analysis")
async def get_analysis():
    return current_analysis


@app.post("/analysis")
async def update_analysis(
    image: Optional[UploadFile] = File(None),
    summary: str = Form(...)
):
    global current_analysis
    
    try:
        summary_data = json.loads(summary)
        final_image_string = current_analysis.imageUrl

        if image:
            file_content = await image.read()
            base64_encoded = base64.b64encode(file_content).decode("utf-8")
            mime_type = image.content_type or "image/png"
            final_image_string = f"data:{mime_type};base64,{base64_encoded}"
            print("Image converted to Base64")

        current_analysis = AnalysisResult(
            analysisId=f"MP-{int(time.time())}",
            imageUrl=final_image_string,
            data=summary_data
        )
        
        print(f"Data Updated: {len(summary_data)} items")
        return {"success": True, "message": "Data updated"}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/start")
async def start_process():
    print("Start Command Received")
    
    ai_service_url = "http://p5000.mp001.weaverbase.io/"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(ai_service_url, json={"command": "start"})
            
        print(f"Signal sent to AI Service: {response.status_code}")
        return {"success": True, "message": "Command sent to AI Model"}
        
    except Exception as e:
        print(f"Could not contact AI Service: {str(e)}")
        return {"success": False, "message": f"Sent command but AI service unreachable: {str(e)}"}