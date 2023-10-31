-- CreateTable
CREATE TABLE "TokenBucket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "interval" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "bucketIdentifier" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenBucket_name_key" ON "TokenBucket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBucket_identifier_key" ON "TokenBucket"("identifier");

-- AddForeignKey
ALTER TABLE "RateLimit" ADD CONSTRAINT "RateLimit_bucketIdentifier_fkey" FOREIGN KEY ("bucketIdentifier") REFERENCES "TokenBucket"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;
