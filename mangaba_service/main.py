from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from agents.metrics_agent import MetricsAgent
from agents.insights_agent import InsightsAgent

app = FastAPI()

class Product(BaseModel):
    id: str
    name: str
    price: float
    cost: float
    category: str
    next_expiry_date: Optional[str] = None

class StockSnapshot(BaseModel):
    productId: str
    quantity: int
    timestamp: str

class DailySales(BaseModel):
    productId: str
    date: str
    quantity: int
    totalAmount: float

class IngestionData(BaseModel):
    products: List[Product]
    stock: List[StockSnapshot]
    sales: List[DailySales]

@app.post("/analyze")
async def analyze_data(data: IngestionData):
    try:
        print("Received data for analysis...")
        
        # 1. Calculate Metrics
        metrics_agent = MetricsAgent()
        metrics = metrics_agent.calculate_risks(data.products, data.stock, data.sales)
        
        # 2. Generate Insights
        insights_agent = InsightsAgent()
        insights = insights_agent.generate_insights(metrics)
        
        print("Analysis complete.")
        return {"metrics": metrics, "insights": insights}
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
