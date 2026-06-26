# Healthcare Management Application

A complete healthcare management demo application built with Spring Boot (backend) and React (frontend), demonstrating relational data patterns with patients, appointments, and prescriptions.

## Overview

This application showcases how to manage healthcare data with the following relational structure:
- **Patients** → **Appointments** → **Prescriptions**
- **Providers** manage appointments

The data model mirrors the banking application pattern, adapted for the healthcare domain.

## Data Model

### Patients (equivalent to Customers)
- Basic information: first name, last name, email, phone, date of birth
- Medical information: blood type, medical record number
- Patient types: Adult, Pediatric, Geriatric, Prenatal, Emergency
- **Insurance integration**: `insurance_policy_id` field links to insurance policies
- One-to-many relationship with Appointments

### Appointments (equivalent to Accounts)
- Linked to Patients
- Attributes: appointment number, type, status, date/time, duration, provider, department
- Appointment types: Consultation, FollowUp, Emergency, Surgery, Checkup, Vaccination
- Appointment statuses: Scheduled, Confirmed, InProgress, Completed, Cancelled, NoShow
- Departments: Cardiology, Neurology, Pediatrics, Orthopedics, Dermatology, Emergency, GeneralPractice
- One-to-many relationship with Prescriptions

### Prescriptions (equivalent to Transactions)
- Linked to Appointments
- Attributes: prescription number, medication, dosage, frequency, dates, pharmacy
- Prescription statuses: Active, Completed, Cancelled, Expired
- Fields: medication name, dosage, refills remaining, instructions

### Providers
- Healthcare providers managing appointments
- Attributes: name, email, phone, specialization, department, license number
- Specializations: GeneralPractitioner, Cardiologist, Neurologist, Pediatrician, Orthopedist, Dermatologist, EmergencyMedicine

## Cross-System Integration

This application includes cross-system integration with the Insurance application:
- Patients can have linked insurance policies via `insurance_policy_id`
- Special API endpoints demonstrate cross-database queries
- Endpoints available at `/api/cross-system/*`

### Cross-System API Endpoints

1. **Get insurance info for a patient**: `GET /api/cross-system/patient/{patientId}/insurance`
   - Returns insurance policy details for a specific patient
   - Shows policyholder information and coverage details

2. **Get patients with insurance links**: `GET /api/cross-system/patients-with-insurance-links`
   - Returns all patients that have linked insurance policies
   - Demonstrates referential integrity across systems

## Running the Application

### Using Docker Compose (Recommended)

```bash
# From the repository root
docker compose up healthcare
```

**Default URLs:**
- Frontend: http://localhost:3007
- Backend: http://localhost:8087
- Swagger docs: http://localhost:8087/swagger-ui/index.html
- API docs: http://localhost:8087/api-docs

### Port Configuration

| Service   | Description          | Default Port | Environment Variable        |
|-----------|----------------------|--------------|-----------------------------|
| postgres  | PostgreSQL database  | 5440         | HEALTHCARE_DB_PORT          |
| backend   | Spring Boot backend  | 8087         | HEALTHCARE_BACKEND_PORT     |
| frontend  | React frontend       | 3007         | HEALTHCARE_FRONTEND_PORT    |

**Changing Ports:**
```bash
HEALTHCARE_BACKEND_PORT=8090 HEALTHCARE_FRONTEND_PORT=3010 HEALTHCARE_DB_PORT=5441 docker compose up healthcare
```

**To see application logs:**
```bash
docker compose up healthcare --attach-dependencies
```

### Database Structure

The application uses three PostgreSQL databases:
- `healthcare_seed` - Contains seeded demo data
- `healthcare_testing` - Testing database with sample data
- `healthcare_prod` - Production database (initially empty)

You can switch between databases using the database selector in the UI or via API parameter `?database=TESTING`

## API Documentation

Full API documentation is available via Swagger UI at http://localhost:8087/swagger-ui/index.html

### Main API Endpoints

**Patients:**
- `GET /api/patients` - List patients (with pagination, filtering, sorting)
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create patient
- `DELETE /api/patients/{id}` - Delete patient

**Appointments:**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/{id}` - Update appointment status
- `DELETE /api/appointments/{id}` - Delete appointment

**Prescriptions:**
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `DELETE /api/prescriptions/{id}` - Delete prescription

**Providers:**
- `GET /api/providers` - List providers
- `POST /api/providers` - Create provider
- `PUT /api/providers/{id}/department` - Update provider department
- `DELETE /api/providers/{id}` - Delete provider

**Statistics:**
- `GET /api/statistics` - Get entity counts
- `GET /api/statistics/appointment-status-counts` - Get appointment counts by status

## Technology Stack

**Backend:**
- Spring Boot 3.2.3
- Java 17
- PostgreSQL 15
- Spring JDBC
- Springdoc OpenAPI (Swagger)

**Frontend:**
- React 18
- Material-UI
- Axios
- React Router
- Recharts (for statistics visualization)

**Deployment:**
- Docker & Docker Compose
- Nginx (for frontend serving)

## Sample Data

The application includes 20 sample patients, 20 appointments, 20 prescriptions, and 10 providers with realistic healthcare scenarios. Some patients are linked to insurance policies (from the insurance application) to demonstrate cross-system integration.

## Cross-System Demonstration

To demonstrate the cross-system integration:

1. **Start both applications:**
   ```bash
   docker compose up insurance healthcare
   ```

2. **View a patient with insurance:**
   - Go to http://localhost:3007 (Healthcare app)
   - View patients - some will have `insurance_policy_id` populated

3. **Query cross-system data:**
   - From insurance app: http://localhost:8086/api/cross-system/policy/1/healthcare
   - From healthcare app: http://localhost:8087/api/cross-system/patient/1/insurance

## Development

### Backend Development
```bash
cd healthcare_app/backend
./gradlew bootRun
```

### Frontend Development
```bash
cd healthcare_app/frontend
npm install
npm start
```

## For Use in Custodian

- `base.api.url=http://localhost:8087`
- `compose.service=healthcare-backend`
- `api-spec.yaml=[content of http://localhost:8087/api-docs]`
