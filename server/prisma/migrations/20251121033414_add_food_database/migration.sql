-- CreateTable
CREATE TABLE "FoodDatabase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "expirationEstimate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodDatabase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodDatabase_name_idx" ON "FoodDatabase"("name");

-- CreateIndex
CREATE INDEX "FoodDatabase_category_idx" ON "FoodDatabase"("category");

-- CreateIndex
CREATE UNIQUE INDEX "FoodDatabase_name_key" ON "FoodDatabase"("name");
