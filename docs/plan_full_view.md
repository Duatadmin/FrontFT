# WORKOUT\_FULL\_VIEW – спецификация колонок

> Документ предназначен для фронтенд‑команды **Isinka**. Ниже приведён полный перечень колонок представления `workout_full_view` в Supabase (PostgreSQL) и рекомендации по их использованию.

---

## Актуальный SQL‑сниппет

```sql
-- CASE‑insensitive запрос метаданных представления
SELECT
    column_name     AS column,
    data_type       AS type,
    is_nullable     AS nullable,
    column_default  AS default
FROM information_schema.columns
WHERE lower(table_name) = lower('WORKOUT_FULL_VIEW')
  AND table_schema = 'public' -- скорректируйте при необходимости
ORDER BY ordinal_position;
```

---

## Справочник колонок

| Column              | Type        | Nullable | Default |
| ------------------- | ----------- | -------- | ------- |
| plan\_id            | uuid        | YES      |         |
| user\_id            | uuid        | YES      |         |
| split\_type         | text        | YES      |         |
| goal                | text        | YES      |         |
| level               | text        | YES      |         |
| plan\_status        | text        | YES      |         |
| week\_start         | date        | YES      |         |
| week\_id            | uuid        | YES      |         |
| week\_number        | integer     | YES      |         |
| week\_start\_date   | date        | YES      |         |
| session\_id         | uuid        | YES      |         |
| day\_label          | text        | YES      |         |
| session\_date       | date        | YES      |         |
| day\_of\_week       | text        | YES      |         |
| focus\_area         | text        | YES      |         |
| session\_number     | integer     | YES      |         |
| overall\_difficulty | integer     | YES      |         |
| duration\_minutes   | integer     | YES      |         |
| session\_completed  | boolean     | YES      |         |
| session\_state      | jsonb       | YES      |         |
| exercise\_row\_id   | uuid        | YES      |         |
| exercise\_id        | text        | YES      |         |
| exercise\_name      | text        | YES      |         |
| muscle\_group       | text        | YES      |         |
| sets\_planned       | integer     | YES      |         |
| rep\_scheme         | text        | YES      |         |
| rir                 | integer     | YES      |         |
| equipment           | text        | YES      |         |
| tier                | text        | YES      |         |
| order\_in\_session  | integer     | YES      |         |
| set\_id             | uuid        | YES      |         |
| set\_no             | smallint    | YES      |         |
| reps\_done          | smallint    | YES      |         |
| weight\_kg          | real        | YES      |         |
| rpe                 | smallint    | YES      |         |
| recorded\_at        | timestamptz | YES      |         |

---

## Логическая группировка

* **План**: `plan_id`, `user_id`, `split_type`, `goal`, `level`, `plan_status`
* **Неделя**: `week_id`, `week_number`, `week_start`, `week_start_date`
* **Сессия**: `session_id`, `day_label`, `day_of_week`, `session_date`, `session_number`, `focus_area`, `overall_difficulty`, `duration_minutes`, `session_completed`, `session_state`
* **Упражнение**: `exercise_row_id`, `exercise_id`, `exercise_name`, `muscle_group`, `sets_planned`, `rep_scheme`, `rir`, `equipment`, `tier`, `order_in_session`
* **Сет**: `set_id`, `set_no`, `reps_done`, `weight_kg`, `rpe`, `recorded_at`

---

## Полезные заметки для фронтенда

1. **Ключи**
   `plan_id`, `week_id`, `session_id`, `exercise_row_id`, `set_id` — UUID, с их помощью можно строить дерево «план → неделя → сессия → упражнение → сет».
2. **Состояние сессии**
   `session_state` хранится в формате JSONB и со временем может расширяться. Используйте тип‑сейф парсинг на клиенте.
3. **Дата vs номер недели/сессии**
   Для сортировки по хронологии надёжнее использовать `week_start_date` + `session_date`. Номера удобны для UI‑отображения.
4. **Пустые значения**
   Все колонки nullable: проверяйте наличие данных, особенно для исторических записей или черновиков.
5. **Единицы измерения**
   `weight_kg` всегда в килограммах. Если нужен перевод в фунты — делайте на клиенте (1 кг ≈ 2.20462 lbs).

---

Если нужно подробнее описать конкретные поля или привести примеры GraphQL/REST‑запросов — дайте знать, добавим.
