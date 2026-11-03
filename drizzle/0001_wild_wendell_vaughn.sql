-- Backfill Jakarta before adding scoped foreign keys. Run in one transaction.
CREATE TYPE "public"."daerah_tingkat" AS ENUM('PROVINSI', 'KABUPATEN', 'KOTA');
--> statement-breakpoint
CREATE TYPE "public"."status_kurasi" AS ENUM('BELUM_DIKURASI', 'AKTIF');
--> statement-breakpoint
CREATE TABLE "daerah" (
	"kode" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nama" text NOT NULL,
	"tingkat" "daerah_tingkat" NOT NULL,
	"induk_kode" text,
	"status_kurasi" "status_kurasi" DEFAULT 'BELUM_DIKURASI' NOT NULL,
	"ppid_url" text,
	CONSTRAINT "daerah_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO daerah (kode,slug,nama,tingkat,status_kurasi) VALUES ('31','dki-jakarta','DKI Jakarta','PROVINSI','AKTIF');
--> statement-breakpoint
ALTER TABLE "funding" DROP CONSTRAINT "funding_program_kode_tahun_jenis_unique";
--> statement-breakpoint
ALTER TABLE "source_document" DROP CONSTRAINT "source_document_type_version_unique";
--> statement-breakpoint
ALTER TABLE "bidang_urusan" DROP CONSTRAINT "bidang_urusan_source_document_id_source_document_id_fk";
--> statement-breakpoint
ALTER TABLE "evidence" DROP CONSTRAINT "evidence_program_kode_program_kode_fk";
--> statement-breakpoint
ALTER TABLE "evidence" DROP CONSTRAINT "evidence_source_document_id_source_document_id_fk";
--> statement-breakpoint
ALTER TABLE "funding" DROP CONSTRAINT "funding_program_kode_program_kode_fk";
--> statement-breakpoint
ALTER TABLE "funding" DROP CONSTRAINT "funding_source_document_id_source_document_id_fk";
--> statement-breakpoint
ALTER TABLE "program" DROP CONSTRAINT "program_bidang_kode_bidang_urusan_kode_fk";
--> statement-breakpoint
ALTER TABLE "program" DROP CONSTRAINT "program_source_document_id_source_document_id_fk";
--> statement-breakpoint
ALTER TABLE bidang_urusan DROP CONSTRAINT bidang_urusan_pkey;
--> statement-breakpoint
ALTER TABLE program DROP CONSTRAINT program_pkey;
--> statement-breakpoint
ALTER TABLE "bidang_urusan" ADD COLUMN "daerah_kode" text DEFAULT '31' NOT NULL;
--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "daerah_kode" text DEFAULT '31' NOT NULL;
--> statement-breakpoint
ALTER TABLE "funding" ADD COLUMN "daerah_kode" text DEFAULT '31' NOT NULL;
--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "daerah_kode" text DEFAULT '31' NOT NULL;
--> statement-breakpoint
ALTER TABLE "source_document" ADD COLUMN "daerah_kode" text DEFAULT '31' NOT NULL;
--> statement-breakpoint
ALTER TABLE "bidang_urusan" ADD CONSTRAINT "bidang_urusan_daerah_kode_kode_pk" PRIMARY KEY("daerah_kode","kode");
--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_daerah_kode_kode_pk" PRIMARY KEY("daerah_kode","kode");
--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_daerah_kode_program_kode_tahun_jenis_unique" UNIQUE("daerah_kode","program_kode","tahun","jenis");
--> statement-breakpoint
ALTER TABLE "source_document" ADD CONSTRAINT "source_document_daerah_kode_type_version_unique" UNIQUE("daerah_kode","type","version");
--> statement-breakpoint
ALTER TABLE "source_document" ADD CONSTRAINT "source_document_daerah_kode_id_unique" UNIQUE("daerah_kode","id");
--> statement-breakpoint
ALTER TABLE "daerah" ADD CONSTRAINT "daerah_induk_kode_daerah_kode_fk" FOREIGN KEY ("induk_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bidang_urusan" ADD CONSTRAINT "bidang_urusan_daerah_kode_daerah_kode_fk" FOREIGN KEY ("daerah_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bidang_urusan" ADD CONSTRAINT "bidang_urusan_daerah_kode_source_document_id_source_document_daerah_kode_id_fk" FOREIGN KEY ("daerah_kode","source_document_id") REFERENCES "public"."source_document"("daerah_kode","id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_daerah_kode_daerah_kode_fk" FOREIGN KEY ("daerah_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_daerah_kode_program_kode_program_daerah_kode_kode_fk" FOREIGN KEY ("daerah_kode","program_kode") REFERENCES "public"."program"("daerah_kode","kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_daerah_kode_source_document_id_source_document_daerah_kode_id_fk" FOREIGN KEY ("daerah_kode","source_document_id") REFERENCES "public"."source_document"("daerah_kode","id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_daerah_kode_daerah_kode_fk" FOREIGN KEY ("daerah_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_daerah_kode_program_kode_program_daerah_kode_kode_fk" FOREIGN KEY ("daerah_kode","program_kode") REFERENCES "public"."program"("daerah_kode","kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_daerah_kode_source_document_id_source_document_daerah_kode_id_fk" FOREIGN KEY ("daerah_kode","source_document_id") REFERENCES "public"."source_document"("daerah_kode","id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_daerah_kode_daerah_kode_fk" FOREIGN KEY ("daerah_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_daerah_kode_bidang_kode_bidang_urusan_daerah_kode_kode_fk" FOREIGN KEY ("daerah_kode","bidang_kode") REFERENCES "public"."bidang_urusan"("daerah_kode","kode") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_daerah_kode_source_document_id_source_document_daerah_kode_id_fk" FOREIGN KEY ("daerah_kode","source_document_id") REFERENCES "public"."source_document"("daerah_kode","id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "source_document" ADD CONSTRAINT "source_document_daerah_kode_daerah_kode_fk" FOREIGN KEY ("daerah_kode") REFERENCES "public"."daerah"("kode") ON DELETE no action ON UPDATE no action;
