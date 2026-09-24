-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "signatureUrl" TEXT;

-- AlterTable
ALTER TABLE "GalleryItem" DROP COLUMN "category",
ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "isAlbumCover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "GalleryTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "eventDate" TIMESTAMP(3),
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlbumTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTag_name_key" ON "GalleryTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTag_slug_key" ON "GalleryTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAlbum_slug_key" ON "GalleryAlbum"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumTags_AB_unique" ON "_AlbumTags"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumTags_B_index" ON "_AlbumTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemTags_AB_unique" ON "_ItemTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemTags_B_index" ON "_ItemTags"("B");

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumTags" ADD CONSTRAINT "_AlbumTags_A_fkey" FOREIGN KEY ("A") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumTags" ADD CONSTRAINT "_AlbumTags_B_fkey" FOREIGN KEY ("B") REFERENCES "GalleryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemTags" ADD CONSTRAINT "_ItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "GalleryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemTags" ADD CONSTRAINT "_ItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "GalleryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

