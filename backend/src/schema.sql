CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255),
  next_expiry_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_snapshots (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id),
  quantity INTEGER NOT NULL,
  captured_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id),
  sale_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, sale_date)
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id SERIAL PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id),
  prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL, -- 'ok', 'risk', 'critical'
  suggested_action TEXT,
  confidence_score DECIMAL(5, 4), -- 0.0 to 1.0
  details JSONB -- Store extra details like calculated sell-out date
);
