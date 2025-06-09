-- Tabel untuk Popular Tokens
CREATE TABLE IF NOT EXISTS popular_tokens (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    logo_url VARCHAR(255),
    transaction_count INTEGER DEFAULT 0,
    total_supply VARCHAR(255) DEFAULT '0',
    holders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Popular Dapps
CREATE TABLE IF NOT EXISTS popular_dapps (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    transaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger untuk memperbarui updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk popular_tokens
CREATE TRIGGER update_popular_tokens_updated_at
    BEFORE UPDATE ON popular_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk popular_dapps
CREATE TRIGGER update_popular_dapps_updated_at
    BEFORE UPDATE ON popular_dapps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tambahkan kolom yang hilang ke tabel popular_tokens
ALTER TABLE popular_tokens 
ADD COLUMN IF NOT EXISTS symbol VARCHAR(50),
ADD COLUMN IF NOT EXISTS total_supply VARCHAR(255) DEFAULT '0',
ADD COLUMN IF NOT EXISTS holders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Tambahkan kolom yang hilang ke tabel popular_dapps
ALTER TABLE popular_dapps
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;