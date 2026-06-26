-- Insert Patients (with some linked to insurance policies)
INSERT INTO healthcare.patients (first_name, last_name, email, phone, date_of_birth, blood_type, patient_type, medical_record_number, insurance_policy_id)
VALUES
  ('Sarah', 'Johnson', 'sarah.johnson@example.com', '+447908801000', '1985-03-15', 'A+', 'Adult', 'MRN-2024-001', 1),  -- Linked to insurance POL-2024-001
  ('Michael', 'Chen', 'michael.chen@example.com', '+447908801001', '1978-07-22', 'O+', 'Adult', 'MRN-2024-002', 2),  -- Linked to insurance POL-2024-002
  ('Alex', 'Davis', 'alex.davis@example.com', '+447908803000', '2015-05-10', 'B+', 'Pediatric', 'MRN-2024-003', 6),  -- Linked to family policy
  ('Jordan', 'Wilson', 'jordan.wilson@example.com', '+447908801006', '1975-04-18', 'AB+', 'Adult', 'MRN-2024-004', 7),
  ('Taylor', 'Anderson', 'taylor.anderson@example.com', '+447908801008', '1960-12-25', 'A-', 'Geriatric', 'MRN-2024-005', 9),
  ('Casey', 'Taylor', 'casey.taylor@example.com', '+447908801009', '1990-08-07', 'O-', 'Adult', 'MRN-2024-006', 10),
  ('Morgan', 'Brown', 'morgan.brown@example.com', '+447908801011', '1982-02-20', 'B-', 'Adult', 'MRN-2024-007', 12),
  ('Riley', 'Garcia', 'riley.garcia@example.com', '+447908801012', '1968-10-15', 'AB-', 'Geriatric', 'MRN-2024-008', 13),
  ('Cameron', 'Davis', 'cameron.davis@example.com', '+447908801013', '1995-06-28', 'O+', 'Adult', 'MRN-2024-009', 14),
  ('Quinn', 'Miller', 'quinn.miller@example.com', '+447908801015', '1987-11-03', 'A+', 'Adult', 'MRN-2024-010', 16),
  ('Avery', 'Martinez', 'avery.martinez@example.com', '+447908803001', '2010-09-18', 'B+', 'Pediatric', 'MRN-2024-011', NULL),
  ('Jamie', 'Moore', 'jamie.moore@example.com', '+447908801016', '1972-04-09', 'O+', 'Adult', 'MRN-2024-012', 17),
  ('Reese', 'Jackson', 'reese.jackson@example.com', '+447908801018', '1963-09-22', 'A-', 'Geriatric', 'MRN-2024-013', 19),
  ('Dakota', 'White', 'dakota.white@example.com', '+447908801019', '1991-01-17', 'B+', 'Adult', 'MRN-2024-014', 20),
  ('Sage', 'Thompson', 'sage.thompson@example.com', '+447908803002', '2018-03-25', 'AB+', 'Pediatric', 'MRN-2024-015', NULL),
  ('Rowan', 'Lee', 'rowan.lee@example.com', '+447908803003', '1955-11-30', 'O-', 'Geriatric', 'MRN-2024-016', NULL),
  ('Drew', 'Harris', 'drew.harris@example.com', '+447908803004', '1988-01-14', 'A+', 'Adult', 'MRN-2024-017', NULL),
  ('Finley', 'Clark', 'finley.clark@example.com', '+447908803005', '2023-08-05', 'B-', 'Prenatal', 'MRN-2024-018', NULL),
  ('Phoenix', 'Young', 'phoenix.young@example.com', '+447908803006', '1979-06-12', 'AB-', 'Adult', 'MRN-2024-019', NULL),
  ('Skyler', 'King', 'skyler.king@example.com', '+447908803007', '1948-02-28', 'O+', 'Geriatric', 'MRN-2024-020', NULL);

-- Insert Providers (must come before Appointments due to foreign key constraint)
INSERT INTO healthcare.providers (first_name, last_name, email, phone, specialization, department, license_number, years_of_experience)
VALUES
  ('Amanda', 'Reynolds', 'amanda.reynolds@healthcare.com', '+447908804000', 'Cardiologist', 'Cardiology', 'MD-CARD-10001', 15),
  ('Brandon', 'Foster', 'brandon.foster@healthcare.com', '+447908804001', 'GeneralPractitioner', 'GeneralPractice', 'MD-GP-10002', 12),
  ('Catherine', 'Hughes', 'catherine.hughes@healthcare.com', '+447908804002', 'Pediatrician', 'Pediatrics', 'MD-PED-10003', 18),
  ('Derek', 'Sullivan', 'derek.sullivan@healthcare.com', '+447908804003', 'Orthopedist', 'Orthopedics', 'MD-ORTH-10004', 20),
  ('Emma', 'Peterson', 'emma.peterson@healthcare.com', '+447908804004', 'Neurologist', 'Neurology', 'MD-NEUR-10005', 14),
  ('Frank', 'Cooper', 'frank.cooper@healthcare.com', '+447908804005', 'EmergencyMedicine', 'Emergency', 'MD-EM-10006', 10),
  ('Grace', 'Bennett', 'grace.bennett@healthcare.com', '+447908804006', 'GeneralPractitioner', 'GeneralPractice', 'MD-GP-10007', 8),
  ('Harold', 'Reed', 'harold.reed@healthcare.com', '+447908804007', 'Dermatologist', 'Dermatology', 'MD-DERM-10008', 16),
  ('Irene', 'Morgan', 'irene.morgan@healthcare.com', '+447908804008', 'Cardiologist', 'Cardiology', 'MD-CARD-10009', 22),
  ('Jacob', 'Bell', 'jacob.bell@healthcare.com', '+447908804009', 'Pediatrician', 'Pediatrics', 'MD-PED-10010', 11);

-- Insert Appointments
INSERT INTO healthcare.appointments (patient_id, provider_id, appointment_number, appointment_type, appointment_status, appointment_date, duration_minutes, provider_name, department, notes)
VALUES
  (1, 1, 'APT-2024-001', 'Consultation', 'Completed', '2024-03-15 10:00:00', 45, 'Dr. Amanda Reynolds', 'Cardiology', 'Annual heart health checkup'),
  (2, 2, 'APT-2024-002', 'FollowUp', 'Completed', '2024-04-02 14:30:00', 30, 'Dr. Brandon Foster', 'GeneralPractice', 'Follow-up for hypertension'),
  (3, 3, 'APT-2024-003', 'Checkup', 'Completed', '2024-05-10 09:00:00', 30, 'Dr. Catherine Hughes', 'Pediatrics', 'Routine pediatric checkup'),
  (4, 4, 'APT-2024-004', 'Consultation', 'Completed', '2024-02-20 11:00:00', 60, 'Dr. Derek Sullivan', 'Orthopedics', 'Knee pain evaluation'),
  (5, 5, 'APT-2024-005', 'FollowUp', 'Completed', '2024-05-15 15:00:00', 30, 'Dr. Emma Peterson', 'Neurology', 'Migraine follow-up'),
  (6, 6, 'APT-2024-006', 'Emergency', 'Completed', '2024-04-18 18:30:00', 90, 'Dr. Frank Cooper', 'Emergency', 'Chest pain emergency visit'),
  (7, 7, 'APT-2024-007', 'Vaccination', 'Completed', '2024-05-05 10:30:00', 15, 'Dr. Grace Bennett', 'GeneralPractice', 'Annual flu vaccination'),
  (8, 8, 'APT-2024-008', 'Consultation', 'Completed', '2024-05-20 13:00:00', 45, 'Dr. Harold Reed', 'Dermatology', 'Skin condition consultation'),
  (9, 2, 'APT-2024-009', 'Checkup', 'Completed', '2024-01-10 08:30:00', 30, 'Dr. Brandon Foster', 'GeneralPractice', 'Routine annual checkup'),
  (10, 4, 'APT-2024-010', 'Surgery', 'Completed', '2024-05-25 07:00:00', 180, 'Dr. Derek Sullivan', 'Orthopedics', 'Scheduled knee arthroscopy'),
  (11, 3, 'APT-2024-011', 'Vaccination', 'Completed', '2024-02-28 14:00:00', 15, 'Dr. Catherine Hughes', 'Pediatrics', 'Childhood vaccination series'),
  (12, 1, 'APT-2024-012', 'FollowUp', 'Cancelled', '2024-04-12 10:00:00', 30, 'Dr. Amanda Reynolds', 'Cardiology', 'Patient cancelled appointment'),
  (13, 5, 'APT-2024-013', 'Consultation', 'Completed', '2024-03-01 16:00:00', 45, 'Dr. Emma Peterson', 'Neurology', 'Memory concerns evaluation'),
  (14, 6, 'APT-2024-014', 'Emergency', 'Completed', '2024-05-05 22:00:00', 120, 'Dr. Frank Cooper', 'Emergency', 'Severe allergic reaction'),
  (15, 3, 'APT-2024-015', 'Checkup', 'Completed', '2024-05-18 11:00:00', 30, 'Dr. Catherine Hughes', 'Pediatrics', '18-month wellness visit'),
  (16, 2, 'APT-2024-016', 'FollowUp', 'NoShow', '2024-05-28 09:30:00', 30, 'Dr. Brandon Foster', 'GeneralPractice', 'Patient did not show'),
  (17, 8, 'APT-2024-017', 'Consultation', 'Completed', '2024-04-08 15:00:00', 45, 'Dr. Harold Reed', 'Dermatology', 'Acne treatment consultation'),
  (18, 3, 'APT-2024-018', 'Consultation', 'Completed', '2024-05-08 10:00:00', 60, 'Dr. Catherine Hughes', 'Pediatrics', 'Prenatal care visit'),
  (19, 2, 'APT-2024-019', 'Checkup', 'Completed', '2024-05-15 14:30:00', 30, 'Dr. Brandon Foster', 'GeneralPractice', 'Annual physical exam'),
  (20, 5, 'APT-2024-020', 'FollowUp', 'Completed', '2024-05-12 11:30:00', 30, 'Dr. Emma Peterson', 'Neurology', 'Parkinson follow-up');

-- Insert Prescriptions (reduced ratio - only ~40% of patients have prescriptions)
INSERT INTO healthcare.prescriptions (appointment_id, patient_id, provider_id, prescription_number, medication_name, dosage, frequency, prescribed_date, start_date, end_date, refills_remaining, pharmacy_name, prescription_status, instructions)
VALUES
  (1, 1, 1, 'RX-2024-001', 'Omeprazole', '20 mg', 'Once daily', '2024-03-15 10:45:00', '2024-03-16', '2025-03-16', 3, 'CVS Pharmacy', 'Active', 'Take before breakfast'),
  (2, 2, 2, 'RX-2024-002', 'Lisinopril', '10 mg', 'Once daily', '2024-04-02 15:00:00', '2024-04-03', '2025-04-03', 5, 'Walgreens', 'Active', 'Take in the morning'),
  (4, 4, 4, 'RX-2024-003', 'Ibuprofen', '400 mg', 'Three times daily as needed', '2024-02-20 11:30:00', '2024-02-21', '2024-03-21', 0, 'Rite Aid', 'Completed', 'Take with food'),
  (6, 6, 6, 'RX-2024-004', 'Sertraline', '50 mg', 'Once daily', '2024-04-18 19:00:00', '2024-04-19', '2025-04-19', 2, 'CVS Pharmacy', 'Active', 'Take in the morning'),
  (9, 9, 2, 'RX-2024-005', 'Metformin', '500 mg', 'Twice daily', '2024-01-10 09:00:00', '2024-01-11', '2025-01-11', 6, 'Walgreens', 'Active', 'Take with meals'),
  (11, 11, 3, 'RX-2024-006', 'Amoxicillin', '500 mg', 'Three times daily', '2024-02-28 14:30:00', '2024-02-29', '2024-03-10', 0, 'Target Pharmacy', 'Completed', 'Complete full course'),
  (17, 17, 8, 'RX-2024-007', 'Tretinoin Cream', '0.025%', 'Apply nightly', '2024-04-08 15:30:00', '2024-04-09', '2024-10-09', 2, 'Walgreens', 'Active', 'Apply to affected areas'),
  (19, 19, 2, 'RX-2024-008', 'Simvastatin', '20 mg', 'Once daily at bedtime', '2024-05-15 15:00:00', '2024-05-16', '2025-05-16', 3, 'Target Pharmacy', 'Active', 'Take at same time daily');
