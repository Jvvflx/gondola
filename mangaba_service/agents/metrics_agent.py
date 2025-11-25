class MetricsAgent:
    def __init__(self):
        pass

    def calculate_risks(self, products, stock, sales):
        print("Calculating risks...")
        risks = []
        
        # Simple logic for demo
        # 1. Check for Low Stock (Ruptura)
        for s in stock:
            if s.quantity < 10:
                risks.append({
                    "type": "ruptura",
                    "productId": s.productId,
                    "message": f"Baixo estoque: {s.productId} ({s.quantity} un.)",
                    "severity": "high"
                })

        # 2. Check for Expiry Risk (Validade)
        # Assuming products have next_expiry_date passed in (need to update Product model in main.py too)
        # For now, we'll iterate products and check if we have stock for them
        
        # Create a map for quick lookup
        stock_map = {s.productId: s.quantity for s in stock}
        
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        
        for p in products:
            # We need to handle the case where next_expiry_date might be passed or not
            # In the current Pydantic model it's not there, we need to add it.
            # Assuming it will be added:
            if hasattr(p, 'next_expiry_date') and p.next_expiry_date:
                try:
                    expiry_date = datetime.strptime(p.next_expiry_date, '%Y-%m-%d').date()
                    days_until = (expiry_date - today).days
                    
                    stock_qty = stock_map.get(p.id, 0)
                    
                    if stock_qty > 0:
                        if days_until <= 0:
                             risks.append({
                                "type": "validade",
                                "productId": p.id,
                                "message": f"VENCIDO: {p.name} ({stock_qty} un.)",
                                "severity": "critical",
                                "days": days_until
                            })
                        elif days_until <= 30:
                            severity = "high" if days_until <= 15 else "medium"
                            risks.append({
                                "type": "validade",
                                "productId": p.id,
                                "message": f"Vence em {days_until} dias: {p.name}",
                                "severity": severity,
                                "days": days_until,
                                "stock": stock_qty,
                                "cost": p.cost,
                                "price": p.price
                            })
                except ValueError:
                    pass # Invalid date format

        # 3. Check for Sell-out Risk (Prediction)
        # Group sales by product
        sales_by_product = {}
        for s in sales:
            if s.productId not in sales_by_product:
                sales_by_product[s.productId] = []
            sales_by_product[s.productId].append(s)
            
        for p in products:
            # Prediction Logic
            p_sales = sales_by_product.get(p.id, [])
            # Count unique dates to see if we have enough history (4 periods)
            unique_dates = set(s.date for s in p_sales)
            
            if len(unique_dates) >= 4:
                # Calculate avg daily sales
                total_sold = sum(s.quantity for s in p_sales)
                avg_daily_sales = total_sold / len(unique_dates)
                
                stock_qty = stock_map.get(p.id, 0)
                
                if avg_daily_sales > 0 and stock_qty > 0:
                    days_to_sell_out = stock_qty / avg_daily_sales
                    
                    # Check expiry
                    if hasattr(p, 'next_expiry_date') and p.next_expiry_date:
                        try:
                            expiry_date = datetime.strptime(p.next_expiry_date, '%Y-%m-%d').date()
                            days_until_expiry = (expiry_date - today).days
                            
                            if days_to_sell_out > days_until_expiry:
                                # Risk: Won't sell out in time
                                risks.append({
                                    "type": "prediction_risk",
                                    "productId": p.id,
                                    "message": f"Risco de Sobra: Venda estimada em {int(days_to_sell_out)} dias, mas vence em {days_until_expiry} dias.",
                                    "severity": "high",
                                    "days_to_sell_out": days_to_sell_out,
                                    "days_until_expiry": days_until_expiry,
                                    "avg_daily_sales": avg_daily_sales,
                                    "stock": stock_qty,
                                    "cost": p.cost,
                                    "price": p.price
                                })
                        except:
                            pass

            # 4. Check for Slow Moving Products (Giro de Estoque)
            # Logic: If we have stock history (>= 3 snapshots) and sales are very low
            
            # Get stock history for this product
            p_stock_snapshots = [s for s in stock if s.productId == p.id]
            stock_dates = set(s.timestamp for s in p_stock_snapshots)
            
            if len(stock_dates) >= 3: # We have observed this product for at least 3 periods
                total_sold = sum(s.quantity for s in p_sales)
                current_stock = stock_map.get(p.id, 0)
                
                if current_stock > 5: # Only care if we have some stock
                    # Calculate sales rate
                    # If total sold is 0 or very low relative to stock
                    is_slow_moving = total_sold == 0 or (total_sold / current_stock) < 0.1
                    
                    if is_slow_moving:
                         risks.append({
                            "type": "slow_sales",
                            "productId": p.id,
                            "message": f"Baixo Giro: {total_sold} vendas em {len(stock_dates)} períodos. Estoque: {current_stock}.",
                            "severity": "medium",
                            "total_sold": total_sold,
                            "stock": current_stock,
                            "cost": p.cost,
                            "price": p.price
                        })

        return risks
