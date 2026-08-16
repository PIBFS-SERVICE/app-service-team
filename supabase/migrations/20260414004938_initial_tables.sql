drop extension if exists "pg_net";

create type "public"."volunteer_sector_proficiency_status" as enum ('apprentice', 'knowledgeable', 'master');


create table "public"."volunteers" (
  "id"                   uuid not null default gen_random_uuid(),
  "name"                 text not null,
  "nickname"             text,
  "ministry_entry_date"  date not null default now(),
  "contact_phone"        character varying,
  "avatar_url"           text,
  "updated_at"           timestamp with time zone not null default now(),
  "created_at"           timestamp with time zone not null default now()
);

alter table "public"."volunteers" enable row level security;


create table "public"."sectors" (
  "id"                      uuid not null default gen_random_uuid(),
  "name"                    text not null,
  "slug"                    text not null,
  "url_icon"                text,
  "url_icon_apprentice"     text,
  "url_icon_knowledgeable"  text,
  "url_icon_master"         text
);

alter table "public"."sectors" enable row level security;


create table "public"."volunteer_sectors" (
  "id"                 uuid not null default gen_random_uuid(),
  "volunteer_id"       uuid not null,
  "sector_id"          uuid not null,
  "is_active_in_sector"    boolean not null default false,
  "proficiency_status" public.volunteer_sector_proficiency_status not null default 'apprentice'::public.volunteer_sector_proficiency_status,
  "created_at"         timestamp with time zone not null default now()
);

alter table "public"."volunteer_sectors" enable row level security;


create table "public"."event" (
  "id"         uuid not null default gen_random_uuid(),
  "name"       text not null,
  "date"       date not null default now(),
  "type"       text not null default 'culto',
  "updated_at" timestamp with time zone not null default now(),
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."event" enable row level security;


create table "public"."shifts" (
  "id"             uuid not null default gen_random_uuid(),
  "event_id"       uuid not null,
  "lider_id"       uuid,
  "scheduled_time" time not null,
  "updated_at"     timestamp with time zone not null default now(),
  "created_at"     timestamp with time zone not null default now()
);

alter table "public"."shifts" enable row level security;


create table "public"."scales" (
  "id"           uuid not null default gen_random_uuid(),
  "shift_id"     uuid not null,
  "volunteer_id" uuid not null,
  "sector_id"    uuid not null,
  "updated_at"   timestamp with time zone not null default now(),
  "created_at"   timestamp with time zone not null default now()
);

alter table "public"."scales" enable row level security;


-- Primary key indexes

CREATE UNIQUE INDEX event_pkey              ON public.event            USING btree (id);
CREATE UNIQUE INDEX scales_pkey             ON public.scales           USING btree (id);
CREATE UNIQUE INDEX sectors_pkey            ON public.sectors          USING btree (id);
CREATE UNIQUE INDEX shifts_pkey             ON public.shifts           USING btree (id);
CREATE UNIQUE INDEX volunteer_sectors_pkey  ON public.volunteer_sectors USING btree (id);
CREATE UNIQUE INDEX volunteers_pkey         ON public.volunteers       USING btree (id);

-- Unique constraint indexes

CREATE UNIQUE INDEX sectors_name_key                      ON public.sectors           USING btree (name);
CREATE UNIQUE INDEX sectors_slug_key                      ON public.sectors           USING btree (slug);
CREATE UNIQUE INDEX volunteer_sectors_volunteer_sector_key ON public.volunteer_sectors USING btree (volunteer_id, sector_id);


-- Primary keys

alter table "public"."event"             add constraint "event_pkey"             PRIMARY KEY using index "event_pkey";
alter table "public"."scales"            add constraint "scales_pkey"            PRIMARY KEY using index "scales_pkey";
alter table "public"."sectors"           add constraint "sectors_pkey"           PRIMARY KEY using index "sectors_pkey";
alter table "public"."shifts"            add constraint "shifts_pkey"            PRIMARY KEY using index "shifts_pkey";
alter table "public"."volunteer_sectors" add constraint "volunteer_sectors_pkey" PRIMARY KEY using index "volunteer_sectors_pkey";
alter table "public"."volunteers"        add constraint "volunteers_pkey"        PRIMARY KEY using index "volunteers_pkey";

-- Unique constraints

alter table "public"."sectors"           add constraint "sectors_name_key"                       UNIQUE using index "sectors_name_key";
alter table "public"."sectors"           add constraint "sectors_slug_key"                       UNIQUE using index "sectors_slug_key";
alter table "public"."volunteer_sectors" add constraint "volunteer_sectors_volunteer_sector_key" UNIQUE using index "volunteer_sectors_volunteer_sector_key";

-- Foreign keys

alter table "public"."shifts" add constraint "shifts_event_id_fkey"
  FOREIGN KEY (event_id) REFERENCES public.event(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."shifts" validate constraint "shifts_event_id_fkey";

alter table "public"."shifts" add constraint "shifts_lider_id_fkey"
  FOREIGN KEY (lider_id) REFERENCES public.volunteers(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;
alter table "public"."shifts" validate constraint "shifts_lider_id_fkey";

alter table "public"."scales" add constraint "scales_shift_id_fkey"
  FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."scales" validate constraint "scales_shift_id_fkey";

alter table "public"."scales" add constraint "scales_volunteer_id_fkey"
  FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;
alter table "public"."scales" validate constraint "scales_volunteer_id_fkey";

alter table "public"."scales" add constraint "scales_sector_id_fkey"
  FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;
alter table "public"."scales" validate constraint "scales_sector_id_fkey";

alter table "public"."volunteer_sectors" add constraint "volunteer_sectors_volunteer_id_fkey"
  FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."volunteer_sectors" validate constraint "volunteer_sectors_volunteer_id_fkey";

alter table "public"."volunteer_sectors" add constraint "volunteer_sectors_sector_id_fkey"
  FOREIGN KEY (sector_id) REFERENCES public.sectors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."volunteer_sectors" validate constraint "volunteer_sectors_sector_id_fkey";


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;


-- Grants: event

grant delete on table "public"."event" to "anon";
grant insert on table "public"."event" to "anon";
grant references on table "public"."event" to "anon";
grant select on table "public"."event" to "anon";
grant trigger on table "public"."event" to "anon";
grant truncate on table "public"."event" to "anon";
grant update on table "public"."event" to "anon";
grant delete on table "public"."event" to "authenticated";
grant insert on table "public"."event" to "authenticated";
grant references on table "public"."event" to "authenticated";
grant select on table "public"."event" to "authenticated";
grant trigger on table "public"."event" to "authenticated";
grant truncate on table "public"."event" to "authenticated";
grant update on table "public"."event" to "authenticated";
grant delete on table "public"."event" to "service_role";
grant insert on table "public"."event" to "service_role";
grant references on table "public"."event" to "service_role";
grant select on table "public"."event" to "service_role";
grant trigger on table "public"."event" to "service_role";
grant truncate on table "public"."event" to "service_role";
grant update on table "public"."event" to "service_role";

-- Grants: scales

grant delete on table "public"."scales" to "anon";
grant insert on table "public"."scales" to "anon";
grant references on table "public"."scales" to "anon";
grant select on table "public"."scales" to "anon";
grant trigger on table "public"."scales" to "anon";
grant truncate on table "public"."scales" to "anon";
grant update on table "public"."scales" to "anon";
grant delete on table "public"."scales" to "authenticated";
grant insert on table "public"."scales" to "authenticated";
grant references on table "public"."scales" to "authenticated";
grant select on table "public"."scales" to "authenticated";
grant trigger on table "public"."scales" to "authenticated";
grant truncate on table "public"."scales" to "authenticated";
grant update on table "public"."scales" to "authenticated";
grant delete on table "public"."scales" to "service_role";
grant insert on table "public"."scales" to "service_role";
grant references on table "public"."scales" to "service_role";
grant select on table "public"."scales" to "service_role";
grant trigger on table "public"."scales" to "service_role";
grant truncate on table "public"."scales" to "service_role";
grant update on table "public"."scales" to "service_role";

-- Grants: shifts

grant delete on table "public"."shifts" to "anon";
grant insert on table "public"."shifts" to "anon";
grant references on table "public"."shifts" to "anon";
grant select on table "public"."shifts" to "anon";
grant trigger on table "public"."shifts" to "anon";
grant truncate on table "public"."shifts" to "anon";
grant update on table "public"."shifts" to "anon";
grant delete on table "public"."shifts" to "authenticated";
grant insert on table "public"."shifts" to "authenticated";
grant references on table "public"."shifts" to "authenticated";
grant select on table "public"."shifts" to "authenticated";
grant trigger on table "public"."shifts" to "authenticated";
grant truncate on table "public"."shifts" to "authenticated";
grant update on table "public"."shifts" to "authenticated";
grant delete on table "public"."shifts" to "service_role";
grant insert on table "public"."shifts" to "service_role";
grant references on table "public"."shifts" to "service_role";
grant select on table "public"."shifts" to "service_role";
grant trigger on table "public"."shifts" to "service_role";
grant truncate on table "public"."shifts" to "service_role";
grant update on table "public"."shifts" to "service_role";

-- Grants: sectors

grant delete on table "public"."sectors" to "anon";
grant insert on table "public"."sectors" to "anon";
grant references on table "public"."sectors" to "anon";
grant select on table "public"."sectors" to "anon";
grant trigger on table "public"."sectors" to "anon";
grant truncate on table "public"."sectors" to "anon";
grant update on table "public"."sectors" to "anon";
grant delete on table "public"."sectors" to "authenticated";
grant insert on table "public"."sectors" to "authenticated";
grant references on table "public"."sectors" to "authenticated";
grant select on table "public"."sectors" to "authenticated";
grant trigger on table "public"."sectors" to "authenticated";
grant truncate on table "public"."sectors" to "authenticated";
grant update on table "public"."sectors" to "authenticated";
grant delete on table "public"."sectors" to "service_role";
grant insert on table "public"."sectors" to "service_role";
grant references on table "public"."sectors" to "service_role";
grant select on table "public"."sectors" to "service_role";
grant trigger on table "public"."sectors" to "service_role";
grant truncate on table "public"."sectors" to "service_role";
grant update on table "public"."sectors" to "service_role";

-- Grants: volunteer_sectors

grant delete on table "public"."volunteer_sectors" to "anon";
grant insert on table "public"."volunteer_sectors" to "anon";
grant references on table "public"."volunteer_sectors" to "anon";
grant select on table "public"."volunteer_sectors" to "anon";
grant trigger on table "public"."volunteer_sectors" to "anon";
grant truncate on table "public"."volunteer_sectors" to "anon";
grant update on table "public"."volunteer_sectors" to "anon";
grant delete on table "public"."volunteer_sectors" to "authenticated";
grant insert on table "public"."volunteer_sectors" to "authenticated";
grant references on table "public"."volunteer_sectors" to "authenticated";
grant select on table "public"."volunteer_sectors" to "authenticated";
grant trigger on table "public"."volunteer_sectors" to "authenticated";
grant truncate on table "public"."volunteer_sectors" to "authenticated";
grant update on table "public"."volunteer_sectors" to "authenticated";
grant delete on table "public"."volunteer_sectors" to "service_role";
grant insert on table "public"."volunteer_sectors" to "service_role";
grant references on table "public"."volunteer_sectors" to "service_role";
grant select on table "public"."volunteer_sectors" to "service_role";
grant trigger on table "public"."volunteer_sectors" to "service_role";
grant truncate on table "public"."volunteer_sectors" to "service_role";
grant update on table "public"."volunteer_sectors" to "service_role";

-- Grants: volunteers

grant delete on table "public"."volunteers" to "anon";
grant insert on table "public"."volunteers" to "anon";
grant references on table "public"."volunteers" to "anon";
grant select on table "public"."volunteers" to "anon";
grant trigger on table "public"."volunteers" to "anon";
grant truncate on table "public"."volunteers" to "anon";
grant update on table "public"."volunteers" to "anon";
grant delete on table "public"."volunteers" to "authenticated";
grant insert on table "public"."volunteers" to "authenticated";
grant references on table "public"."volunteers" to "authenticated";
grant select on table "public"."volunteers" to "authenticated";
grant trigger on table "public"."volunteers" to "authenticated";
grant truncate on table "public"."volunteers" to "authenticated";
grant update on table "public"."volunteers" to "authenticated";
grant delete on table "public"."volunteers" to "service_role";
grant insert on table "public"."volunteers" to "service_role";
grant references on table "public"."volunteers" to "service_role";
grant select on table "public"."volunteers" to "service_role";
grant trigger on table "public"."volunteers" to "service_role";
grant truncate on table "public"."volunteers" to "service_role";
grant update on table "public"."volunteers" to "service_role";


-- RLS Policies: event

create policy "Enable delete for authenticated users only"
  on "public"."event" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."event" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."event" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."event" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: scales

create policy "Enable delete for authenticated users only"
  on "public"."scales" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."scales" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."scales" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."scales" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: shifts

create policy "Enable delete for authenticated users only"
  on "public"."shifts" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."shifts" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."shifts" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."shifts" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: sectors

create policy "Enable delete for authenticated users only"
  on "public"."sectors" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."sectors" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."sectors" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."sectors" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: volunteer_sectors

create policy "Enable delete for authenticated users only"
  on "public"."volunteer_sectors" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."volunteer_sectors" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."volunteer_sectors" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."volunteer_sectors" as permissive for update to authenticated using (true) with check (true);


-- RLS Policies: volunteers

create policy "Enable delete for authenticated users only"
  on "public"."volunteers" as permissive for delete to authenticated using (true);

create policy "Enable insert for authenticated users only"
  on "public"."volunteers" as permissive for insert to authenticated with check (true);

create policy "Enable read access for all users"
  on "public"."volunteers" as permissive for select to public using (true);

create policy "Enable update for authenticated users only"
  on "public"."volunteers" as permissive for update to authenticated using (true) with check (true);
