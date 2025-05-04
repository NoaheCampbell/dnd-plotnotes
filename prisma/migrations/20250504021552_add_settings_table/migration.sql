-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "session_reminders" BOOLEAN NOT NULL DEFAULT true,
    "campaign_updates" BOOLEAN NOT NULL DEFAULT true,
    "new_content" BOOLEAN NOT NULL DEFAULT true,
    "players_count" INTEGER NOT NULL DEFAULT 4,
    "session_duration" INTEGER NOT NULL DEFAULT 3,
    "default_location" TEXT,
    "auto_backup" BOOLEAN NOT NULL DEFAULT true,
    "backup_frequency" TEXT NOT NULL DEFAULT 'daily',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
