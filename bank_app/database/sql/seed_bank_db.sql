-- Insert Customers
INSERT INTO bank.customers (first_name, last_name, email, phone, customer_type)
VALUES 
  ('Alice', 'Smith', 'alice.smith@example.com', '+447908806000', 'Individual'),
  ('Bob', 'Johnson', 'bob.johnson@example.com', '+447908806001', 'Business'),
  ('Charlie', 'Williams', 'charlie.williams@example.com', '+447908806002', 'VIP'),
  ('Diana', 'Brown', 'diana.brown@example.com', '+447908806003', 'Government'),
  ('Eve', 'Jones', 'eve.jones@example.com', '+447908806004', 'Nonprofit'),
  ('Frank', 'Garcia', 'frank.garcia@example.com', '+447908806005', 'Individual'),
  ('Grace', 'Miller', 'grace.miller@example.com', '+447908806006', 'Business'),
  ('Henry', 'Davis', 'henry.davis@example.com', '+447908806007', 'VIP'),
  ('Ivy', 'Martinez', 'ivy.martinez@example.com', '+447908806008', 'Government'),
  ('Jack', 'Rodriguez', 'jack.rodriguez@example.com', '+447908806009', 'Nonprofit'),
  ('Kate', 'Wilson', 'kate.wilson@example.com', '+447908806010', 'Individual'),
  ('Leo', 'Anderson', 'leo.anderson@example.com', '+447908806011', 'Business'),
  ('Mia', 'Thomas', 'mia.thomas@example.com', '+447908806012', 'VIP'),
  ('Nina', 'Taylor', 'nina.taylor@example.com', '+447908806013', 'Government'),
  ('Oscar', 'Moore', 'oscar.moore@example.com', '+447908806014', 'Nonprofit'),
  ('Paul', 'Jackson', 'paul.jackson@example.com', '+447908806015', 'Individual'),
  ('Quinn', 'White', 'quinn.white@example.com', '+447908806016', 'Business'),
  ('Rose', 'Harris', 'rose.harris@example.com', '+447908806017', 'VIP'),
  ('Sam', 'Clark', 'sam.clark@example.com', '+447908806018', 'Government'),
  ('Tina', 'Lewis', 'tina.lewis@example.com', '+447908806019', 'Nonprofit');

-- Insert Accounts
INSERT INTO bank.accounts (customer_id, account_type, status, opened_date, balance)
VALUES 
  (1, 'Checking', 'Active', '2023-01-01', 1500.00),
  (2, 'Savings', 'Active', '2023-02-01', 8200.00),
  (3, 'Credit', 'Frozen', '2023-03-01', -3000.00),
  (4, 'Loan', 'Active', '2023-04-01', -15000.00),
  (5, 'Investment', 'Frozen', '2023-05-01', 1200000.00),
  (6, 'Checking', 'Overdrawn', '2023-06-01', -500.00),
  (7, 'Savings', 'Active', '2023-07-01', 7200.00),
  (8, 'Credit', 'Active', '2023-08-01', 0.00),
  (9, 'Loan', 'Active', '2023-09-01', -45000.00),
  (10, 'Investment', 'Active', '2023-10-01', 250000.00),
  (11, 'Checking', 'Active', '2023-11-01', 950.00),
  (12, 'Savings', 'Frozen', '2023-12-01', 10200.00),
  (13, 'Credit', 'Active', '2024-01-01', -1800.00),
  (14, 'Loan', 'Active', '2024-02-01', -22000.00),
  (15, 'Investment', 'Active', '2024-03-01', 0.00),
  (16, 'Checking', 'Frozen', '2024-04-01', 10500.00),
  (17, 'Savings', 'Overdrawn', '2024-05-01', -250.00),
  (18, 'Credit', 'Active', '2024-06-01', -800.00),
  (19, 'Loan', 'Frozen', '2024-07-01', -13000.00),
  (20, 'Investment', 'Active', '2024-08-01', 600000.00);

-- Insert Transactions
INSERT INTO bank.transactions (account_id, transaction_type, transaction_date, amount, channel, currency)
VALUES 
  (1, 'Deposit', '2024-01-01', 500.00, 'Online', 'USD'),
  (2, 'Withdrawal', '2024-01-02', -300.00, 'ATM', 'USD'),
  (3, 'Transfer', '2024-01-03', -2000.00, 'Mobile', 'USD'),
  (4, 'Payment', '2024-01-04', -1500.00, 'Wire', 'USD'),
  (5, 'Fee', '2024-01-05', -25.00, 'Branch', 'USD'),
  (6, 'Deposit', '2024-01-06', 200.00, 'Online', 'USD'),
  (7, 'Withdrawal', '2024-01-07', -450.00, 'ATM', 'USD'),
  (8, 'Transfer', '2024-01-08', -175.00, 'Mobile', 'USD'),
  (9, 'Payment', '2024-01-09', -3000.00, 'Wire', 'USD'),
  (10, 'Fee', '2024-01-10', -30.00, 'Branch', 'USD'),
  (11, 'Deposit', '2024-01-11', 7000.00, 'Online', 'USD'),
  (12, 'Withdrawal', '2024-01-12', -500.00, 'ATM', 'USD'),
  (13, 'Transfer', '2024-01-13', -120.00, 'Mobile', 'USD'),
  (14, 'Payment', '2024-01-14', -10000.00, 'Wire', 'USD'),
  (15, 'Fee', '2024-01-15', -20.00, 'Branch', 'USD'),
  (16, 'Deposit', '2024-01-16', 100000.00, 'Wire', 'USD'), -- outlier
  (17, 'Withdrawal', '2024-01-17', -100000.00, 'Wire', 'USD'), -- outlier
  (18, 'Transfer', '2024-01-18', -50.00, 'Mobile', 'USD'),
  (19, 'Payment', '2024-01-19', -9000.00, 'Online', 'USD'),
  (20, 'Fee', '2024-01-20', -10.00, 'ATM', 'USD');

-- Insert Transaction Metadata (dependent columns)
INSERT INTO bank.transaction_metadata (transaction_id, channel_details, location, device_type, auth_method)
VALUES 
  (1, 'Logged in via Chrome', 'New York', 'Desktop', 'Password'),
  (2, 'ATM withdrawal', 'Los Angeles', 'ATM', 'PIN'),
  (3, 'Mobile app v2.1', 'Chicago', 'Mobile', 'Biometric'),
  (4, 'Wire from bank', 'Houston', 'Desktop', '2FA'),
  (5, 'Branch fee', 'Miami', 'Kiosk', 'Card'),
  (6, 'Online portal', 'Dallas', 'Desktop', '2FA'),
  (7, 'ATM fee', 'San Diego', 'ATM', 'PIN'),
  (8, 'Mobile push', 'Phoenix', 'Mobile', 'Password'),
  (9, 'SWIFT code entry', 'Seattle', 'Desktop', '2FA'),
  (10, 'In-person', 'Denver', 'Kiosk', 'Card'),
  (11, 'Web login', 'Boston', 'Desktop', 'Password'),
  (12, 'ATM machine', 'Portland', 'ATM', 'PIN'),
  (13, 'App fingerprint', 'Atlanta', 'Mobile', 'Biometric'),
  (14, 'Manual wire input', 'Detroit', 'Desktop', '2FA'),
  (15, 'bank fee branch', 'Orlando', 'Kiosk', 'Card'),
  (16, 'High-value wire', 'NYC HQ', 'Desktop', '2FA'),
  (17, 'Manual override', 'LA Branch', 'Desktop', 'Card'),
  (18, 'Auto mobile tx', 'San Jose', 'Mobile', 'Password'),
  (19, 'Scheduled online', 'Austin', 'Desktop', 'Password'),
  (20, 'ATM fee', 'Vegas', 'ATM', 'PIN');

-- Insert Branches
INSERT INTO bank.branches (name, region, manager_name)
VALUES 
  ('Downtown Branch', 'North', 'Elena Murphy'),
  ('Uptown Branch', 'South', 'Greg Shaw'),
  ('Midtown Branch', 'East', 'Holly Grant'),
  ('Suburban Branch', 'West', 'Ian Ford'),
  ('Capitol Branch', 'Central', 'Jane Park'),
  ('Riverbank Branch', 'North', 'Ken Yu'),
  ('Hilltop Branch', 'South', 'Laura Bae'),
  ('Seaside Branch', 'East', 'Mike Zhao'),
  ('Airport Branch', 'West', 'Nina Patel'),
  ('Old Town Branch', 'Central', 'Oliver Nash'),
  ('Metro Branch', 'North', 'Pat Quinn'),
  ('Commerce Branch', 'South', 'Rita Black'),
  ('Civic Branch', 'East', 'Steve Lang'),
  ('Lakeside Branch', 'West', 'Tara Dee'),
  ('Crossroad Branch', 'Central', 'Uma Ray'),
  ('Cityline Branch', 'North', 'Victor Cho'),
  ('Plaza Branch', 'South', 'Wendy Lim'),
  ('Granite Branch', 'East', 'Xander Wu'),
  ('Beacon Branch', 'West', 'Yvonne Kim'),
  ('Harbor Branch', 'Central', 'Zane Moore');
