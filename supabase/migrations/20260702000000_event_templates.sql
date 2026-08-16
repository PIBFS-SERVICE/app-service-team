create table "public"."event_template_shifts" (
  "id"             uuid not null default gen_random_uuid(),
  "scheduled_time" time not null,
  "sort_order"     integer not null default 0,
  "updated_at"     timestamp with time zone not null default now(),
  "created_at"     timestamp with time zone not null default now()
);

alter table "public"."event_template_shifts" enable row level security;


create table "public"."event_template_sectors" (
  "id"                 uuid not null default gen_random_uuid(),
  "template_shift_id"  uuid not null,
  "sector_id"          uuid not null,
  "created_at"         timestamp with time zone not null default now()
);

alter table "public"."event_template_sectors" enable row level security;


create table "public"."event_template_settings" (
  "id"                  uuid not null default gen_random_uuid(),
  "default_event_name"  text not null default 'Culto de Domingo',
  "updated_at"          timestamp with time zone not null default now(),
  "created_at"          timestamp with time zone not null default now()
);

alter table "public"."event_template_settings" enable row level security;


-- Primary key indexes

CREATE UNIQUE INDEX event_template_shifts_pkey   ON public.event_template_shifts   USING btree (id);
CREATE UNIQUE INDEX event_template_sectors_pkey  ON public.event_template_sectors  USING btree (id);
CREATE UNIQUE INDEX event_template_settings_pkey ON public.event_template_settings USING btree (id);

-- Unique constraint indexes

CREATE UNIQUE INDEX event_template_sectors_shift_sector_key
  ON public.event_template_sectors USING btree (template_shift_id, sector_id);


-- Primary keys

alter table "public"."event_template_shifts"   add constraint "event_template_shifts_pkey"   PRIMARY KEY using index "event_template_shifts_pkey";
alter table "public"."event_template_sectors"  add constraint "event_template_sectors_pkey"  PRIMARY KEY using index "event_template_sectors_pkey";
alter table "public"."event_template_settings" add constraint "event_template_settings_pkey" PRIMARY KEY using index "event_template_settings_pkey";

-- Unique constraints

alter table "public"."event_template_sectors" add constraint "event_template_sectors_shift_sector_key"
  UNIQUE using index "event_template_sectors_shift_sector_key";

-- Foreign keys

alter table "public"."event_template_sectors" add constraint "event_template_sectors_template_shift_id_fkey"
  FOREIGN KEY (template_shift_id) REFERENCES public.event_template_shifts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."event_template_sectors" validate constraint "event_template_sectors_template_shift_id_fkey";

alter table "public"."event_template_sectors" add constraint "event_template_sectors_sector_id_fkey"
  FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."event_template_sectors" validate constraint "event_template_sectors_sector_id_fkey";


-- Grants: event_template_shifts

grant delete on table "public"."event_template_shifts" to "anon";
grant insert on table "public"."event_template_shifts" to "anon";
grant references on table "public"."event_template_shifts" to "anon";
grant select on table "public"."event_template_shifts" to "anon";
grant trigger on table "public"."event_template_shifts" to "anon";
grant truncate on table "public"."event_template_shifts" to "anon";
grant update on table "public"."event_template_shifts" to "anon";
grant delete on table "public"."event_template_shifts" to "authenticated";
grant insert on table "public"."event_template_shifts" to "authenticated";
grant references on table "public"."event_template_shifts" to "authenticated";
grant select on table "public"."event_template_shifts" to "authenticated";
grant trigger on table "public"."event_template_shifts" to "authenticated";
grant truncate on table "public"."event_template_shifts" to "authenticated";
grant update on table "public"."event_template_shifts" to "authenticated";
grant delete on table "public"."event_template_shifts" to "service_role";
grant insert on table "public"."event_template_shifts" to "service_role";
grant references on table "public"."event_template_shifts" to "service_role";
grant select on table "public"."event_template_shifts" to "service_role";
grant trigger on table "public"."event_template_shifts" to "service_role";
grant truncate on table "public"."event_template_shifts" to "service_role";
grant update on table "public"."event_template_shifts" to "service_role";

-- Grants: event_template_sectors

grant delete on table "public"."event_template_sectors" to "anon";
grant insert on table "public"."event_template_sectors" to "anon";
grant references on table "public"."event_template_sectors" to "anon";
grant select on table "public"."event_template_sectors" to "anon";
grant trigger on table "public"."event_template_sectors" to "anon";
grant truncate on table "public"."event_template_sectors" to "anon";
grant update on table "public"."event_template_sectors" to "anon";
grant delete on table "public"."event_template_sectors" to "authenticated";
grant insert on table "public"."event_template_sectors" to "authenticated";
grant references on table "public"."event_template_sectors" to "authenticated";
grant select on table "public"."event_template_sectors" to "authenticated";
grant trigger on table "public"."event_template_sectors" to "authenticated";
grant truncate on table "public"."event_template_sectors" to "authenticated";
grant update on table "public"."event_template_sectors" to "authenticated";
grant delete on table "public"."event_template_sectors" to "service_role";
grant insert on table "public"."event_template_sectors" to "service_role";
grant references on table "public"."event_template_sectors" to "service_role";
grant select on table "public"."event_template_sectors" to "service_role";
grant trigger on table "public"."event_template_sectors" to "service_role";
grant truncate on table "public"."event_template_sectors" to "service_role";
grant update on table "public"."event_template_sectors" to "service_role";

-- Grants: event_template_settings

grant delete on table "public"."event_template_settings" to "anon";
grant insert on table "public"."event_template_settings" to "anon";
grant references on table "public"."event_template_settings" to "anon";
grant select on table "public"."event_template_settings" to "anon";
grant trigger on table "public"."event_template_settings" to "anon";
grant truncate on table "public"."event_template_settings" to "anon";
grant update on table "public"."event_template_settings" to "anon";
grant delete on table "public"."event_template_settings" to "authenticated";
grant insert on table "public"."event_template_settings" to "authenticated";
grant references on table "public"."event_template_settings" to "authenticated";
grant select on table "public"."event_template_settings" to "authenticated";
grant trigger on table "public"."event_template_settings" to "authenticated";
grant truncate on table "public"."event_template_settings" to "authenticated";
grant update on table "public"."event_template_settings" to "authenticated";
grant delete on table "public"."event_template_settings" to "service_role";
grant insert on table "public"."event_template_settings" to "service_role";
grant references on table "public"."event_template_settings" to "service_role";
grant select on table "public"."event_template_settings" to "service_role";
grant trigger on table "public"."event_template_settings" to "service_role";
grant truncate on table "public"."event_template_settings" to "service_role";
grant update on table "public"."event_template_settings" to "service_role";


-- RLS Policies: event_template_shifts

create policy "Enable delete for authenticated users only"
  on "public"."event_template_shifts" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."event_template_shifts" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."event_template_shifts" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."event_template_shifts" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: event_template_sectors

create policy "Enable delete for authenticated users only"
  on "public"."event_template_sectors" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."event_template_sectors" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."event_template_sectors" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."event_template_sectors" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: event_template_settings

create policy "Enable delete for authenticated users only"
  on "public"."event_template_settings" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."event_template_settings" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."event_template_settings" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."event_template_settings" as permissive for update to authenticated using (true) with check (true);
