/**
 * Dummy employees to seed the database when the table is empty on start.
 * All records satisfy business rules: unique (nationalId, country), phone with country code, valid email/dates.
 */

export interface SeedEmployee {
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  officialTitle: string;
  hireDate: string;
}

export const SEED_EMPLOYEES: SeedEmployee[] = [
  {
    name: "Johnathan Doe",
    email: "j.doe@hrsystems.com",
    nationalId: "482-99-1022",
    phone: "+1 555-201-3344",
    country: "United States",
    gender: "Male",
    dateOfBirth: "1985-03-14",
    officialTitle: "Senior Systems Architect",
    hireDate: "2021-01-12",
  },
  {
    name: "Alice Smith",
    email: "a.smith@hrsystems.com",
    nationalId: "931-44-8821",
    phone: "+44 20 7946 0958",
    country: "United Kingdom",
    gender: "Female",
    dateOfBirth: "1990-07-22",
    officialTitle: "Principal Designer",
    hireDate: "2022-03-22",
  },
  {
    name: "Robert Chen",
    email: "r.chen@hrsystems.com",
    nationalId: "221-88-3341",
    phone: "+1 416-555-0192",
    country: "Canada",
    gender: "Male",
    dateOfBirth: "1988-11-05",
    officialTitle: "Frontend Lead",
    hireDate: "2023-11-05",
  },
  {
    name: "Maria García",
    email: "m.garcia@hrsystems.com",
    nationalId: "556-12-7744",
    phone: "+34 912 345 678",
    country: "Spain",
    gender: "Female",
    dateOfBirth: "1982-06-15",
    officialTitle: "HR Operations Manager",
    hireDate: "2020-06-15",
  },
  {
    name: "James Okonkwo",
    email: "j.okonkwo@hrsystems.com",
    nationalId: "778-33-0099",
    phone: "+234 801 234 5678",
    country: "Nigeria",
    gender: "Male",
    dateOfBirth: "1992-09-01",
    officialTitle: "Backend Engineer",
    hireDate: "2022-09-01",
  },
  {
    name: "Yuki Tanaka",
    email: "y.tanaka@hrsystems.com",
    nationalId: "112-67-5543",
    phone: "+81 3-1234-5678",
    country: "Japan",
    gender: "Female",
    dateOfBirth: "1991-04-20",
    officialTitle: "Product Manager",
    hireDate: "2021-04-20",
  },
];
