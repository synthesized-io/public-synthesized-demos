-- Create schema
CREATE SCHEMA IF NOT EXISTS insurance;

-- Create ENUM types
CREATE TYPE insurance.policyholder_type_enum AS ENUM ('Individual', 'Family', 'Business', 'Group', 'Senior');
CREATE TYPE insurance.policy_type_enum AS ENUM ('Auto', 'Home', 'Life', 'Health', 'Business');
CREATE TYPE insurance.policy_status_enum AS ENUM ('InForce', 'Bound', 'Expired', 'Cancelled', 'Draft', 'Withdrawn');
CREATE TYPE insurance.claim_status_enum AS ENUM ('Draft', 'Open', 'Closed');
CREATE TYPE insurance.claim_type_enum AS ENUM ('Accident', 'Theft', 'Damage', 'Medical', 'Liability');
CREATE TYPE insurance.payment_frequency_enum AS ENUM ('Monthly', 'Quarterly', 'SemiAnnually', 'Annually');
CREATE TYPE insurance.coverage_level_enum AS ENUM ('Basic', 'Standard', 'Premium', 'Comprehensive');
CREATE TYPE insurance.agent_region_enum AS ENUM ('North', 'South', 'East', 'West', 'Central');

-- Policyholders Table (equivalent to Customers)
CREATE TABLE insurance.policyholders (
    policyholder_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    policyholder_type insurance.policyholder_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies Table (equivalent to Accounts)
CREATE TABLE insurance.policies (
    policy_id SERIAL PRIMARY KEY,
    policyholder_id INT NOT NULL REFERENCES insurance.policyholders(policyholder_id) ON DELETE CASCADE,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    policy_type insurance.policy_type_enum NOT NULL,
    status insurance.policy_status_enum NOT NULL DEFAULT 'InForce',
    coverage_amount NUMERIC(15, 2) NOT NULL,
    premium_amount NUMERIC(10, 2) NOT NULL,
    payment_frequency insurance.payment_frequency_enum NOT NULL,
    coverage_level insurance.coverage_level_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims Table (equivalent to Transactions)
CREATE TABLE insurance.claims (
    claim_id SERIAL PRIMARY KEY,
    policy_id INT NOT NULL REFERENCES insurance.policies(policy_id) ON DELETE CASCADE,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_type insurance.claim_type_enum NOT NULL,
    claim_status insurance.claim_status_enum NOT NULL DEFAULT 'Draft',
    filed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    incident_date DATE NOT NULL,
    claim_amount NUMERIC(15, 2) NOT NULL,
    settlement_amount NUMERIC(15, 2),
    description TEXT
);

-- Agents Table
CREATE TABLE insurance.agents (
    agent_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    region insurance.agent_region_enum NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL
);

-- Policy-Agent relationship (many-to-many through policies)
CREATE TABLE insurance.policy_agents (
    policy_id INT NOT NULL REFERENCES insurance.policies(policy_id) ON DELETE CASCADE,
    agent_id INT NOT NULL REFERENCES insurance.agents(agent_id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (policy_id, agent_id)
);