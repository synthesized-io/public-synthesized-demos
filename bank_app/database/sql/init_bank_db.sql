-- Create schema
CREATE SCHEMA IF NOT EXISTS bank;

-- Create ENUM types
CREATE TYPE bank.customer_type_enum AS ENUM ('Individual', 'Business', 'VIP', 'Government', 'Nonprofit');
CREATE TYPE bank.account_type_enum AS ENUM ('Checking', 'Savings', 'Credit', 'Loan', 'Investment');
CREATE TYPE bank.account_status_enum AS ENUM ('Active', 'Closed', 'Frozen', 'Dormant', 'Overdrawn');
CREATE TYPE bank.transaction_type_enum AS ENUM ('Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Fee');
CREATE TYPE bank.channel_enum AS ENUM ('Online', 'ATM', 'Branch', 'Mobile', 'Wire');
CREATE TYPE bank.currency_enum AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'AUD');
CREATE TYPE bank.device_type_enum AS ENUM ('Desktop', 'Mobile', 'Tablet', 'Kiosk', 'ATM');
CREATE TYPE bank.auth_method_enum AS ENUM ('Password', '2FA', 'Biometric', 'PIN', 'Card');
CREATE TYPE bank.region_enum AS ENUM ('North', 'South', 'East', 'West', 'Central');
CREATE TYPE bank.account_role_enum AS ENUM ('Primary', 'Joint', 'AuthorizedUser');

-- Customers Table
CREATE TABLE bank.customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    customer_type bank.customer_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE bank.accounts (
    account_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES bank.customers(customer_id) ON DELETE CASCADE,
    account_type bank.account_type_enum NOT NULL,
    status bank.account_status_enum NOT NULL DEFAULT 'Active',
    opened_date DATE DEFAULT CURRENT_DATE,
    balance NUMERIC(15, 2) NOT NULL
);

-- Transactions Table
CREATE TABLE bank.transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES bank.accounts(account_id) ON DELETE CASCADE,
    transaction_type bank.transaction_type_enum NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount NUMERIC(15, 2) NOT NULL,
    channel bank.channel_enum NOT NULL,
    currency bank.currency_enum NOT NULL
);

-- Transaction Metadata Table
CREATE TABLE bank.transaction_metadata (
    transaction_id INT PRIMARY KEY REFERENCES bank.transactions(transaction_id) ON DELETE CASCADE,
    channel_details TEXT,
    location TEXT,
    device_type bank.device_type_enum,
    auth_method bank.auth_method_enum
    -- Note: auth_method dependent on channel - enforced by application logic or triggers
);

-- Branches Table
CREATE TABLE bank.branches (
    branch_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region bank.region_enum NOT NULL,
    manager_name VARCHAR(100)
);