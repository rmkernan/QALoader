from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter()

@router.post("/upload-markdown")
async def upload_markdown(
    topic: str = Form(...),
    file: UploadFile = File(...)
):
    # Placeholder implementation
    raise HTTPException(status_code=501, detail="File upload not yet implemented")

@router.post("/topics/{topic}/questions/batch-replace")
async def batch_replace_questions(topic: str):
    # Placeholder implementation
    raise HTTPException(status_code=501, detail="Batch replace not yet implemented")