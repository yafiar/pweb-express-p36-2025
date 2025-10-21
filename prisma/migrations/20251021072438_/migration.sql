/*
  Warnings:

  - Added the required column `subtotal` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL;
