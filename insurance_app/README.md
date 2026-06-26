# Insurance Management Application

A complete insurance management demo application built with Spring Boot (backend) and React (frontend), demonstrating relational data patterns with policyholders, policies, and claims.

## Overview

This application showcases how to manage insurance data with the following relational structure:
- **Policyholders** → **Policies** → **Claims**
- **Agents** manage policies

The data model mirrors the banking application pattern, adapted for the insurance domain.

## Data Model

### Policyholders (equivalent to Customers)
- Basic information: first name, last name, email, phone, date of birth
- Policyholder types: Individual, Family, Business, Group, Senior
- One-to-many relationship with Policies

### Policies (equivalent to Accounts)
- Linked to Policyholders
- Attributes: policy number, type, status, coverage amount, premium, payment frequency
- Policy types: Auto, Home, Life, Health, Business
- Policy statuses: Active, Expired, Cancelled, Pending, Suspended
- One-to-many relationship with Claims

### Claims (equivalent to Transactions)
- Linked to Policies
- Attributes: claim number, type, status, amounts, dates, description
- Claim types: Accident, Theft, Damage, Medical, Liability
- Claim statuses: Filed, UnderReview, Approved, Denied, Settled, Closed

### Agents
- Insurance agents managing policies
- Attributes: name, email, phone, region, license number
- Many-to-many relationship with Policies

## Cross-System Integration

This application includes cross-system integration with the Healthcare application:
- Patients in the healthcare system can be linked to insurance policies
- Special API endpoints demonstrate cross-database queries
- Endpoints available at `/api/cross-system/*`

### Cross-System API Endpoints

1. **Get healthcare info for a policy**: `GET /api/cross-system/policy/{policyId}/healthcare`
   - Returns all patients linked to a specific insurance policy
   - Shows appointment and prescription counts

2. **Get policies with healthcare links**: `GET /api/cross-system/policies-with-healthcare-links`
   - Returns all policies that have linked healthcare patients
   - Demonstrates referential integrity across systems

## Running the Application

### Using Docker Compose (Recommended)

```bash
# From the repository root
docker compose up insurance
```

**Default URLs:**
- Frontend: http://localhost:3008
- Backend: http://localhost:8086
- Swagger docs: http://localhost:8086/swagger-ui/index.html
- API docs: http://localhost:8086/api-docs

### Port Configuration

| Service   | Description          | Default Port | Environment Variable        |
|-----------|----------------------|--------------|-----------------------------|
| postgres  | PostgreSQL database  | 5439         | INSURANCE_DB_PORT           |
| backend   | Spring Boot backend  | 8086         | INSURANCE_BACKEND_PORT      |
| frontend  | React frontend       | 3008         | INSURANCE_FRONTEND_PORT     |

**Changing Ports:**
```bash
INSURANCE_BACKEND_PORT=8090 INSURANCE_FRONTEND_PORT=3010 INSURANCE_DB_PORT=5441 docker compose up insurance
```

**To see application logs:**
```bash
docker compose up insurance --attach-dependencies
```

### Database Structure

The application uses three PostgreSQL databases:
- `insurance_seed` - Contains seeded demo data
- `insurance_testing` - Testing database with sample data
- `insurance_prod` - Production database (initially empty)

You can switch between databases using the database selector in the UI or via API parameter `?database=TESTING`

## API Documentation

Full API documentation is available via Swagger UI at http://localhost:8086/swagger-ui/index.html

### Main API Endpoints

**Policyholders:**
- `GET /api/policyholders` - List policyholders (with pagination, filtering, sorting)
- `GET /api/policyholders/{id}` - Get policyholder by ID
- `POST /api/policyholders` - Create policyholder
- `DELETE /api/policyholders/{id}` - Delete policyholder

**Policies:**
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy
- `PATCH /api/policies/{id}` - Update policy status
- `DELETE /api/policies/{id}` - Delete policy

**Claims:**
- `GET /api/claims` - List claims
- `POST /api/claims` - Create claim
- `DELETE /api/claims/{id}` - Delete claim

**Agents:**
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `PUT /api/agents/{id}/region` - Update agent region
- `DELETE /api/agents/{id}` - Delete agent

**Statistics:**
- `GET /api/statistics` - Get entity counts
- `GET /api/statistics/policy-status-counts` - Get policy counts by status

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

**Deployment:**
- Docker & Docker Compose
- Nginx (for frontend serving)

## Sample Data

The application includes 20 sample policyholders, 20 policies, 20 claims, and 10 agents with realistic insurance scenarios.

## Development

### Backend Development
```bash
cd insurance_app/backend
./gradlew bootRun
```

### Frontend Development
```bash
cd insurance_app/frontend
npm install
npm start
```

## For Use in Custodian

- `base.api.url=http://localhost:8086`
- `compose.service=insurance-backend`
- `api-spec.yaml=[content of http://localhost:8086/api-docs]`
