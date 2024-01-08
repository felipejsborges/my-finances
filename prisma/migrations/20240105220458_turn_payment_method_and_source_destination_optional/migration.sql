-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "sourceDestination" DROP NOT NULL;
