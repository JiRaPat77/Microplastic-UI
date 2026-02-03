
import time
import json
import requests
import threading
import os
import shutil
import uvicorn
from datetime import datetime
from fastapi import FastAPI

app = FastAPI()


DOCKER_BACKEND_URL = "http://localhost:3001/api/analysis" 

MOCK_IMAGE_FILENAME = "simulation_result.png"


TEST_IMAGES_DIR = r"/home/jiralegion/Weaverbase/Project/Dev_project/Microplastic/images"

current_image_index = 0

def get_next_image_from_folder():
    global current_image_index
    if not os.path.exists(TEST_IMAGES_DIR):
        print(f"Error: Not found folder {TEST_IMAGES_DIR}")
        return None, None

    valid_extensions = ('.png', '.jpg', '.jpeg')
    all_files = sorted([f for f in os.listdir(TEST_IMAGES_DIR) if f.lower().endswith(valid_extensions)])

    if not all_files:
        print("Error: No valid image files found in the test images folder.")
        return None, None

    file_index_to_use = current_image_index % len(all_files)
    selected_filename = all_files[file_index_to_use]
    source_path = os.path.join(TEST_IMAGES_DIR, selected_filename)
    
    current_image_index += 1
    

    try:
        shutil.copy(source_path, MOCK_IMAGE_FILENAME)
        return MOCK_IMAGE_FILENAME, selected_filename
    except Exception as e:
        print(f"Error copying file: {e}")
        return None, None

def run_ai_simulation():
    print(f"\n🤖 [AI CLIENT] Starting simulation process...")
    time.sleep(1) 
    
    image_path, original_filename = get_next_image_from_folder()
    
    if not image_path:
        print("[AI CLIENT] No image found. Aborting.")
        return

    print(f"📸 [AI CLIENT] Processing image: {original_filename}")

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    

    mock_payload = {
        "device_id": "test-device-001",
        "capture_id": original_filename,
        "timestamp": current_time,
        "type": {"PET": 120, "HDPE": 250, "PVC": 15, "PP": 30, "PC": 5, "Other": 10},
        "total_count": 260
    }

    summary_json_str = json.dumps(mock_payload)
    

    files = {'image': (original_filename, open(image_path, 'rb'), 'image/png')}
    data = {'summary': summary_json_str}

    try:
        print(f"[AI CLIENT] Sending to {DOCKER_BACKEND_URL}...")
        response = requests.post(DOCKER_BACKEND_URL, files=files, data=data)
        files['image'][1].close() 

        if response.status_code == 200:
            print("[AI CLIENT] Success! Server received data.")
        else:
            print(f"[AI CLIENT] Failed. Status: {response.status_code}, Response: {response.text}")

    except Exception as e:
        print(f"[AI CLIENT] Connection Error: {e}")
        print("   (Recheck file main.py running?)")

@app.post("/trigger-model")
async def trigger_model():
    print("[AI CLIENT] Received Trigger Command.")
    thread = threading.Thread(target=run_ai_simulation)
    thread.start()
    return {"status": "started"}

if __name__ == "__main__":

    print(" AI Service listening on Port 8001...")
    
    # สั่งรัน simulation 1 ครั้งตอนเริ่มโปรแกรม เพื่อ Test ทันที
    # threading.Thread(target=run_ai_simulation).start()

    uvicorn.run(app, host="0.0.0.0", port=5000)