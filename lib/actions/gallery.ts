"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";
import { parseDateOnly } from "@/lib/dates";

function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/", "layout");
}

// ---------- Tags ----------

export async function createTag(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/admin/gallery?error=tagname");

  const slug = slugify(name);
  const existing = await prisma.galleryTag.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (!existing) {
    await prisma.galleryTag.create({ data: { name, slug } });
  }

  revalidateGallery();
}

export async function renameTag(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.galleryTag.update({ where: { id }, data: { name, slug: slugify(name) } });
  revalidateGallery();
}

export async function deleteTag(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.galleryTag.delete({ where: { id } });
  revalidateGallery();
}

// ---------- Albums ----------

async function uniqueAlbumSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "album";
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.galleryAlbum.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function createAlbum(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "");
  const eventDateRaw = String(formData.get("eventDate") || "");
  const tagIds = formData.getAll("tagIds").map(String);
  const visible = formData.get("visible") === "on";

  if (!title) redirect("/admin/gallery/albums/new?error=title");

  const slug = await uniqueAlbumSlug(title);
  const count = await prisma.galleryAlbum.count();

  const album = await prisma.galleryAlbum.create({
    data: {
      title,
      slug,
      description,
      eventDate: eventDateRaw ? parseDateOnly(eventDateRaw) : null,
      visible,
      sortOrder: count,
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
  });

  revalidateGallery();
  redirect(`/admin/gallery/albums/${album.id}`);
}

export async function updateAlbum(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "");
  const eventDateRaw = String(formData.get("eventDate") || "");
  const tagIds = formData.getAll("tagIds").map(String);
  const visible = formData.get("visible") === "on";
  const sortOrderRaw = String(formData.get("sortOrder") || "0");

  if (!title) redirect(`/admin/gallery/albums/${id}?error=title`);

  const current = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!current) return;

  const slug = current.title === title ? current.slug : await uniqueAlbumSlug(title, id);

  await prisma.galleryAlbum.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      eventDate: eventDateRaw ? parseDateOnly(eventDateRaw) : null,
      visible,
      sortOrder: parseInt(sortOrderRaw, 10) || 0,
      tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  revalidateGallery();
  revalidatePath(`/gallery/${slug}`);
  redirect(`/admin/gallery/albums/${id}?saved=1`);
}

export async function deleteAlbum(formData: FormData) {
  const id = String(formData.get("id"));
  // Items in this album are detached (albumId set null), not deleted - the
  // photos themselves survive outside the album.
  await prisma.galleryAlbum.delete({ where: { id } });
  revalidateGallery();
  redirect("/admin/gallery");
}

export async function setAlbumArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.galleryAlbum.update({ where: { id }, data: { archived } });
  revalidateGallery();
}

export async function setAlbumCover(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const item = await prisma.galleryItem.findUnique({ where: { id: itemId } });
  if (!item || !item.albumId) return;

  await prisma.$transaction([
    prisma.galleryItem.updateMany({
      where: { albumId: item.albumId },
      data: { isAlbumCover: false },
    }),
    prisma.galleryItem.update({ where: { id: itemId }, data: { isAlbumCover: true } }),
  ]);

  revalidateGallery();
}

// ---------- Items ----------

export async function uploadGalleryItems(formData: FormData) {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const albumId = String(formData.get("albumId") || "") || null;
  const tagIds = formData.getAll("tagIds").map(String);
  const type = String(formData.get("type") || "PHOTO");

  if (files.length === 0) return;

  const startCount = await prisma.galleryItem.count();

  for (let i = 0; i < files.length; i++) {
    const { url, width, height } = await saveUploadedImage(files[i], "gallery");
    await prisma.galleryItem.create({
      data: {
        url,
        type,
        width,
        height,
        albumId,
        sortOrder: startCount + i,
        tags: tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
    });
  }

  revalidateGallery();
  if (albumId) {
    const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
    if (album) revalidatePath(`/gallery/${album.slug}`);
  }
}

export async function updateGalleryItem(formData: FormData) {
  const id = String(formData.get("id"));
  const caption = String(formData.get("caption") || "");
  const albumId = String(formData.get("albumId") || "") || null;
  const tagIds = formData.getAll("tagIds").map(String);

  await prisma.galleryItem.update({
    where: { id },
    data: {
      caption,
      albumId,
      tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  revalidateGallery();
}

export async function deleteGalleryItem(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.galleryItem.delete({ where: { id } });
  revalidateGallery();
}

export async function setGalleryItemArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.galleryItem.update({ where: { id }, data: { archived } });
  revalidateGallery();
}

export async function toggleFeatured(formData: FormData) {
  const id = String(formData.get("id"));
  const featured = String(formData.get("featured")) === "true";
  await prisma.galleryItem.update({ where: { id }, data: { featured } });
  revalidateGallery();
}

export async function toggleVisible(formData: FormData) {
  const id = String(formData.get("id"));
  const visible = String(formData.get("visible")) === "true";
  await prisma.galleryItem.update({ where: { id }, data: { visible } });
  revalidateGallery();
}

export async function moveItem(formData: FormData) {
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction")); // "up" | "down"

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;

  const siblings = await prisma.galleryItem.findMany({
    where: { albumId: item.albumId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const idx = siblings.findIndex((s) => s.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;

  const other = siblings[swapIdx];

  await prisma.$transaction([
    prisma.galleryItem.update({ where: { id: item.id }, data: { sortOrder: other.sortOrder } }),
    prisma.galleryItem.update({ where: { id: other.id }, data: { sortOrder: item.sortOrder } }),
  ]);

  revalidateGallery();
}

// ---------- Bulk actions ----------

export async function bulkAssignAlbum(formData: FormData) {
  const ids = formData.getAll("itemIds").map(String);
  const albumId = String(formData.get("albumId") || "") || null;
  if (ids.length === 0) return;

  await prisma.galleryItem.updateMany({ where: { id: { in: ids } }, data: { albumId } });
  revalidateGallery();
}

export async function bulkAssignTag(formData: FormData) {
  const ids = formData.getAll("itemIds").map(String);
  const tagId = String(formData.get("tagId") || "");
  if (ids.length === 0 || !tagId) return;

  await Promise.all(
    ids.map((id) =>
      prisma.galleryItem.update({ where: { id }, data: { tags: { connect: { id: tagId } } } })
    )
  );

  revalidateGallery();
}

export async function bulkSetVisible(formData: FormData) {
  const ids = formData.getAll("itemIds").map(String);
  const visible = String(formData.get("visible")) === "true";
  if (ids.length === 0) return;

  await prisma.galleryItem.updateMany({ where: { id: { in: ids } }, data: { visible } });
  revalidateGallery();
}

export async function bulkSetArchived(formData: FormData) {
  const ids = formData.getAll("itemIds").map(String);
  const archived = String(formData.get("archived")) === "true";
  if (ids.length === 0) return;

  await prisma.galleryItem.updateMany({ where: { id: { in: ids } }, data: { archived } });
  revalidateGallery();
}

export async function bulkDelete(formData: FormData) {
  const ids = formData.getAll("itemIds").map(String);
  if (ids.length === 0) return;

  await prisma.galleryItem.deleteMany({ where: { id: { in: ids } } });
  revalidateGallery();
}
