import os
from groq import Groq
import anthropic

# ── Clients ──────────────────────────────────────────
groq_client = Groq(api_key="")
anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

GROQ_MODEL = "llama-3.3-70b-versatile"
ANTHROPIC_MODEL = "claude-sonnet-4-20250514"

def chat(prompt: str, max_tokens: int = 2000) -> str:
    """
    Primary: Groq (fast + free)
    Fallback: Anthropic Claude
    """
    # ── Try Groq first ──
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    except Exception as groq_err:
        print(f"[Groq failed] {groq_err} → falling back to Anthropic")

        # ── Fallback: Anthropic ──
        msg = anthropic_client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        return msg.content[0].text.strip()