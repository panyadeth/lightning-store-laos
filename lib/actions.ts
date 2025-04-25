"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const qrData = formData.get("qrData") as string
    const qrType = formData.get("qrType") as string
    const detectionMethod = formData.get("detectionMethod") as string
    const timestamp = formData.get("timestamp") as string

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      }
    }

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("BLOB_READ_WRITE_TOKEN not found. Image will not be saved to Vercel Blob.")
      return {
        success: true,
        skipUpload: true,
        imageId: `local-${Date.now()}`,
        message: "Blob storage not configured. Proceeding without saving image.",
      }
    }

    // Generate a unique filename
    const uniqueId = Date.now().toString()
    const filename = `${uniqueId}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      metadata: {
        qrData,
        qrType,
        detectionMethod,
        timestamp,
      },
    })

    // Here you could also save a reference to the blob in your database
    // For example with Prisma:
    // await prisma.qrImage.create({
    //   data: {
    //     id: uniqueId,
    //     url: blob.url,
    //     qrData: qrData,
    //     qrType: qrType,
    //     detectionMethod: detectionMethod,
    //     timestamp: new Date(timestamp)
    //   }
    // });

    // Revalidate the path to update any cached data
    revalidatePath("/pay")

    return {
      success: true,
      imageId: uniqueId,
      url: blob.url,
      message: "Image uploaded successfully",
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    }
  }
}
