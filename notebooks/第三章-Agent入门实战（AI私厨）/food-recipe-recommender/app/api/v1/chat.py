from fastapi import APIRouter
from app.models.schemas import ChatRequest
from fastapi.responses import Response, StreamingResponse
from app.agents.personal_chief import search_recipes, get_messages, clear_messages


router = APIRouter()


@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """流式对话"""
    return StreamingResponse(
        search_recipes(request.message, request.image_url, request.thread_id),
        media_type="text/event-stream"
    )


@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """获取历史消息"""
    messages = get_messages(thread_id)
    return {"messages": messages}


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """清空历史消息"""
    clear_messages(thread_id)
    return {"success": True}


# OPTIONS handlers for CORS preflight requests
@router.options("/chat/stream")
async def options_chat_stream():
    return Response(status_code=200)


@router.options("/chat/messages")
async def options_chat_messages():
    return Response(status_code=200)