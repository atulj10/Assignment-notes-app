-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_shares" (
    "note_id" UUID NOT NULL,
    "shared_with_user_id" UUID NOT NULL,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_shares_pkey" PRIMARY KEY ("note_id","shared_with_user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "notes_owner_id_idx" ON "notes"("owner_id");

-- CreateIndex
CREATE INDEX "note_shares_shared_with_user_id_idx" ON "note_shares"("shared_with_user_id");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_shared_with_user_id_fkey" FOREIGN KEY ("shared_with_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
