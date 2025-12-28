-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "destinationId" TEXT,
ADD COLUMN     "isAccessible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAdults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxChildren" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxGuests" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxPets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "petsAllowed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "pets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_listingId_startDate_endDate_idx" ON "public"."Booking"("listingId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Listing_destinationId_idx" ON "public"."Listing"("destinationId");

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
