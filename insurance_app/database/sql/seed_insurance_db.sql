-- Insert Policyholders
INSERT INTO insurance.policyholders (first_name, last_name, email, phone, date_of_birth, policyholder_type)
VALUES
  ('Sarah', 'Johnson', 'sarah.johnson@example.com', '+447908801000', '1985-03-15', 'Individual'),
  ('Michael', 'Chen', 'michael.chen@example.com', '+447908801001', '1978-07-22', 'Family'),
  ('Emily', 'Rodriguez', 'emily.rodriguez@example.com', '+447908801002', '1992-11-08', 'Individual'),
  ('David', 'Thompson', 'david.thompson@example.com', '+447908801003', '1965-05-30', 'Senior'),
  ('Acme Corp', 'Business', 'contact@acmecorp.com', '+447908801004', '1990-01-01', 'Business'),
  ('Jennifer', 'Martinez', 'jennifer.martinez@example.com', '+447908801005', '1988-09-12', 'Family'),
  ('Robert', 'Wilson', 'robert.wilson@example.com', '+447908801006', '1975-04-18', 'Individual'),
  ('Tech Solutions Ltd', 'Group', 'hr@techsolutions.com', '+447908801007', '1995-06-01', 'Group'),
  ('Patricia', 'Anderson', 'patricia.anderson@example.com', '+447908801008', '1960-12-25', 'Senior'),
  ('James', 'Taylor', 'james.taylor@example.com', '+447908801009', '1990-08-07', 'Individual'),
  ('Global Industries', 'Corporate', 'admin@globalind.com', '+447908801010', '1985-03-14', 'Business'),
  ('Lisa', 'Brown', 'lisa.brown@example.com', '+447908801011', '1982-02-20', 'Family'),
  ('William', 'Garcia', 'william.garcia@example.com', '+447908801012', '1968-10-15', 'Senior'),
  ('Mary', 'Davis', 'mary.davis@example.com', '+447908801013', '1995-06-28', 'Individual'),
  ('Healthcare Union', 'Association', 'contact@healthunion.com', '+447908801014', '2000-01-01', 'Group'),
  ('Christopher', 'Miller', 'christopher.miller@example.com', '+447908801015', '1987-11-03', 'Family'),
  ('Elizabeth', 'Moore', 'elizabeth.moore@example.com', '+447908801016', '1972-04-09', 'Individual'),
  ('Manufacturing Co', 'Business', 'info@mfgco.com', '+447908801017', '1980-07-15', 'Business'),
  ('Daniel', 'Jackson', 'daniel.jackson@example.com', '+447908801018', '1963-09-22', 'Senior'),
  ('Jessica', 'White', 'jessica.white@example.com', '+447908801019', '1991-01-17', 'Individual');

-- Insert Policies
INSERT INTO insurance.policies (policyholder_id, policy_number, policy_type, status, coverage_amount, premium_amount, payment_frequency, coverage_level, start_date, end_date)
VALUES
  (1, 'POL-2024-001', 'Auto', 'InForce', 50000.00, 125.00, 'Monthly', 'Standard', '2024-01-01', '2025-01-01'),
  (2, 'POL-2024-002', 'Home', 'InForce', 350000.00, 180.00, 'Monthly', 'Comprehensive', '2024-02-01', '2025-02-01'),
  (3, 'POL-2024-003', 'Life', 'InForce', 500000.00, 95.00, 'Monthly', 'Premium', '2024-01-15', '2044-01-15'),
  (4, 'POL-2024-004', 'Health', 'InForce', 100000.00, 450.00, 'Monthly', 'Premium', '2024-03-01', '2025-03-01'),
  (5, 'POL-2024-005', 'Business', 'InForce', 2000000.00, 2500.00, 'Monthly', 'Comprehensive', '2024-01-01', '2025-01-01'),
  (6, 'POL-2024-006', 'Auto', 'InForce', 75000.00, 185.00, 'Monthly', 'Premium', '2024-02-15', '2025-02-15'),
  (7, 'POL-2024-007', 'Home', 'Bound', 280000.00, 155.00, 'Monthly', 'Standard', '2023-06-01', '2024-06-01'),
  (8, 'POL-2024-008', 'Health', 'InForce', 250000.00, 1850.00, 'Monthly', 'Comprehensive', '2024-01-01', '2025-01-01'),
  (9, 'POL-2024-009', 'Life', 'InForce', 300000.00, 220.00, 'Quarterly', 'Standard', '2023-09-01', '2043-09-01'),
  (10, 'POL-2024-010', 'Auto', 'InForce', 60000.00, 142.00, 'Monthly', 'Standard', '2024-04-01', '2025-04-01'),
  (11, 'POL-2024-011', 'Business', 'InForce', 5000000.00, 4200.00, 'Monthly', 'Comprehensive', '2024-01-01', '2025-01-01'),
  (12, 'POL-2024-012', 'Home', 'Bound', 425000.00, 195.00, 'Monthly', 'Premium', '2024-03-01', '2025-03-01'),
  (13, 'POL-2024-013', 'Health', 'Expired', 80000.00, 320.00, 'Monthly', 'Standard', '2023-01-01', '2024-01-01'),
  (14, 'POL-2024-014', 'Auto', 'InForce', 55000.00, 118.00, 'Monthly', 'Basic', '2024-05-01', '2025-05-01'),
  (15, 'POL-2024-015', 'Health', 'InForce', 300000.00, 2100.00, 'Monthly', 'Comprehensive', '2024-02-01', '2025-02-01'),
  (16, 'POL-2024-016', 'Home', 'InForce', 395000.00, 172.00, 'Monthly', 'Standard', '2024-01-15', '2025-01-15'),
  (17, 'POL-2024-017', 'Life', 'InForce', 400000.00, 165.00, 'Monthly', 'Standard', '2024-02-01', '2044-02-01'),
  (18, 'POL-2024-018', 'Business', 'Expired', 1500000.00, 1800.00, 'Monthly', 'Standard', '2023-07-01', '2024-07-01'),
  (19, 'POL-2024-019', 'Auto', 'Bound', 45000.00, 195.00, 'Quarterly', 'Premium', '2024-03-01', '2025-03-01'),
  (20, 'POL-2024-020', 'Health', 'InForce', 120000.00, 385.00, 'Monthly', 'Premium', '2024-04-01', '2025-04-01');

-- Insert Claims
INSERT INTO insurance.claims (policy_id, claim_number, claim_type, claim_status, filed_date, incident_date, claim_amount, settlement_amount, description)
VALUES
  (1, 'CLM-2024-001', 'Accident', 'Closed', '2024-03-15 10:30:00', '2024-03-14', 8500.00, 7800.00, 'Rear-end collision on highway, minor injuries'),
  (2, 'CLM-2024-002', 'Damage', 'Open', '2024-04-02 14:20:00', '2024-04-01', 15000.00, 14200.00, 'Water damage from burst pipe in kitchen'),
  (3, 'CLM-2024-003', 'Medical', 'Open', '2024-05-10 09:15:00', '2024-05-08', 125000.00, NULL, 'Emergency surgery coverage claim'),
  (4, 'CLM-2024-004', 'Medical', 'Closed', '2024-02-20 11:45:00', '2024-02-18', 12500.00, 12500.00, 'Hospital stay for pneumonia treatment'),
  (5, 'CLM-2024-005', 'Liability', 'Open', '2024-03-25 16:00:00', '2024-03-22', 45000.00, 42000.00, 'Product liability claim settlement'),
  (6, 'CLM-2024-006', 'Theft', 'Closed', '2024-04-18 13:30:00', '2024-04-17', 3200.00, 3000.00, 'Vehicle break-in, stolen electronics'),
  (7, 'CLM-2024-007', 'Damage', 'Closed', '2024-05-05 10:00:00', '2024-05-03', 22000.00, 0.00, 'Storm damage claim - pre-existing condition'),
  (8, 'CLM-2024-008', 'Medical', 'Draft', '2024-06-01 08:45:00', '2024-05-30', 8900.00, NULL, 'Outpatient procedure claim'),
  (9, 'CLM-2024-009', 'Medical', 'Closed', '2024-01-10 14:15:00', '2024-01-08', 5600.00, 5600.00, 'Routine health screening covered'),
  (10, 'CLM-2024-010', 'Accident', 'Open', '2024-05-20 15:30:00', '2024-05-19', 12000.00, NULL, 'Single vehicle accident, investigating fault'),
  (11, 'CLM-2024-011', 'Damage', 'Closed', '2024-02-28 09:30:00', '2024-02-26', 95000.00, 88000.00, 'Fire damage to warehouse inventory'),
  (12, 'CLM-2024-012', 'Theft', 'Open', '2024-04-12 12:00:00', '2024-04-10', 28000.00, 26500.00, 'Burglary claim for jewelry and electronics'),
  (13, 'CLM-2024-013', 'Medical', 'Closed', '2024-03-01 11:20:00', '2024-02-28', 15000.00, 0.00, 'Treatment not covered under policy terms'),
  (14, 'CLM-2024-014', 'Damage', 'Draft', '2024-06-05 10:45:00', '2024-06-04', 4200.00, NULL, 'Hail damage to vehicle'),
  (15, 'CLM-2024-015', 'Medical', 'Closed', '2024-03-18 13:15:00', '2024-03-15', 32000.00, 32000.00, 'Emergency room visit and treatment'),
  (16, 'CLM-2024-016', 'Damage', 'Open', '2024-05-28 16:45:00', '2024-05-27', 18500.00, NULL, 'Tree fell on roof during storm'),
  (17, 'CLM-2024-017', 'Medical', 'Closed', '2024-04-08 09:00:00', '2024-04-05', 7500.00, 7500.00, 'Specialist consultation and tests'),
  (18, 'CLM-2024-018', 'Liability', 'Closed', '2024-01-22 14:30:00', '2024-01-20', 65000.00, 0.00, 'Claim withdrawn by claimant'),
  (19, 'CLM-2024-019', 'Accident', 'Open', '2024-05-15 11:00:00', '2024-05-14', 9800.00, 9200.00, 'Parking lot collision, property damage only'),
  (20, 'CLM-2024-020', 'Medical', 'Draft', '2024-06-03 15:20:00', '2024-06-01', 14200.00, NULL, 'Physical therapy sessions claim');

-- Insert Agents
INSERT INTO insurance.agents (first_name, last_name, email, phone, region, license_number)
VALUES
  ('Amanda', 'Reynolds', 'amanda.reynolds@insurance.com', '+447908802000', 'North', 'AGT-N-10001'),
  ('Brandon', 'Foster', 'brandon.foster@insurance.com', '+447908802001', 'South', 'AGT-S-10002'),
  ('Catherine', 'Hughes', 'catherine.hughes@insurance.com', '+447908802002', 'East', 'AGT-E-10003'),
  ('Derek', 'Sullivan', 'derek.sullivan@insurance.com', '+447908802003', 'West', 'AGT-W-10004'),
  ('Emma', 'Peterson', 'emma.peterson@insurance.com', '+447908802004', 'Central', 'AGT-C-10005'),
  ('Frank', 'Cooper', 'frank.cooper@insurance.com', '+447908802005', 'North', 'AGT-N-10006'),
  ('Grace', 'Bennett', 'grace.bennett@insurance.com', '+447908802006', 'South', 'AGT-S-10007'),
  ('Harold', 'Reed', 'harold.reed@insurance.com', '+447908802007', 'East', 'AGT-E-10008'),
  ('Irene', 'Morgan', 'irene.morgan@insurance.com', '+447908802008', 'West', 'AGT-W-10009'),
  ('Jacob', 'Bell', 'jacob.bell@insurance.com', '+447908802009', 'Central', 'AGT-C-10010');

-- Insert Policy-Agent relationships
INSERT INTO insurance.policy_agents (policy_id, agent_id, assigned_date)
VALUES
  (1, 1, '2024-01-01'),
  (2, 1, '2024-02-01'),
  (3, 2, '2024-01-15'),
  (4, 3, '2024-03-01'),
  (5, 5, '2024-01-01'),
  (6, 4, '2024-02-15'),
  (7, 2, '2023-06-01'),
  (8, 5, '2024-01-01'),
  (9, 3, '2023-09-01'),
  (10, 1, '2024-04-01'),
  (11, 5, '2024-01-01'),
  (12, 4, '2024-03-01'),
  (13, 3, '2023-01-01'),
  (14, 2, '2024-05-01'),
  (15, 5, '2024-02-01'),
  (16, 4, '2024-01-15'),
  (17, 1, '2024-02-01'),
  (18, 5, '2023-07-01'),
  (19, 3, '2024-03-01'),
  (20, 2, '2024-04-01');
