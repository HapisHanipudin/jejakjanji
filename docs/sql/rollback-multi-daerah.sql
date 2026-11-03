-- Back up first. Stop the new app; run this entire file atomically.
BEGIN;
LOCK TABLE daerah, source_document, bidang_urusan, program, funding, evidence IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE item record; has_other boolean;
BEGIN
  IF to_regclass('drizzle.__drizzle_migrations') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE created_at > 1793684963335) THEN
      RAISE EXCEPTION 'Rollback blocked: newer migrations exist.';
    END IF;
  END IF;
  IF (SELECT count(*) FROM daerah) <> 1 OR NOT EXISTS (
    SELECT 1 FROM daerah WHERE kode='31' AND slug='dki-jakarta' AND nama='DKI Jakarta'
      AND tingkat='PROVINSI' AND status_kurasi='AKTIF' AND induk_kode IS NULL AND ppid_url IS NULL
  ) THEN RAISE EXCEPTION 'Rollback blocked: region metadata changed. Preserve it explicitly.'; END IF;
  FOR item IN SELECT unnest(ARRAY['source_document','bidang_urusan','program','funding','evidence']) AS name LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE daerah_kode <> %L)', item.name, '31') INTO has_other;
    IF has_other THEN RAISE EXCEPTION 'Rollback blocked: non-Jakarta data in %', item.name; END IF;
  END LOOP;
  FOR item IN SELECT conrelid::regclass AS relation, conname FROM pg_constraint
    WHERE contype='f' AND connamespace='public'::regnamespace
      AND conrelid IN ('source_document'::regclass,'bidang_urusan'::regclass,'program'::regclass,'funding'::regclass,'evidence'::regclass) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', item.relation, item.conname);
  END LOOP;
END $$;
ALTER TABLE evidence DROP COLUMN daerah_kode;
ALTER TABLE funding DROP COLUMN daerah_kode;
ALTER TABLE program DROP COLUMN daerah_kode;
ALTER TABLE bidang_urusan DROP COLUMN daerah_kode;
ALTER TABLE source_document DROP COLUMN daerah_kode;
ALTER TABLE bidang_urusan ADD PRIMARY KEY (kode);
ALTER TABLE program ADD PRIMARY KEY (kode);
ALTER TABLE source_document ADD CONSTRAINT source_document_type_version_unique UNIQUE(type,version);
ALTER TABLE funding ADD CONSTRAINT funding_program_kode_tahun_jenis_unique UNIQUE(program_kode,tahun,jenis);
DROP TABLE daerah;
DROP TYPE daerah_tingkat;
DROP TYPE status_kurasi;
ALTER TABLE "bidang_urusan" ADD CONSTRAINT "bidang_urusan_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_program_kode_program_kode_fk" FOREIGN KEY ("program_kode") REFERENCES "public"."program"("kode") ON DELETE no action ON UPDATE no action;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "funding" ADD CONSTRAINT "funding_program_kode_program_kode_fk" FOREIGN KEY ("program_kode") REFERENCES "public"."program"("kode") ON DELETE no action ON UPDATE no action;
ALTER TABLE "funding" ADD CONSTRAINT "funding_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "program" ADD CONSTRAINT "program_bidang_kode_bidang_urusan_kode_fk" FOREIGN KEY ("bidang_kode") REFERENCES "public"."bidang_urusan"("kode") ON DELETE no action ON UPDATE no action;
ALTER TABLE "program" ADD CONSTRAINT "program_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;
DO $$
BEGIN
  IF to_regclass('drizzle.__drizzle_migrations') IS NOT NULL THEN
    DELETE FROM drizzle.__drizzle_migrations WHERE created_at = 1793684963335;
  END IF;
END $$;
COMMIT;
