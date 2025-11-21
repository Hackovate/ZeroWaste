-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "district" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "neededBy" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "helpRequestId" TEXT NOT NULL,
    "donorUserId" TEXT NOT NULL,
    "message" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "contactInfo" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequestReport" (
    "id" TEXT NOT NULL,
    "helpRequestId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpRequestReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpRequest_userId_idx" ON "HelpRequest"("userId");

-- CreateIndex
CREATE INDEX "HelpRequest_district_idx" ON "HelpRequest"("district");

-- CreateIndex
CREATE INDEX "HelpRequest_division_idx" ON "HelpRequest"("division");

-- CreateIndex
CREATE INDEX "HelpRequest_status_idx" ON "HelpRequest"("status");

-- CreateIndex
CREATE INDEX "HelpRequest_neededBy_idx" ON "HelpRequest"("neededBy");

-- CreateIndex
CREATE INDEX "Donation_helpRequestId_idx" ON "Donation"("helpRequestId");

-- CreateIndex
CREATE INDEX "Donation_donorUserId_idx" ON "Donation"("donorUserId");

-- CreateIndex
CREATE INDEX "HelpRequestReport_helpRequestId_idx" ON "HelpRequestReport"("helpRequestId");

-- CreateIndex
CREATE INDEX "HelpRequestReport_reporterUserId_idx" ON "HelpRequestReport"("reporterUserId");

-- CreateIndex
CREATE INDEX "HelpRequestReport_type_idx" ON "HelpRequestReport"("type");

-- CreateIndex
CREATE UNIQUE INDEX "HelpRequestReport_helpRequestId_reporterUserId_key" ON "HelpRequestReport"("helpRequestId", "reporterUserId");

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_helpRequestId_fkey" FOREIGN KEY ("helpRequestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorUserId_fkey" FOREIGN KEY ("donorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequestReport" ADD CONSTRAINT "HelpRequestReport_helpRequestId_fkey" FOREIGN KEY ("helpRequestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequestReport" ADD CONSTRAINT "HelpRequestReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
