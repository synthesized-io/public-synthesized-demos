#!/bin/bash

# Script to install Bank Demo Workflows into create_governor_data.sql
# Checks if workflows are already installed and adds them if not

TARGET_FILE="./initdb/create_governor_data.sql"

# Check if target file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "Error: $TARGET_FILE not found"
    exit 1
fi

# Check if "Bank Demo Workflows" is already present
if grep -q "Bank Demo Workflows" "$TARGET_FILE"; then
    echo "Workflows are already installed."
    exit 0
fi

# Append the workflow data
cat >> "$TARGET_FILE" << 'EOF'

-- -------------------- --
-- Bank Demo Workflows  --
-- -------------------- --

INSERT INTO public."user" VALUES (DEFAULT, 'demo@synthesized.io', '$2a$10$s70PJ7s.oKUCWz3m46cCz.0dBDEC/20BST1lZ3Eq3v8Q9OLdukuR.', true, 'Synthesized Demo', 'user', 'OWNER', false, 'INTERNAL', 'demo@synthesized.io');
INSERT INTO public."project" VALUES ('01972fa4-1fe0-7395-b7ab-00b9189a9cc1', 'Bank', null, 'PRIVATE', '2025-10-13 12:00:00.000000', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'));
INSERT INTO public."project_member" VALUES ('01972fa6-9990-7054-0033-7e09f453a085', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1', 'demo@synthesized.io', 'OWNER');

SELECT pg_catalog.setval('public.user_id_seq', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), true);

INSERT INTO public.database_connection VALUES (DEFAULT, 'POSTGRES', NULL, NULL, 'apiuser', 'NOO9ZHI45HhaHBoLwMNkTw==', 'Bank Seed', 'jdbc:postgresql://host.docker.internal:5438/bank_seed', 'CREDENTIALS', 'PRIVATE', 1, '2022-12-29 14:42:37.177302', '2022-12-29 14:42:37.177321', 'READ_ONLY', '\x2499b374f7f85719b43bbbb8b4b2e5de', NULL, NULL, NULL, NULL, 20);
INSERT INTO public.database_connection VALUES (DEFAULT, 'POSTGRES', NULL, NULL, 'apiuser', 'eyxyfmqbHHYlH0NZZ/6Gew==', 'Bank Init Writer', 'jdbc:postgresql://host.docker.internal:5438/bank_prod', 'CREDENTIALS', 'PRIVATE', 1, '2022-12-29 14:42:54.435254', '2022-12-29 14:42:59.918208', 'READ_AND_WRITE', '\xc468edd2487c4a2a5201aedd16c0205e', NULL, NULL, NULL, NULL, 20);
INSERT INTO public.database_connection VALUES (DEFAULT, 'POSTGRES', NULL, NULL, 'apiuser', 'NOO9ZHI45HhaHBoLwMNkTw==', 'Bank Prod', 'jdbc:postgresql://host.docker.internal:5438/bank_prod', 'CREDENTIALS', 'PRIVATE', 1, '2022-12-29 14:42:37.177302', '2022-12-29 14:42:37.177321', 'READ_ONLY', '\x2499b374f7f85719b43bbbb8b4b2e5de', NULL, NULL, NULL, NULL, 20);
INSERT INTO public.database_connection VALUES (DEFAULT, 'POSTGRES', NULL, NULL, 'apiuser', 'eyxyfmqbHHYlH0NZZ/6Gew==', 'Bank Testing', 'jdbc:postgresql://host.docker.internal:5438/bank_testing', 'CREDENTIALS', 'PRIVATE', 1, '2022-12-29 14:42:54.435254', '2022-12-29 14:42:59.918208', 'READ_AND_WRITE', '\xc468edd2487c4a2a5201aedd16c0205e', NULL, NULL, NULL, NULL, 20);

SELECT pg_catalog.setval('public.database_connection_id_seq', (SELECT MAX(id) FROM public.database_connection), true);

INSERT INTO public.project_database_connection VALUES ('01971b54-55c6-72e2-bc90-004992c619d5', (SELECT id FROM public.database_connection WHERE name = 'Bank Seed'),'01972fa4-1fe0-7395-b7ab-00b9189a9cc1', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), '2025-05-29 14:42:54.435254');
INSERT INTO public.project_database_connection VALUES ('01971b54-55c6-72e2-bc90-00540e10af87', (SELECT id FROM public.database_connection WHERE name = 'Bank Init Writer'),'01972fa4-1fe0-7395-b7ab-00b9189a9cc1', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), '2025-05-29 14:42:54.435254');
INSERT INTO public.project_database_connection VALUES ('01971b54-55c6-72e2-bc90-004992c619d6', (SELECT id FROM public.database_connection WHERE name = 'Bank Prod'),'01972fa4-1fe0-7395-b7ab-00b9189a9cc1', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), '2025-05-29 14:42:54.435254');
INSERT INTO public.project_database_connection VALUES ('01971b54-55c6-72e2-bc90-00540e10af88', (SELECT id FROM public.database_connection WHERE name = 'Bank Testing'),'01972fa4-1fe0-7395-b7ab-00b9189a9cc1', (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), '2025-05-29 14:42:54.435254');

INSERT INTO public.workflow VALUES (DEFAULT, 'Bank Reset', '2023-06-09 14:53:30.103527', '2023-06-09 14:55:53.617641', (SELECT id FROM public.database_connection WHERE name = 'Bank Prod'), (SELECT id FROM public.database_connection WHERE name = 'Bank Testing'), (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), 'default_config:
  mode: KEEP
  target_ratio: 0

schema_creation_mode: DROP_AND_CREATE
safety_mode: RELAXED', 'INTERNAL', NULL, NULL, NULL, NULL, 20, 20, 'PRIVATE', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1');

INSERT INTO public.workflow VALUES (DEFAULT, 'Bank Prod Initialiser', '2023-06-09 14:53:30.103527', '2023-06-09 14:55:53.617641', (SELECT id FROM public.database_connection WHERE name = 'Bank Seed'), (SELECT id FROM public.database_connection WHERE name = 'Bank Init Writer'), (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), 'default_config:
  use_working_directory: true
  locale: en-GB
  mode: GENERATION
  
tables:
  - table_name_with_schema: bank.accounts
    target_row_number: 400
    transformations:
      - columns:
           - status
        params:
          type: categorical_generator
          categories:
            value_source: PROVIDED
            values:
              Frozen: 0.1
              Active: 0.65
              Overdrawn: 0.05
              Dormant: 0.05
              Closed: 0.2
  - table_name_with_schema: bank.branches
    mode: KEEP
    target_ratio: 1
  - table_name_with_schema: bank.customers
    target_row_number: 100
    transformations:
      - columns:
        - first_name
        - last_name
        - email
        - phone
        params:
          type: person_generator
          column_templates:
            - "${first_name}"
            - "${last_name}"
            - "${email}"
            - "${phone_national}"
  - table_name_with_schema: bank.transactions
    target_row_number: 5000
    transformations:
      - columns:
          - transaction_type
          - channel
        params:
          type: categorical_generator
      - columns:
          - amount
        params:
          type: conditional_generator
          conditional_column: transaction_type
          conditional_value: Fee
          if_true:
            type: continuous_generator
            max: 0
            mean: -100.00
            min: -1000.00
            std: 100.00
            numeric_type: DOUBLE
          if_false:
            type: conditional_generator
            conditional_column: transaction_type
            conditional_value: Withdrawal
            if_true:
              type: continuous_generator
              max: 0
              mean: -200.00
              min: -10000.00
              std: 500.00
              numeric_type: DOUBLE
            if_false:           
              type: conditional_generator
              conditional_column: transaction_type
              conditional_value: Transfer
              if_true:
                type: continuous_generator
                min: -10000
                mean: 0
                max: 100000
                std: 10000.00
                numeric_type: DOUBLE
              if_false:
                type: continuous_generator            
                min: 0
                mean: 1000
                max: 100000.00
                std: 10000.00
                numeric_type: DOUBLE
  - table_name_with_schema: bank.transaction_metadata
    target_row_number: 5000
    transformations:
      - columns:
        - transaction_id
        params:
          type: int_sequence_generator
          start_from: 0
      - columns:
          - channel_details
          - device_type
          - auth_method
        params:
          type: categorical_generator
      - columns:
          - location
        params:
          type: address_generator
          column_templates:
            - "${city}"
cycle_resolution_strategy: "FAIL"
schema_creation_mode: DROP_AND_CREATE
table_truncation_mode: TRUNCATE
safety_mode: "RELAXED"
use_text_column_heuristics: true

global_seed: "somethingDifferent"', 'INTERNAL', NULL, NULL, NULL, NULL, 20, 20, 'PRIVATE', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1');

INSERT INTO public.workflow VALUES (DEFAULT, 'Bank Generation', '2023-06-09 14:53:30.103527', '2023-06-09 14:55:53.617641', (SELECT id FROM public.database_connection WHERE name = 'Bank Prod'), (SELECT id FROM public.database_connection WHERE name = 'Bank Testing'), (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), 'default_config:
  use_working_directory: true
  locale: en-GB
  mode: GENERATION
  target_ratio: 5
  
tables:
  - table_name_with_schema: bank.accounts
    target_row_number: 1000
    transformations:
      - columns:
           - status
        params:
          type: categorical_generator
  - table_name_with_schema: bank.branches
    mode: KEEP
    target_ratio: 1
  - table_name_with_schema: bank.customers
    transformations:
      - columns:
        - first_name
        - last_name
        - email
        - phone
        params:
          type: person_generator
          column_templates:
            - "${first_name}"
            - "${last_name}"
            - "${email}"
            - "${phone_national}"
  - table_name_with_schema: bank.transactions
    transformations:
      - columns:
          - transaction_type
          - channel
        params:
          type: categorical_generator
      - columns:
          - amount
        params:
          type: conditional_generator
          conditional_column: transaction_type
          conditional_value: Fee
          if_true:
            type: continuous_generator
            max: 0
            mean: -100.00
            min: -1000.00
            std: 100.00
            numeric_type: DOUBLE
          if_false:
            type: conditional_generator
            conditional_column: transaction_type
            conditional_value: Withdrawal
            if_true:
              type: continuous_generator
              max: 0
              mean: -200.00
              min: -10000.00
              std: 500.00
              numeric_type: DOUBLE
            if_false:           
              type: conditional_generator
              conditional_column: transaction_type
              conditional_value: Transfer
              if_true:
                type: continuous_generator
                min: -10000
                mean: 0
                max: 100000
                std: 10000.00
                numeric_type: DOUBLE
              if_false:
                type: continuous_generator            
                min: 0
                mean: 1000
                max: 100000.00
                std: 10000.00
                numeric_type: DOUBLE
  - table_name_with_schema: bank.transaction_metadata
    transformations:
      - columns:
        - transaction_id
        params:
          type: int_sequence_generator
          start_from: 0
      - columns:
          - channel_details
          - device_type
          - auth_method
        params:
          type: categorical_generator
      - columns:
          - location
        params:
          type: address_generator
          column_templates:
            - "${city}"
cycle_resolution_strategy: "FAIL"
schema_creation_mode: DROP_AND_CREATE
table_truncation_mode: TRUNCATE
safety_mode: "RELAXED"
use_text_column_heuristics: true', 'INTERNAL', NULL, NULL, NULL, NULL, 20, 20, 'PRIVATE', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1');

INSERT INTO public.workflow VALUES (DEFAULT, 'Bank Auto-masking', '2023-06-09 14:53:30.103527', '2023-06-09 14:55:53.617641', (SELECT id FROM public.database_connection WHERE name = 'Bank Prod'), (SELECT id FROM public.database_connection WHERE name = 'Bank Testing'), (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), 'default_config:
  mode: "KEEP"
  use_working_directory: true
  locale: "en-GB"
  target_ratio: 1
  
cycle_resolution_strategy: "FAIL"
schema_creation_mode: DROP_AND_CREATE
table_truncation_mode: "TRUNCATE"
safety_mode: "STRICT"
use_text_column_heuristics: true

tables:
- table_name_with_schema: "bank.branches"
  transformations:
  - columns:
    - "manager_name"
    id: "pii-bank-branches-manager_name"
    mode: "MASKING"
  - columns:
    - "name"
    id: "pii-bank-branches-name"
    mode: "MASKING"
- table_name_with_schema: "bank.customers"
  transformations:
  - columns:
    - "first_name"
    id: "pii-bank-customers-first_name"
    mode: "MASKING"
  - columns:
    - "last_name"
    id: "pii-bank-customers-last_name"
    mode: "MASKING"
  - columns:
    - "email"
    id: "pii-bank-customers-email"
    mode: "MASKING"
  - columns:
    - "phone"
    id: "pii-bank-customers-phone"
    mode: "MASKING"
- table_name_with_schema: "bank.transaction_metadata"
  transformations:
  - columns:
    - "location"
    id: "pii-bank-transaction_metadata-location"
    mode: "MASKING"', 'INTERNAL', NULL, NULL, NULL, NULL, 20, 20, 'PRIVATE', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1');

INSERT INTO public.workflow VALUES (DEFAULT, 'Bank Masking', '2023-06-09 14:53:30.103527', '2023-06-09 14:55:53.617641', (SELECT id FROM public.database_connection WHERE name = 'Bank Prod'), (SELECT id FROM public.database_connection WHERE name = 'Bank Testing'), (SELECT id FROM public."user" WHERE email = 'demo@synthesized.io'), 'default_config:
  mode: "KEEP"
  use_working_directory: true
  locale: "en-GB"
  target_ratio: 1
  
tables:
- table_name_with_schema: "bank.branches"
  transformations:
  - columns:
    - "name"
    id: "pii-bank-branches-name"
    mode: "MASKING"
- table_name_with_schema: "bank.customers"
  transformations:
  - columns:
    - "first_name"
    - "last_name"    
    - "email"
    - "phone"
    mode: "MASKING"
    params:
      type: person_generator
      column_templates:
        - "${first_name}"
        - "${last_name}"
        - "${email}"
        - "${phone_national}"
  - columns:
    - "customer_type"
    id: "pii-bank-customers-customer_type"
    mode: "MASKING"
- table_name_with_schema: "bank.transaction_metadata"
  transformations:
  - columns:
    - "location"
    id: "pii-bank-transaction_metadata-location"
    mode: "MASKING"
  
cycle_resolution_strategy: "FAIL"
schema_creation_mode: "DROP_AND_CREATE"
table_truncation_mode: "TRUNCATE"
safety_mode: "RELAXED"
use_text_column_heuristics: true', 'INTERNAL', NULL, NULL, NULL, NULL, 20, 20, 'PRIVATE', '01972fa4-1fe0-7395-b7ab-00b9189a9cc1');

SELECT pg_catalog.setval('public.workflow_id_seq', (SELECT MAX(id) FROM public.workflow), true);
EOF

echo "Bank Demo Workflows installed successfully."
