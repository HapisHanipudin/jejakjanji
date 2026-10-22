CREATE TYPE "public"."evidence_jenis" AS ENUM('RENCANA', 'ANGGARAN', 'PELAKSANAAN');--> statement-breakpoint
CREATE TYPE "public"."funding_jenis" AS ENUM('INDIKATIF_RPJMD');--> statement-breakpoint
CREATE TYPE "public"."source_document_type" AS ENUM('RPJMD', 'RKPD');--> statement-breakpoint
CREATE TABLE "bidang_urusan" (
	"kode" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"pagu_indikatif_2026" bigint NOT NULL,
	"proporsi" numeric NOT NULL,
	"source_document_id" integer NOT NULL,
	"page_ref" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_kode" text NOT NULL,
	"jenis" "evidence_jenis" NOT NULL,
	"source_document_id" integer,
	"page_ref" integer,
	"cakupan_pencarian" text,
	"checked_at" date NOT NULL,
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "funding" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_kode" text NOT NULL,
	"tahun" integer NOT NULL,
	"jenis" "funding_jenis" NOT NULL,
	"jumlah_juta_rp" bigint NOT NULL,
	"source_document_id" integer NOT NULL,
	"page_ref" integer NOT NULL,
	CONSTRAINT "funding_program_kode_tahun_jenis_unique" UNIQUE("program_kode","tahun","jenis")
);
--> statement-breakpoint
CREATE TABLE "program" (
	"kode" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"bidang_kode" text NOT NULL,
	"indikator" text NOT NULL,
	"satuan" text NOT NULL,
	"kondisi_awal" text NOT NULL,
	"target_2026" text NOT NULL,
	"source_document_id" integer NOT NULL,
	"page_ref" integer NOT NULL,
	"verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" "source_document_type" NOT NULL,
	"url" text,
	"version" text NOT NULL,
	"checked_at" date NOT NULL,
	CONSTRAINT "source_document_type_version_unique" UNIQUE("type","version")
);
--> statement-breakpoint
ALTER TABLE "bidang_urusan" ADD CONSTRAINT "bidang_urusan_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_program_kode_program_kode_fk" FOREIGN KEY ("program_kode") REFERENCES "public"."program"("kode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_program_kode_program_kode_fk" FOREIGN KEY ("program_kode") REFERENCES "public"."program"("kode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding" ADD CONSTRAINT "funding_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_bidang_kode_bidang_urusan_kode_fk" FOREIGN KEY ("bidang_kode") REFERENCES "public"."bidang_urusan"("kode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE no action ON UPDATE no action;