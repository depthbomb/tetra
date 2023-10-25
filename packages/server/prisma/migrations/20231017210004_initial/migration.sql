-- CreateTable
CREATE TABLE "Shortlink" (
    "id" TEXT NOT NULL,
    "creatorIp" TEXT NOT NULL,
    "userId" TEXT,
    "shortcode" TEXT NOT NULL,
    "shortlink" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "hits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Shortlink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT NOT NULL,
    "nextApiKey" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shortlink_shortcode_key" ON "Shortlink"("shortcode");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlink_shortlink_key" ON "Shortlink"("shortlink");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlink_secret_key" ON "Shortlink"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_sub_key" ON "User"("sub");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
