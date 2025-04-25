"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, AlertTriangle } from "lucide-react"

interface QrScannerProps {
  onScan: (text: string) => void
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = "qr-reader"
  const [scanAttempts, setScanAttempts] = useState(0)
  const [lastErrorTime, setLastErrorTime] = useState(0)

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    )
  }

  useEffect(() => {
    // Clean up scanner on component unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = async () => {
    setError(null)
    setScanAttempts(0)

    try {
      // Create a new scanner instance if it doesn't exist
      if (!scannerRef.current) {
        // Create a new scanner with verbose logging for debugging
        scannerRef.current = new Html5Qrcode(scannerContainerId, { verbose: false }) // Set verbose to false to reduce console noise
      }

      // Set camera facing mode based on device type
      const facingMode = isMobileDevice() ? "environment" : "user"
      console.log(`Using camera with facing mode: ${facingMode}`)

      // Configure scanner with improved settings
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false, // Allow the scanner to try different orientations
        formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Support all formats
      }

      await scannerRef.current.start(
        { facingMode },
        config,
        (decodedText) => {
          console.log("QR code detected:", decodedText)
          onScan(decodedText)
          // Don't stop scanning to allow multiple scans
        },
        (errorMessage) => {
          // Handle common scanning errors more gracefully
          if (
            errorMessage.includes("QR code not found") ||
            errorMessage.includes("No MultiFormat Readers were able to detect the code") ||
            errorMessage.includes("No barcode or QR code detected")
          ) {
            // Increment scan attempts for tracking
            setScanAttempts((prev) => prev + 1)

            // Only log occasional updates to avoid console spam
            const now = Date.now()
            if (now - lastErrorTime > 5000) {
              // Log every 5 seconds at most
              console.log("Still scanning for QR code...", scanAttempts, "attempts made")
              setLastErrorTime(now)
            }
            return
          }

          // Log other errors that might be more important
          console.error("QR Scanner error:", errorMessage)
        },
      )

      setIsScanning(true)
    } catch (err) {
      console.error("Error starting QR scanner:", err)

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes("Camera access is not supported")) {
          setError("Camera access is not supported in this browser. Please try another browser.")
        } else if (err.message.includes("Permission denied")) {
          setError("Camera access denied. Please allow camera access in your browser settings.")
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError("Failed to start camera. Please check your camera permissions.")
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        console.log("QR scanner stopped successfully")
      } catch (err) {
        console.error("Error stopping QR scanner:", err)
      }
      setIsScanning(false)
    }
  }

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        id={scannerContainerId}
        className={`overflow-hidden rounded-lg border bg-card ${isScanning ? "h-64" : "h-0"}`}
      />

      <Button onClick={toggleScanner} className="w-full" variant={isScanning ? "destructive" : "default"}>
        <Camera className="mr-2 h-4 w-4" />
        {isScanning ? "Stop Camera" : "Start Camera"}
      </Button>

      {!isScanning && (
        <div className="text-center text-sm text-muted-foreground">
          Click the button above to activate your camera and scan a QR code
        </div>
      )}

      {isScanning && (
        <div className="text-center text-sm text-muted-foreground">Position a QR code in the camera view to scan</div>
      )}
    </div>
  )
}
