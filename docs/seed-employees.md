# Seed employees — dummy data for empty table

Use this list to seed the in-memory database when the app starts so the Employee Directory is not empty. Data conforms to schema and business rules (unique national ID per country, phone with country code, valid email and dates).

| Name            | National ID   | Title                     | Hire Date   | Country      | Gender | Email                    |
|-----------------|---------------|---------------------------|-------------|--------------|--------|--------------------------|
| Johnathan Doe   | 482-99-1022   | Senior Systems Architect  | 2021-01-12  | United States| Male   | j.doe@hrsystems.com      |
| Alice Smith     | 931-44-8821   | Principal Designer        | 2022-03-22  | United Kingdom | Female | a.smith@hrsystems.com  |
| Robert Chen     | 221-88-3341   | Frontend Lead             | 2023-11-05  | Canada       | Male   | r.chen@hrsystems.com     |
| Maria García    | 556-12-7744   | HR Operations Manager     | 2020-06-15  | Spain        | Female | m.garcia@hrsystems.com   |
| James Okonkwo   | 778-33-0099   | Backend Engineer          | 2022-09-01  | Nigeria      | Male   | j.okonkwo@hrsystems.com  |
| Yuki Tanaka     | 112-67-5543   | Product Manager           | 2021-04-20  | Japan        | Female | y.tanaka@hrsystems.com   |

Phones use country code format (e.g. +1, +44, +81). Dates are ISO 8601 (YYYY-MM-DD). See `frontend/src/lib/seed-employees.ts` for the canonical copy; **`backend/app/seed_data.py`** mirrors it for runtime seeding.

Sample **projects** and **employee–project** links (runtime seed) are documented in [seed-projects.md](./seed-projects.md).
