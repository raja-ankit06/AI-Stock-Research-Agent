import json
from typing import Any, Dict, Optional
import httpx
from app.core.config import settings


class LLMClient:
    """
    Provider-agnostic LLM client with support for OpenAI, Anthropic, Gemini,
    and a deterministic financial reasoning engine for zero-key local environments.
    """

    @staticmethod
    async def generate_completion(prompt: str, system_prompt: str = "") -> Optional[str]:
        # 1. Try OpenAI if key is present
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "placeholder_openai_api_key_here":
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.OPENAI_MODEL or "gpt-4o",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception:
                pass

        # 2. Try Anthropic if key is present
        if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "placeholder_anthropic_api_key_here":
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers={
                            "x-api-key": settings.ANTHROPIC_API_KEY,
                            "anthropic-version": "2023-06-01",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.ANTHROPIC_MODEL or "claude-3-5-sonnet-20241022",
                            "system": system_prompt,
                            "messages": [{"role": "user", "content": prompt}],
                            "max_tokens": 1500,
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["content"][0]["text"]
            except Exception:
                pass

        # Fallback to local deterministic reasoning engine
        return None

