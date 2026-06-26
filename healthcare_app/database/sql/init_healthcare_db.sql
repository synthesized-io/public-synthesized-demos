-- Create schema
CREATE SCHEMA IF NOT EXISTS healthcare;

-- Create ENUM types
CREATE TYPE healthcare.patient_type_enum AS ENUM ('Adult', 'Pediatric', 'Geriatric', 'Prenatal', 'Emergency');
CREATE TYPE healthcare.blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE healthcare.appointment_type_enum AS ENUM ('Consultation', 'FollowUp', 'Emergency', 'Surgery', 'Checkup', 'Vaccination');
CREATE TYPE healthcare.appointment_status_enum AS ENUM ('Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow');
CREATE TYPE healthcare.prescription_status_enum AS ENUM ('Active', 'Completed', 'Cancelled', 'Expired');
CREATE TYPE healthcare.department_enum AS ENUM ('Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Emergency', 'GeneralPractice');
CREATE TYPE healthcare.provider_specialization_enum AS ENUM ('GeneralPractitioner', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedist', 'Dermatologist', 'EmergencyMedicine');

-- Patients Table (equivalent to Customers)
CREATE TABLE healthcare.patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_type healthcare.blood_type_enum,
    patient_type healthcare.patient_type_enum NOT NULL,
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    insurance_policy_id INT,  -- Cross-reference to insurance app
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers Table
CREATE TABLE healthcare.providers (
    provider_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    specialization healthcare.provider_specialization_enum NOT NULL,
    department healthcare.department_enum NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    years_of_experience INT
);

-- Appointments Table (equivalent to Accounts)
CREATE TABLE healthcare.appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES healthcare.patients(patient_id) ON DELETE CASCADE,
    provider_id INT REFERENCES healthcare.providers(provider_id) ON DELETE SET NULL,
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    appointment_type healthcare.appointment_type_enum NOT NULL,
    appointment_status healthcare.appointment_status_enum NOT NULL DEFAULT 'Scheduled',
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    provider_name VARCHAR(100) NOT NULL,
    department healthcare.department_enum NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table (equivalent to Transactions)
CREATE TABLE healthcare.prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES healthcare.appointments(appointment_id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES healthcare.patients(patient_id) ON DELETE CASCADE,
    provider_id INT REFERENCES healthcare.providers(provider_id) ON DELETE SET NULL,
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    refills_remaining INT DEFAULT 0,
    pharmacy_name VARCHAR(200),
    prescription_status healthcare.prescription_status_enum NOT NULL DEFAULT 'Active',
    instructions TEXT
);

-- Indexes for cross-system integration
CREATE INDEX idx_patients_insurance_policy ON healthcare.patients(insurance_policy_id);

-- Performance indexes for appointments queries
CREATE INDEX idx_appointments_patient_id ON healthcare.appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON healthcare.appointments(provider_id);
CREATE INDEX idx_appointments_appointment_date ON healthcare.appointments(appointment_date DESC);
CREATE INDEX idx_appointments_status ON healthcare.appointments(appointment_status);
CREATE INDEX idx_appointments_patient_date ON healthcare.appointments(patient_id, appointment_date DESC);
CREATE INDEX idx_appointments_status_date ON healthcare.appointments(appointment_status, appointment_date DESC);

-- Performance indexes for prescriptions queries
CREATE INDEX idx_prescriptions_patient_id ON healthcare.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_provider_id ON healthcare.prescriptions(provider_id);
CREATE INDEX idx_prescriptions_appointment_id ON healthcare.prescriptions(appointment_id);
