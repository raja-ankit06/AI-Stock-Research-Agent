from typing import Dict, Any
from .schemas import FundamentalOutput

def run_fundamental_agent(ticker: str, financial_data: Dict[str, Any]) -> FundamentalOutput:
    missing = []
    
    # Extract ratios safely (no random/fake values)
    pe = financial_data.get("pe_ratio")
    pb = financial_data.get("pb_ratio")
    roe = financial_data.get("roe")
    debt_to_equity = financial_data.get("debt_to_equity")
    revenue_growth = financial_data.get("revenue_growth")
    profit_margin = financial_data.get("profit_margin")

    for name, val in [("P/E", pe), ("P/B", pb), ("ROE", roe), ("Debt/Equity", debt_to_equity)]:
        if val is None:
            missing.append(name)

    # Revenue & Profitability evaluation
    if revenue_growth is None:
        rev_trend = "Unavailable"
    elif revenue_growth > 0:
        rev_trend = f"Growing ({round(revenue_growth * 100, 2)}%)"
    else:
        rev_trend = f"Declining ({round(revenue_growth * 100, 2)}%)"

    if profit_margin is None:
        prof_status = "Unavailable"
    elif profit_margin > 0.15:
        prof_status = f"Strong ({round(profit_margin * 100, 2)}%)"
    elif profit_margin > 0:
        prof_status = f"Moderate ({round(profit_margin * 100, 2)}%)"
    else:
        prof_status = "Loss-making"

    # Debt evaluation
    if debt_to_equity is None:
        debt_status = "Unavailable"
    elif debt_to_equity < 1.0:
        debt_status = f"Low / Stable (D/E: {round(debt_to_equity, 2)})"
    else:
        debt_status = f"High Leverage (D/E: {round(debt_to_equity, 2)})"

    summary = (
        f"{ticker} shows {rev_trend.lower()} revenue with {prof_status.lower()} profitability "
        f"and {debt_status.lower()} debt levels."
    )
    if missing:
        summary += f" Note: Missing data for {', '.join(missing)}."

    return FundamentalOutput(
        ticker=ticker,
        revenue_trend=rev_trend,
        profitability_status=prof_status,
        debt_status=debt_status,
        ratios={"P/E": pe, "P/B": pb, "ROE": roe},
        missing_data=missing,
        summary=summary
    )