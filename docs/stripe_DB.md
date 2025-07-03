stripe_customers

| column_name        | data_type                | is_nullable |
| ------------------ | ------------------------ | ----------- |
| user_id            | uuid                     | NO          |
| billing_address    | jsonb                    | YES         |
| default_pm         | jsonb                    | YES         |
| created_at         | timestamp with time zone | YES         |
| stripe_customer_id | text                     | YES         |

stripe_subscriptions

| column_name          | data_type                | is_nullable |
| -------------------- | ------------------------ | ----------- |
| trial_end            | timestamp with time zone | YES         |
| user_id              | uuid                     | YES         |
| status               | USER-DEFINED             | YES         |
| metadata             | jsonb                    | YES         |
| canceled_at          | timestamp with time zone | YES         |
| trial_start          | timestamp with time zone | YES         |
| quantity             | integer                  | YES         |
| cancel_at_period_end | boolean                  | YES         |
| created              | timestamp with time zone | NO          |
| current_period_start | timestamp with time zone | NO          |
| current_period_end   | timestamp with time zone | NO          |
| ended_at             | timestamp with time zone | YES         |
| cancel_at            | timestamp with time zone | YES         |
| price_id             | text                     | YES         |
| id                   | text                     | NO          |

stripe_products

| Column      | type    |
| ----------- | ------- |
| id          | text    |
| active      | boolean |
| name        | text    |
| description | text    |
| image       | text    |
| metadata    | jsonb   |

stripe_prices

| Column            | type         |
| ----------------- | ------------ |
| id                | text         |
| product_id        | text         |
| active            | boolean      |
| description       | text         |
| unit_amount       | bigint       |
| currency          | text         |
| type              | USER-DEFINED |
| interval          | USER-DEFINED |
| interval_count    | integer      |
| trial_period_days | integer      |
| metadata          | jsonb        |
