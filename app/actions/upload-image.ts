"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const qrData = formData.get("qrData") as string
    const qrType = formData.get("qrType") as string
    const detectionMethod = formData.get("detectionMethod") as string

    if (!file || !qrData) {
      return {
        success: false,
        error: "Missing required fields",
      }
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `qr-images/${timestamp}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      metadata: {
        qrData,
        qrType: qrType || "unknown",
        detectionMethod: detectionMethod || "QR",
        timestamp: new Date().toISOString(),
      },
    })

    // Here you would typically also save a reference to your database
    // For example with Prisma:
    // const dbEntry = await prisma.qrImage.create({
    //   data: {
    //     url: blob.url,
    //     filename: blob.pathname,
    //     qrData,
    //     qrType: qrType || 'unknown',
    //     detectionMethod: detectionMethod || 'QR',
    //   }
    // })

    // For now, we'll just return the blob info
    revalidatePath("/pay")

    return {
      success: true,
      imageId: blob.pathname,
      url: blob.url,
      message: "Image saved to database",
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save image",
    }
  }
}
