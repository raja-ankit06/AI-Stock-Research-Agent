from typing import Any, Dict, List
from app.agents.state import ResearchState
from app.schemas.agent import NewsItemDTO, SentimentAnalysisPayload


class NewsSentimentAgent:
    """
    Ingests recent corporate news and announcements, evaluates sentiment polarity,
    and isolates market catalysts.
    """

    @staticmethod
    async def run(state: ResearchState) -> Dict[str, Any]:
        symbol = state["symbol"]
        raw_news = state.get("raw_news", [])

        news_items: List[NewsItemDTO] = []
        positive_keywords = ["growth", "record", "profit", "beat", "upgrade", "surge", "expansion", "bullish", "soar", "gain"]
        negative_keywords = ["loss", "drop", "decline", "fall", "downgrade", "probe", "investigation", "miss", "bearish", "plunge"]

        scores = []
        catalysts = []

        for item in raw_news:
            headline = item.get("headline", "")
            lower_text = headline.lower()
            
            # Deterministic keyword polarity heuristic
            pos_hits = sum(1 for kw in positive_keywords if kw in lower_text)
            neg_hits = sum(1 for kw in negative_keywords if kw in lower_text)

            if pos_hits > neg_hits:
                score = min(0.3 + (pos_hits * 0.2), 0.95)
                label = "BULLISH"
            elif neg_hits > pos_hits:
                score = max(-0.3 - (neg_hits * 0.2), -0.95)
                label = "BEARISH"
            else:
                score = 0.05
                label = "NEUTRAL"

            scores.append(score)

            # Detect catalysts
            if any(w in lower_text for w in ["earnings", "quarter", "results", "launch", "contract", "merger", "dividend"]):
                catalysts.append(headline)

            news_items.append(NewsItemDTO(
                headline=headline,
                publisher=item.get("publisher", "Financial Press"),
                published_at=item.get("published_at", "Recent"),
                url=item.get("url"),
                sentiment_score=round(score, 2),
                sentiment_label=label,
                summary=item.get("summary", headline)
            ))

        avg_score = sum(scores) / len(scores) if scores else 0.15
        if avg_score >= 0.25:
            sentiment_label = "Bullish"
        elif avg_score <= -0.25:
            sentiment_label = "Bearish"
        else:
            sentiment_label = "Neutral"

        if not catalysts and news_items:
            catalysts.append(news_items[0].headline)
        if not catalysts:
            catalysts.append(f"Upcoming quarterly earnings release for {symbol}")

        payload = SentimentAnalysisPayload(
            composite_score=round(avg_score, 2),
            sentiment_label=sentiment_label,
            articles_analyzed=len(news_items),
            top_catalysts=catalysts[:3],
            news_items=news_items[:10]
        )

        return {"sentiment_analysis": payload.model_dump()}

