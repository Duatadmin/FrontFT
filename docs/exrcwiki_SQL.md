| column             | type                     | nullable | default |
| ------------------ | ------------------------ | -------- | ------- |
| exercise_id        | text                     | NO       | null    |
| name               | text                     | NO       | null    |
| bodypart           | text                     | YES      | null    |
| equipment          | text                     | NO       | null    |
| gifurl             | text                     | YES      | null    |
| target             | text                     | NO       | null    |
| muscle_group       | text                     | YES      | null    |
| secondarymuscles   | jsonb                    | YES      | null    |
| instructions       | jsonb                    | YES      | null    |
| tier               | text                     | YES      | null    |
| tips               | jsonb                    | YES      | null    |
| pros               | jsonb                    | YES      | null    |
| cons               | jsonb                    | YES      | null    |
| key_muscles        | jsonb                    | YES      | null    |
| final_comment      | text                     | YES      | null    |
| glute_region       | jsonb                    | YES      | null    |
| created_at         | timestamp with time zone | YES      | now()   |
| updated_at         | timestamp with time zone | YES      | now()   |
| maintarget         | text                     | YES      | null    |
| secondarytarget    | text                     | YES      | null    |
| is_compound        | boolean                  | YES      | false   |
| compound           | boolean                  | YES      | null    |
| isolation          | boolean                  | YES      | null    |
| embedding          | USER-DEFINED             | YES      | null    |
| equipment_category | text                     | YES      | null    |