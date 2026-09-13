-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "urlForm" TEXT NOT NULL,
    "urlClicks" INTEGER NOT NULL DEFAULT 0,
    "isArchive" BOOLEAN NOT NULL DEFAULT false,
    "archive_description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_view" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_document" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "original_name" TEXT,
    "mime_type" TEXT,
    "size" INTEGER,
    "path" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "path" TEXT,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "post_slug_key" ON "post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_view_post_id_user_ip_key" ON "post_view"("post_id", "user_ip");

-- CreateIndex
CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_ip_date_key" ON "Visit"("ip", "date");

-- AddForeignKey
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_document" ADD CONSTRAINT "post_document_post_id_foreign" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
