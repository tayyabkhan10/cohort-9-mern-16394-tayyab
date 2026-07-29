create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  email varchar(150) unique not null,
  password_hash text not null,
  created_at timestamp default now()
);

create table folders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name varchar(100) not null,
  created_at timestamp default now()
);

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  folder_id uuid references folders(id) on delete set null,
  title varchar(255) not null,
  content text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_notes_user_id on notes(user_id);
create index idx_notes_folder_id on notes(folder_id);
create index idx_folders_user_id on folders(user_id);
create index idx_notes_title on notes using gin (to_tsvector('english', title));