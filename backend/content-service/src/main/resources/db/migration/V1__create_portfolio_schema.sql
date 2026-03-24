create table if not exists profile (
  id integer primary key,
  name text not null,
  role text not null,
  headline text not null,
  summary text not null,
  location text not null,
  email text not null,
  phone text not null,
  linkedin text not null,
  github text not null,
  cv_url text not null,
  updated_at timestamp without time zone not null default now()
);

create table if not exists stats (
  id bigserial primary key,
  sort_order integer not null,
  label text not null,
  value text not null
);

create table if not exists experience (
  id integer primary key,
  role text not null,
  meta text not null,
  updated_at timestamp without time zone not null default now()
);

create table if not exists experience_bullet (
  id bigserial primary key,
  sort_order integer not null,
  value text not null
);

create table if not exists skill_group (
  id bigserial primary key,
  sort_order integer not null,
  title text not null
);

create table if not exists skill_item (
  id bigserial primary key,
  group_id bigint not null references skill_group(id) on delete cascade,
  sort_order integer not null,
  value text not null
);

create table if not exists project (
  id bigserial primary key,
  sort_order integer not null,
  title text not null,
  tech text not null,
  description text not null,
  url text not null default ''
);

create table if not exists education (
  id bigserial primary key,
  sort_order integer not null,
  title text not null,
  meta text not null,
  detail text not null default ''
);

create table if not exists certification (
  id bigserial primary key,
  sort_order integer not null,
  value text not null
);

create table if not exists profile_detail (
  id bigserial primary key,
  sort_order integer not null,
  value text not null
);

create table if not exists section_title (
  section_key text primary key,
  section_value text not null
);

create table if not exists custom_section (
  id bigserial primary key,
  sort_order integer not null,
  title text not null
);

create table if not exists custom_section_line (
  id bigserial primary key,
  custom_section_id bigint not null references custom_section(id) on delete cascade,
  sort_order integer not null,
  value text not null
);

insert into profile (id, name, role, headline, summary, location, email, phone, linkedin, github, cv_url, updated_at)
values
  (1,
   'Adarsh Malayath',
   'Full Stack Developer',
   'Building secure, scalable products from backend to frontend.',
   'Full stack developer with 2 years 10 months of banking technology experience, delivering backend services, frontend interfaces, and production support using Java, PL/SQL, and ReactJS.',
   'Leicester, United Kingdom',
   'adarshmalayath@gmail.com',
   '+44 7721 445027',
   'https://linkedin.com/in/adarshmalayath',
   'https://github.com/adarshmalayath',
   '/assets/documents/CV%20IT.pdf',
   now())
on conflict (id) do nothing;

insert into stats (sort_order, label, value)
values
  (0, 'Professional full stack development experience', '2+ Years'),
  (1, 'SQL and backend modules delivered', '15+'),
  (2, 'Response time improvement in production', '30%'),
  (3, 'Production incidents resolved within SLA', '98%');

insert into experience (id, role, meta, updated_at)
values
  (1,
   'Full Stack Developer (Channels Applications)',
   'CSB Bank Ltd., Chennai, India | Mar 2023 – Dec 2025',
   now())
on conflict (id) do nothing;

insert into experience_bullet (sort_order, value)
values
  (0, 'Built and optimized backend SQL modules for fraud detection and transaction processing.'),
  (1, 'Supported mobile and net banking migration to OBDX with 95%+ data accuracy.'),
  (2, 'Improved database and query performance, reducing response time by 30%.'),
  (3, 'Handled 98% of L2/L3 production issues within SLA and supported Oracle General Ledger integrations.'),
  (4, 'Delivered features under RBI audit and governance standards.');

insert into skill_group (id, sort_order, title)
values
  (1, 0, 'Languages'),
  (2, 1, 'Web & UI'),
  (3, 2, 'Frameworks'),
  (4, 3, 'Databases'),
  (5, 4, 'Tools'),
  (6, 5, 'Domain Focus')
on conflict (id) do nothing;

insert into skill_item (group_id, sort_order, value)
values
  (1, 0, 'Java'),
  (1, 1, 'Python'),
  (2, 0, 'JavaScript'),
  (2, 1, 'HTML5'),
  (2, 2, 'CSS3'),
  (2, 3, 'Bootstrap'),
  (3, 0, 'ReactJS'),
  (3, 1, 'Spring'),
  (4, 0, 'Oracle'),
  (4, 1, 'SQL Server'),
  (4, 2, 'MySQL'),
  (5, 0, 'Git'),
  (5, 1, 'IntelliJ IDEA'),
  (5, 2, 'VS Code'),
  (5, 3, 'ServiceNow'),
  (5, 4, 'JIRA'),
  (5, 5, 'OBDX'),
  (5, 6, 'Power BI'),
  (5, 7, 'MS Excel'),
  (6, 0, 'Banking Platforms'),
  (6, 1, 'Fraud Risk Management'),
  (6, 2, 'API Integration'),
  (6, 3, 'Compliance');

select setval(pg_get_serial_sequence('skill_group', 'id'), (select coalesce(max(id), 1) from skill_group), true);

insert into project (sort_order, title, tech, description, url)
values
  (0, 'Core Banking Migration Platform', 'PL/SQL, Data Engineering', 'Migrated user data to OBDX with 95%+ accuracy and built control reporting with 6+ bug fixes.', ''),
  (1, 'Banking Services Web App', 'Java, ReactJS, PL/SQL', 'Built a secure full stack banking portal with REST API integration and improved performance by 40%.', 'https://github.com/adarshmalayath/Bank-Website-Project'),
  (2, 'E-Governance System', 'Python, ReactJS, MySQL', 'Automated 80% of operational tasks and implemented secure role-based access control.', 'https://github.com/simatlms5/egovernance'),
  (3, 'Online Job Portal', 'Full Stack Web Application', 'Developed a job portal that supports job posting, search, and application workflows for candidates.', 'https://github.com/adarshmalayath/Online-Job-Portal');

insert into education (sort_order, title, meta, detail)
values
  (0, 'MSc Cloud Computing with Industry', 'University of Leicester | Jan 2026 – Present', ''),
  (1, 'B.Tech in Computer Science & Engineering', 'Sreepathy Institute of Management and Technology | Aug 2018 – Aug 2022', 'CGPA: 8.19 / 10'),
  (2, 'Higher Secondary Education (Plus Two)', 'Government Higher Secondary School Kuttippuram, India | Jul 2016 – Mar 2018', 'Percentage: 85.25%'),
  (3, 'Secondary Education (10th)', 'Technical Higher Secondary School Vattamkulam, India | Jun 2015 – Mar 2016', 'Percentage: 95%');

insert into certification (sort_order, value)
values
  (0, 'Discrete Mathematics — NPTEL, IIT Madras'),
  (1, 'Java Full Stack Developer — NIIT, Chennai'),
  (2, 'Introduction to Analytics & Excel — Coding Ninjas'),
  (3, 'Data Visualization with Power BI — Coding Ninjas'),
  (4, 'SQL for Data Analysis — Coding Ninjas');

insert into profile_detail (sort_order, value)
values
  (0, 'Languages: Malayalam (Native), English (Advanced), Hindi (Intermediate), Tamil (Upper Intermediate)'),
  (1, 'Leadership: IEEE & IEDC Core Member (2018 – 2022)'),
  (2, 'Work Preference: Open to relocation and remote work'),
  (3, 'Eligible to work in the UK');

insert into section_title (section_key, section_value)
values
  ('experience', 'Professional Experience'),
  ('skills', 'Technical Skills'),
  ('projects', 'Selected Projects'),
  ('education', 'Education'),
  ('certifications', 'Certification Highlights'),
  ('profile', 'Additional Details');
