import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent import get_agent
from document_processor import process_document
from db import insert_chunks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    provider: str
    model: str
    systemPrompt: Optional[str] = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        agent = get_agent(request.provider, request.model, request.systemPrompt)
        
        # Convert Pydantic messages to a list of dicts that Agno can process
        # Agno agent.run() can accept a list of message dicts as history/input
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        
        # Generator for streaming response chunks
        def generate():
            response_stream = agent.run(messages_dict, stream=True)
            for event in response_stream:
                # Agno RunResponseEvent or similar objects
                # We want to yield the text content
                if hasattr(event, "content") and isinstance(event.content, str):
                    yield event.content
                elif hasattr(event, "event") and event.event == "RunResponseContent":
                    yield event.content
                    
        return StreamingResponse(generate(), media_type="text/plain")

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), provider: str = Form("local")):
    try:
        content = await file.read()
        # Process document
        chunks = process_document(file, content, provider=provider)
        if not chunks:
            return {"message": "No text could be extracted from the file.", "inserted": 0}
            
        # Insert into DB
        inserted_ids = insert_chunks(chunks)
        
        return {
            "message": "File processed successfully", 
            "filename": file.filename, 
            "chunks_created": len(chunks),
            "inserted": len(inserted_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
