from dotenv import load_dotenv
load_dotenv()  # força o carregamento do .env no diretório atual

# from mangaba_ai import MangabaAgent

class InsightsAgent:
    def __init__(self):
        # Initialize Mangaba Agent (mocked for now if API key not present)
        # self.agent = MangabaAgent()
        pass

    def generate_insights(self, metrics):
        print("Generating insights...")
        
        # In a real scenario, we would use the Mangaba Agent to generate text
        # prompt = f"Analyze these metrics: {metrics}"
        # response = self.agent.chat(prompt)
        
        # Mock response
        summary = f"Found {len(metrics)} risks. "
        if len(metrics) > 0:
            summary += "Main concern is low stock on some items."
        else:
            summary += "Everything looks good."
            
        recommendations = []
        
        for risk in metrics:
            if risk.get("type") == "validade" and risk.get("days", 100) > 0:
                # Suggest promotion based on days remaining
                days = risk["days"]
                price = risk.get("price", 0)
                cost = risk.get("cost", 0)
                stock = risk.get("stock", 0)
                
                discount = 0
                if days <= 7:
                    discount = 0.50 # 50% off
                elif days <= 15:
                    discount = 0.30 # 30% off
                else:
                    discount = 0.15 # 15% off
                    
                new_price = price * (1 - discount)
                margin = new_price - cost
                
                rec_text = f"Promoção Sugerida: {int(discount*100)}% OFF. Novo preço: R$ {new_price:.2f} (Margem: R$ {margin:.2f})"
                if margin < 0:
                    rec_text += " [ATENÇÃO: Venda abaixo do custo para evitar perda total]"
                    
                recommendations.append({
                    "productId": risk["productId"],
                    "suggestion": rec_text,
                    "discount": discount
                })

            elif risk.get("type") == "prediction_risk":
                # Handle prediction risk
                days_excess = risk["days_to_sell_out"] - risk["days_until_expiry"]
                price = risk.get("price", 0)
                cost = risk.get("cost", 0)
                
                # Simple heuristic for discount
                discount = 0.0
                if days_excess <= 5:
                    discount = 0.10
                elif days_excess <= 15:
                    discount = 0.25
                else:
                    discount = 0.40
                    
                new_price = price * (1 - discount)
                margin = new_price - cost
                
                rec_text = f"Predição: Estoque não zerará antes da validade. Sugestão: Reduzir preço em {int(discount*100)}% para acelerar vendas. Novo preço: R$ {new_price:.2f}"
                
                recommendations.append({
                    "productId": risk["productId"],
                    "suggestion": rec_text,
                    "discount": discount,
                    "confidence": 0.85
                })

            elif risk.get("type") == "slow_sales":
                # Handle slow moving product
                stock = risk.get("stock", 0)
                total_sold = risk.get("total_sold", 0)
                
                rec_text = f"Giro de Estoque: Produto parado ({stock} un. em estoque, {total_sold} vendas). Sugestão: Criar Bundle com produto de alta saída ou melhorar exposição na loja."
                
                recommendations.append({
                    "productId": risk["productId"],
                    "suggestion": rec_text,
                    "discount": 0.0, # Not necessarily a discount, maybe marketing
                    "confidence": 0.90
                })

        return {
            "summary": summary,
            "recommendations": recommendations
        }
