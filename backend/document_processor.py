import os
import io
from typing import List
from fastapi import UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF
import docx
import pandas as pd
from pydantic import BaseModel

class DocumentChunk(BaseModel):
    text: str
    embedding: List[float]
    metadata: dict

class Embedder:
    def __init__(self):
        self.local_model = None
        self.mistral_client = None

    def get_local_model(self):
        if not self.local_model:
            # We use a fast local model by default
            self.local_model = SentenceTransformer("all-MiniLM-L6-v2")
        return self.local_model

    def get_mistral_client(self):
        if not self.mistral_client:
            api_key = os.environ.get("MISTRAL_API_KEY")
            if api_key:
                from mistralai.client import MistralClient
                self.mistral_client = MistralClient(api_key=api_key)
        return self.mistral_client

    def embed_text(self, text: str, provider: str = "local") -> List[float]:
        if provider == "mistral":
            client = self.get_mistral_client()
            if client:
                response = client.embeddings(model="mistral-embed", input=[text])
                return response.data[0].embedding
        
        # Default to local
        model = self.get_local_model()
        return model.encode(text).tolist()

    def embed_batch(self, texts: List[str], provider: str = "local") -> List[List[float]]:
        if provider == "mistral":
            client = self.get_mistral_client()
            if client:
                response = client.embeddings(model="mistral-embed", input=texts)
                return [data.embedding for data in response.data]

        model = self.get_local_model()
        return model.encode(texts).tolist()

embedder = Embedder()

def extract_text(file: UploadFile, file_content: bytes) -> str:
    filename = file.filename.lower()
    text = ""
    
    try:
        if filename.endswith(".pdf"):
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text += page.get_text()
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_content))
            text = "\n".join([para.text for para in doc.paragraphs])
        elif filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_content))
            text = df.to_string()
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(file_content))
            text = df.to_string()
        else:
            # Fallback for txt, md, etc.
            text = file_content.decode("utf-8")
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
    
    return text

def process_document(file: UploadFile, file_content: bytes, provider: str = "local") -> List[DocumentChunk]:
    # Extract text based on file type
    text = extract_text(file, file_content)
    if not text.strip():
        return []

    # Chunk text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(text)
    if not chunks:
        return []

    # Embed chunks
    embeddings = embedder.embed_batch(chunks, provider=provider)

    # Create DocumentChunk objects
    document_chunks = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        document_chunks.append(DocumentChunk(
            text=chunk,
            embedding=embedding,
            metadata={"filename": file.filename, "chunk_index": i}
        ))
    
    return document_chunks
