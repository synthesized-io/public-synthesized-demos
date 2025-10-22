# Synthesized Public Examples

## Project Overview

This repository contains sample applications that can be used to demonstrate and test the power of the [Synthesized TDK](https://docs.synthesized.io/tdk/latest/).

Each application follows the same pattern:
1. A docker deployment for the application
2. A database service with separate databases for:
   1. Seed - A small amount of sample data used for data generation
   2. Prod - The example production database
   3. Testing - The example test database, empty by default
3. Example Synthesized config scripts to generate and mask the data
4. A script to setup the workflows for a demo user within Synthesized's TDK Governor

## Prerequisites

1. Docker and Docker Compose
2. A clone of this repository

## Launching Applications
All sample applications are launched using docker, using the name of the application.

```bash
docker compose up APPLICATION_NAME
```

Running this will create a docker network for the application, including a frontend, backend, and database.

Note that ```docker compose build``` is only necessary for the first run of an application, or when changing the ports.

## Changing Application Ports
Each application has separate default ports for the components. These can be configured within a `.env` file or by supplying new ports as arguments. 

Before launching the service with new ports, the system must be rebuilt to ensure the frontend calls the correct url. E.g.

```bash
BANK_BACKEND_PORT=8090 BANK_FRONTEND_PORT=3010 BANK_DB_PORT=5440 docker compose build bank
BANK_BACKEND_PORT=8090 BANK_FRONTEND_PORT=3010 BANK_DB_PORT=5440 docker compose up bank
```

If the system is still looking for the default ports, the frontend may need to be built with the new ports. 
Please check that you have used `docker compose build`.

## Configuring Synthesized for Sample Applications
All applications come with predefined sample workflow configurations for Synthesized and an install script to prepare the Synthesized Governor system.

Workflows can be manually set up using the provided configurations, or automatically set up within Governor using an initialisation script.

Scripts must be installed before initialising the Governor database. To install a script within Governor:
1. Unzip the Governor zip file
2. Copy the appropriate `APPLICATION/synthesized/install_APPLICATION_workflows.sh` script into the Governor folder, alongside `docker-compose.yaml`.
3. Execute the script. This will alter Governor's database initialisation scripts. E.g. 
```bash
sh install_bank_workflows.sh
```
4. Pull Governor
```bash
docker compose pull
```
5. Launch Governor
```bash
docker compose up
```
6. Log in as the demo user
```
username: demo@synthesized.io
password: Qq12345_
```

Please note that the initialisation script is added to the Governor database intialisation scripts. If the Governor service has already been launched, the database will already exist and the workflows will not be added. If so, add the configuration manually, or remove the Governor database volume to clear out all existing workflows in Governor. 

## Applications

### Sample Bank App

```bash
docker compose up bank
```

#### Bank Default URLs:
1. Frontend: http://localhost:3005
2. Backend: http://localhost:8085
3. Api docs: http://localhost:8085/api-docs

#### Bank Services:
| Service   | Description          | Default Port | Environment Variable to Change Port |
|-----------|----------------------|--------------|-------------------------------------|
| bank-postgres  | PostgreSQL database  | 5438         | BANK_DB_PORT                        |
| bank-backend   | Spring Boot backend  | 8085         | BANK_BACKEND_PORT                   |
| bank-frontend  | React frontend       | 3005         | BANK_FRONTEND_PORT                  |
| bank      | Main orchestrator    | N/A          | N/A                                 |

#### Changing Bank Ports:
```bash
BANK_BACKEND_PORT=8090 BANK_FRONTEND_PORT=3010 BANK_DB_PORT=5440 docker compose build bank
BANK_BACKEND_PORT=8090 BANK_FRONTEND_PORT=3010 BANK_DB_PORT=5440 docker compose up bank
```

#### Bank Synthesized Configuration

Install script: `bank_app/synthesized/install_bank_workflows.sh`

Configuration files can be found at `bank_app/synthesized/yaml`.

| Workflow               | Source | Target  | Description                                                                                                         |
|------------------------|--------|---------|---------------------------------------------------------------------------------------------------------------------|
| reset.yaml             | Prod   | Testing | A simple workflow that removes all data from testing                                                                |
| seed_bank_db.yaml      | Seed   | Prod    | A generation workflow that uses limited data to generate the initial production data.                               |
| generate_mode.yaml     | Prod   | Testing | A generation workflow showing how production data and configuration can be used to populate a test environment      |
| auto_masking_mode.yaml | Prod   | Testing | A masking workflow showing how the PII scanner can be used to automatically configure a masking workflow            |
| masking_mode.yaml      | Prod   | Testing | A masking workflow that has been configured to replace sensitive data with realistic values instead of scrubbing it |

## Common Commands

```bash
docker compose logs -f [service-name]  # View logs for specific service
docker compose up [app] --attach-dependencies  # Start app with logs
docker compose down                    # Stop services
docker compose down -v                 # Reset data
```