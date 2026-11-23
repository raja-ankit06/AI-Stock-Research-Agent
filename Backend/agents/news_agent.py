import yfinance as yf
from datetime import datetime
from .schemas import NewsOutput, NewsItem

POSITIVE_WORDS = {"growth", "profit", "surge", "beat", "acquisition", "upgrade", "strong", "gain"}
NEGATIVE_WORDS = {"loss", "drop", "decline", "lawsuit", "downgrade", "weak", "risk", "fall"}

def classify_sentiment(text: str) -> str:
    words = set(text.lower().split())
    pos = len(words & POSITIVE_WORDS)
    neg = len(words & NEGATIVE_WORDS)
    if pos > neg:
        return "Positive"
    elif neg > pos:
        return "Negative"
    return "Neutral"

def run_news_agent(ticker: str) -> NewsOutput:
    articles = []
    try:
        stock = yf.Ticker(ticker)
        raw_news = stock.news or []
    except Exception:
        raw_news = []

    for item in raw_news[:6]:
        content = item.get("content", item)
        title = content.get("title") or item.get("title")
        url = (content.get("canonicalUrl", {}).get("url") if isinstance(content.get("canonicalUrl"), dict) else None) or item.get("link")
        source = (content.get("provider", {}).get("displayName") if isinstance(content.get("provider"), dict) else None) or item.get("publisher", "Unknown Source")
        pub_time = content.get("pubDate") or item.get("providerPublishTime")

        if not title or not url:
            continue

        if isinstance(pub_time, (int, float)):
            pub_str = datetime.fromtimestamp(pub_time).strftime("%Y-%m-%d")
        else:
            pub_str = str(pub_time)[:10] if pub_time else "Unknown Date"

        articles.append(NewsItem(
            title=title,
            source=source,
            url=url,
            published_at=pub_str,
            sentiment=classify_sentiment(title)
        ))

    if not articles:
        return NewsOutput(
            ticker=ticker,
            overall_sentiment="Unavailable",
            articles=[],
            conflicting_reports=False,
            summary=f"No verified recent news articles were found for {ticker}."
        )

    sentiments = [a.sentiment for a in articles]
    pos_c, neg_c = sentiments.count("Positive"), sentiments.count("Negative")
    conflicting = pos_c > 0 and neg_c > 0
    overall = "Positive" if pos_c > neg_c else ("Negative" if neg_c > pos_c else "Neutral")

    summary = f"Analyzed {len(articles)} recent articles for {ticker}. Overall news sentiment is {overall}."
    if conflicting:
        summary += " Conflicting positive and negative reports were detected."

    return NewsOutput(
        ticker=ticker,
        overall_sentiment=overall,
        articles=articles,
        conflicting_reports=conflicting,
        summary=summary
    )