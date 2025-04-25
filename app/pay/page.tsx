"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  QrCode,
  Camera,
  Bitcoin,
  ArrowRight,
  X,
  Upload,
  Copy,
  Check,
  RefreshCw,
  SwitchCamera,
  CheckCircle,
  Info,
  AlertTriangle,
  Receipt,
  Loader2,
  CreditCard,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode"
import { createWorker } from "tesseract.js"
import QrScanner from "@/components/qr-scanner"
import { uploadImage } from "@/lib/actions"
import jsQR from "jsqr"

export default function PayPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // State for camera and QR detection
  const [cameraActive, setCameraActive] = useState(false)
  const [qrDetected, setQrDetected] = useState(false)
  const [qrDetectionFailed, setQrDetectionFailed] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [paymentHash, setPaymentHash] = useState("")
  const [paymentRequest, setPaymentRequest] = useState("")
  const [paymentCreated, setPaymentCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [availableCameras, setAvailableCameras] = useState([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [componentMounted, setComponentMounted] = useState(false)
  const [uploadedQrImage, setUploadedQrImage] = useState(null)
  const [detectedQrType, setDetectedQrType] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isOcrRunning, setIsOcrRunning] = useState("")
  const [ocrText, setOcrText] = useState("")
  const [isWaitingForBill, setIsWaitingForBill] = useState(false)
  const [billRequestTime, setBillRequestTime] = useState(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [useNewScanner, setUseNewScanner] = useState(true) // Flag to use the new QrScanner component
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)
  const videoContainerRef = useRef(null)
  const html5QrScannerRef = useRef(null)
  const tesseractWorkerRef = useRef(null)

  // State for payment status
  const [isPaymentPaid, setIsPaymentPaid] = useState(false)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [paymentCheckInterval, setPaymentCheckInterval] = useState(null)

  // State for currency conversion
  const [amountLAK, setAmountLAK] = useState("")
  const [amountSats, setAmountSats] = useState(0)
  const [memo, setMemo] = useState("")
  const [exchangeRate, setExchangeRate] = useState(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const [rateError, setRateError] = useState("")
  const [amountExceedsLimit, setAmountExceedsLimit] = useState(false)

  // Constants
  const SATS_PER_BTC = 100000000 // 1 BTC = 100,000,000 satoshis
  const PAYMENT_CHECK_INTERVAL = 3000 // Check payment status every 3 seconds
  const MAX_PAYMENT_CHECKS = 60 // Maximum number of checks (3 minutes)

  // Valid QR code sequences
  const VALID_QR_SEQUENCES = [
    "00020101021138670016A00526628466257701082771041802030010324",
    "53034185802LA6304",
    "38570016A005266284662577010827710418020300",
  ]

  // Valid OCR keywords
  const VALID_OCR_KEYWORDS = {
    LAOQR: ["lao qr", "laoqr", "bcel"],
    LAPNET: ["lapnet", "lap net"],
    LAK: ["lak", "kip"],
  }

  // Function to detect if user is on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    )
  }

  // Mark component as mounted after initial render
  useEffect(() => {
    setComponentMounted(true)

    return () => {
      setComponentMounted(false)
    }
  }, [])

  // Initialize Tesseract worker
  useEffect(() => {
    const initTesseract = async () => {
      if (!tesseractWorkerRef.current) {
        try {
          // Create worker with the correct v5 API
          const worker = await createWorker("eng")
          // Store the worker reference
          tesseractWorkerRef.current = worker
          console.log("Tesseract worker initialized")
        } catch (error) {
          console.error("Error initializing Tesseract worker:", error)
        }
      }
    }

    initTesseract()

    // Cleanup
    return () => {
      const cleanupWorker = async () => {
        if (tesseractWorkerRef.current) {
          await tesseractWorkerRef.current.terminate()
          tesseractWorkerRef.current = null
        }
      }
      cleanupWorker()
    }
  }, [])

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate()
  }, [])

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval)
      }
      stopCameraStream()
    }
  }, [paymentCheckInterval])

  // Start checking payment status when payment is created
  useEffect(() => {
    if (paymentCreated && paymentHash && !isPaymentPaid) {
      startPaymentStatusCheck()
    }
  }, [paymentCreated, paymentHash])

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    // This will ensure refs are attached before any camera activation
    if (componentMounted && videoContainerRef.current) {
      console.log("Video container ref is now available")
    }
  }, [componentMounted])

  // Start QR scanning when camera becomes active
  useEffect(() => {
    if (cameraActive && videoContainerRef.current) {
      startQrScanning()
    }

    return () => {
      stopQrScanner()
    }
  }, [cameraActive])

  // Add a beforeunload event listener when waiting for bill
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isWaitingForBill) {
        // Standard way of showing a confirmation dialog before leaving the page
        e.preventDefault()
        e.returnValue = "You are waiting for your bill. Are you sure you want to leave this page?"
        return e.returnValue
      }
    }

    if (isWaitingForBill) {
      window.addEventListener("beforeunload", handleBeforeUnload)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isWaitingForBill])

  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true)
    setRateError("")

    try {
      // Use the conversion API with a POST request
      const response = await fetch("https://lnbits.de/api/v1/conversion", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_: "lak",
          amount: 10000, // Use 10000 LAK as the base amount
          to: "sat",
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("Conversion rate data:", data)

      // The API might return data in a different format than expected
      // Let's handle multiple possible formats
      if (data && typeof data === "number") {
        // If the API returns just a number
        const satsPerLak = data / 10000
        setExchangeRate({
          sats_per_unit: satsPerLak,
          original_response: data,
        })
      } else if (data && typeof data === "object") {
        // If the API returns an object, try to find the amount
        if (data.amount !== undefined) {
          const satsPerLak = Number(data.amount) / 10000
          setExchangeRate({
            sats_per_unit: satsPerLak,
            original_response: data,
          })
        } else if (data.sats !== undefined) {
          // Alternative property name
          const satsPerLak = Number(data.sats) / 10000
          setExchangeRate({
            sats_per_unit: satsPerLak,
            original_response: data,
          })
        } else if (data.result !== undefined) {
          // Another alternative property name
          const satsPerLak = Number(data.result) / 10000
          setExchangeRate({
            sats_per_unit: satsPerLak,
            original_response: data,
          })
        } else {
          // If we can't find a recognizable property, log the data and use fallback
          console.warn("Unrecognized API response format:", data)
          throw new Error("Unrecognized API response format")
        }
      } else {
        throw new Error("Invalid response format from conversion API")
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
      setRateError("Failed to fetch exchange rate. Using fallback rate.")
      // Set fallback rate
      setExchangeRate({
        sats_per_unit: 0.22, // Fallback sats per LAK (220 sats per 1000 LAK)
        is_fallback: true,
      })
    } finally {
      setIsLoadingRate(false)
    }
  }

  // Calculate satoshis whenever LAK amount or exchange rate changes
  useEffect(() => {
    if (amountLAK && exchangeRate && exchangeRate.sats_per_unit) {
      // Make sure we're working with numbers
      const lakAmount = Number(amountLAK)
      const rate = Number(exchangeRate.sats_per_unit)

      // Calculate and round to the nearest satoshi
      const satsAmount = Math.round(lakAmount * rate)
      setAmountSats(satsAmount)
    } else {
      setAmountSats(0)
    }
  }, [amountLAK, exchangeRate])

  // Start checking payment status
  const startPaymentStatusCheck = () => {
    // Clear any existing interval
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval)
    }

    let checkCount = 0

    // Set initial check
    checkPaymentStatus()

    // Set up interval for checking payment status
    const intervalId = setInterval(() => {
      checkCount++

      // Stop checking after MAX_PAYMENT_CHECKS
      if (checkCount >= MAX_PAYMENT_CHECKS) {
        clearInterval(intervalId)
        setIsCheckingPayment(false)
        console.log("Stopped checking payment status after maximum attempts")
      } else {
        checkPaymentStatus()
      }
    }, PAYMENT_CHECK_INTERVAL)

    setPaymentCheckInterval(intervalId)
  }

  // Check payment status
  const checkPaymentStatus = async () => {
    if (!paymentHash || isPaymentPaid) return

    setIsCheckingPayment(true)

    try {
      const response = await fetch(`https://lnbits.de/api/v1/payments/${paymentHash}`, {
        method: "GET",
        headers: {
          "X-Api-Key": "bee5341ef9a849a4a421dbd240c9d940",
          "Content-type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Payment status check failed with status ${response.status}`)
        return
      }

      const data = await response.json()
      console.log("Payment status:", data)

      if (data.paid === true) {
        setIsPaymentPaid(true)
        setIsCheckingPayment(false)

        // Clear the interval since payment is confirmed
        if (paymentCheckInterval) {
          clearInterval(paymentCheckInterval)
          setPaymentCheckInterval(null)
        }

        // Show success toast
        toast({
          title: "Payment Successful!",
          description: "Your payment has been received.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    }
  }

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.")
        return []
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      console.log("Available cameras:", videoDevices)
      return videoDevices
    } catch (err) {
      console.error("Error enumerating devices:", err)
      return []
    }
  }

  // Update the startCameraStream function to use the ref instead of querySelector
  const startCameraStream = async (deviceId = null) => {
    setIsCameraLoading(true)
    setCameraError("")

    try {
      console.log("Creating video element programmatically")

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.error("Cannot access video - not in browser environment")
        setCameraError("Camera initialization failed. Please try again.")
        setIsCameraLoading(false)
        return
      }

      // Check if the video container ref is available
      if (!videoContainerRef || !videoContainerRef.current) {
        console.error("Video container ref is not available")
        setCameraError("Camera initialization failed. Please try again.")
        setIsCameraLoading(false)
        return
      }

      // Create a new video element programmatically
      const videoElement = document.createElement("video")
      videoElement.playsInline = true
      videoElement.muted = true
      videoElement.style.width = "100%"
      videoElement.style.height = "100%"
      videoElement.style.objectFit = "cover"

      // Store the element in the ref
      videoRef.current = videoElement

      // Clear the video container first
      const videoContainer = videoContainerRef.current
      videoContainer.innerHTML = ""
      videoContainer.appendChild(videoElement)

      // Make sure canvas is ready for QR scanning
      if (!canvasRef.current) {
        const canvas = document.createElement("canvas")
        canvas.style.display = "none"
        canvasRef.current = canvas
        videoContainer.appendChild(canvas)
      }

      // Set camera facing mode based on device type
      const facingMode = isMobileDevice() ? "environment" : "user"
      console.log(`Using camera with facing mode: ${facingMode}`)

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode },
      }

      console.log("Requesting camera with constraints:", constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Camera stream obtained successfully")

      // Store the stream reference
      streamRef.current = stream

      // Set the stream to the video element
      videoElement.srcObject = stream

      // Try to play the video
      try {
        await videoElement.play()
        console.log("Video playing successfully")
        setCameraActive(true)
        setIsCameraLoading(false)
      } catch (playError) {
        console.error("Error playing video:", playError)
        setCameraError("Could not play video stream. Please try again.")
        stopCameraStream()
        setIsCameraLoading(false)
      }
    } catch (err) {
      console.error("Error starting camera:", err)
      handleCameraError(err)
      setIsCameraLoading(false)
    }
  }

  // Update the stopCameraStream function to use the ref
  const stopCameraStream = () => {
    console.log("Stopping camera stream")

    // Stop QR scanning
    stopQrScanner()

    // Stop camera stream
    if (streamRef.current) {
      console.log("Stopping all tracks in stream")
      streamRef.current.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}`)
        track.stop()
      })
      streamRef.current = null
    }

    // Clear the video srcObject
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Clear the QR reader div if it exists
    const qrReader = document.getElementById("qr-reader")
    if (qrReader && qrReader.parentNode) {
      qrReader.parentNode.removeChild(qrReader)
    }

    setIsScanning(false)
    setCameraActive(false)
  }

  // Start QR code scanning with html5-qrcode
  const startQrScanning = () => {
    if (!videoContainerRef.current) {
      console.error("Video container ref is not available for QR scanning")
      return
    }

    setIsScanning(true)
    console.log("Starting QR code scanning with Html5QrcodeScanner")

    try {
      // We'll use the activateCamera function which now uses Html5QrcodeScanner
      activateCamera()
    } catch (error) {
      console.error("Error setting up QR scanner:", error)
      setCameraError(`Error setting up scanner: ${error.message || "Unknown error"}`)
      setIsScanning(false)
    }
  }

  // Run OCR on the current camera feed
  const runOcrOnCameraFeed = async () => {
    if (!cameraActive || !videoRef.current || isOcrRunning || qrDetected) return

    try {
      setIsOcrRunning(true)

      // Create a canvas to capture the current video frame
      const canvas = document.createElement("canvas")
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"))

      // Run OCR on the blob
      const result = await performOcr(blob)

      // Check if OCR found any valid keywords
      const ocrValidation = validateOcrText(result.text)

      if (ocrValidation.valid) {
        console.log(
          `OCR detected valid keywords for ${ocrValidation.type} with ${ocrValidation.confidence} confidence:`,
          result.text,
        )

        // Process as a valid QR code
        const validationResult = {
          found: true,
          type: ocrValidation.type,
          sequence: "OCR_DETECTED", // Placeholder
          confidence: ocrValidation.confidence,
        }

        // Generate a placeholder QR value
        const placeholderQrText = `OCR_DETECTED_${ocrValidation.type}_${Date.now()}`

        // Process the valid QR code
        processValidQrCode(placeholderQrText, validationResult)
      } else {
        console.log("OCR did not detect valid keywords:", result.text)

        // Schedule another OCR scan if camera is still active
        if (cameraActive && !qrDetected) {
          setTimeout(() => {
            runOcrOnCameraFeed()
          }, 5000) // Try again in 5 seconds
        }
      }
    } catch (error) {
      console.error("Error running OCR on camera feed:", error)
    } finally {
      setIsOcrRunning(false)
    }
  }

  // Perform OCR on an image blob
  const performOcr = async (imageBlob) => {
    try {
      if (!tesseractWorkerRef.current) {
        // Initialize worker if not already done
        const worker = await createWorker("eng")
        tesseractWorkerRef.current = worker
      }

      // Recognize text in the image using the v5 API
      const result = await tesseractWorkerRef.current.recognize(imageBlob)
      const text = result.data.text
      console.log("OCR result:", text)

      // Store the OCR text
      setOcrText(text)

      return {
        success: true,
        text: text,
      }
    } catch (error) {
      console.error("OCR error:", error)
      return {
        success: false,
        error: error.message || "OCR processing failed",
        text: "",
      }
    }
  }

  // Replace the validateOcrText function with this improved version
  const validateOcrText = (text) => {
    if (!text) return { valid: false }

    const lowerText = text.toLowerCase()

    // Check for multiple keywords as in the HTML example
    const hasLaoQr = VALID_OCR_KEYWORDS.LAOQR.some((keyword) => lowerText.includes(keyword))
    const hasLapnet = VALID_OCR_KEYWORDS.LAPNET.some((keyword) => lowerText.includes(keyword))
    const hasLak = VALID_OCR_KEYWORDS.LAK.some((keyword) => lowerText.includes(keyword))

    // If we have both LAOQR and LAPNET keywords (similar to the HTML example)
    if (hasLaoQr && hasLapnet) {
      console.log("OCR detected both LAOQR and LAPNET keywords")
      return {
        valid: true,
        type: "COMBINED", // This is a new type for when both are detected
        confidence: "high",
      }
    }

    // If we have LAOQR and LAK keywords
    if (hasLaoQr && hasLak) {
      console.log("OCR detected LAOQR and LAK keywords")
      return {
        valid: true,
        type: "LAOQR",
        confidence: "medium",
      }
    }

    // If we have LAPNET and LAK keywords
    if (hasLapnet && hasLak) {
      console.log("OCR detected LAPNET and LAK keywords")
      return {
        valid: true,
        type: "LAPNET",
        confidence: "medium",
      }
    }

    // Single keyword matches (lower confidence)
    if (hasLaoQr) {
      return {
        valid: true,
        type: "LAOQR",
        confidence: "low",
      }
    }

    if (hasLapnet) {
      return {
        valid: true,
        type: "LAPNET",
        confidence: "low",
      }
    }

    return { valid: false }
  }

  // QR code success callback
  const onQrCodeSuccess = (decodedText) => {
    console.log("QR code detected:", decodedText)

    // Check if the QR code contains any of our valid sequences
    const validationResult = containsValidQrSequence(decodedText)

    if (validationResult.found) {
      // Stop scanning
      stopQrScanner()

      // Process the valid QR code
      processValidQrCode(decodedText, validationResult)
    }
  }

  // QR code error callback
  const onQrCodeError = (errorMessage) => {
    // We don't need to do anything on error as the scanner will continue
    console.log("QR scan error:", errorMessage)
  }

  // Stop the QR scanner
  const stopQrScanner = () => {
    if (html5QrScannerRef.current) {
      try {
        // Check if it's an Html5QrcodeScanner instance
        if (html5QrScannerRef.current.clear) {
          html5QrScannerRef.current.clear()
          console.log("Html5QrcodeScanner stopped")
        }
        // Check if it's a ZXing reader
        else if (html5QrScannerRef.current.reset) {
          html5QrScannerRef.current.reset()
          console.log("ZXing scanner stopped")
        }
        // Check if it's an Html5Qrcode instance
        else if (html5QrScannerRef.current.stop) {
          html5QrScannerRef.current
            .stop()
            .then(() => {
              console.log("Html5Qrcode scanner stopped")
            })
            .catch((err) => {
              console.error("Error stopping QR scanner:", err)
            })
        }
        html5QrScannerRef.current = null
      } catch (error) {
        console.error("Error in stopQrScanner:", error)
      }
    }
  }

  // Switch to next available camera
  const switchCamera = async () => {
    if (availableCameras.length <= 1) return

    const nextCameraIndex = (currentCameraIndex + 1) % availableCameras.length
    setCurrentCameraIndex(nextCameraIndex)

    // Stop current stream
    stopCameraStream()

    // Start new stream with next camera
    await startCameraStream(availableCameras[nextCameraIndex].deviceId)
  }

  const handleCameraError = (error) => {
    console.error("Camera error:", error)
    if (error.name === "NotAllowedError") {
      setCameraError("Camera access was not allowed. Please check your browser settings.")
      toast({
        title: "Permission Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      })
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found on this device.")
      toast({
        title: "Camera Not Found",
        description: "No camera device was detected on your device.",
        variant: "destructive",
      })
    } else if (error.name === "NotReadableError") {
      setCameraError("Camera is in use by another application.")
      toast({
        title: "Camera Busy",
        description: "Your camera is being used by another application.",
        variant: "destructive",
      })
    } else {
      setCameraError(`Camera error: ${error.message || "Unknown error"}`)
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Update the camera activation to use the simpler approach with useEffect
  const activateCamera = async () => {
    if (isCameraLoading) {
      console.log("Camera is already loading, ignoring request")
      return
    }

    // Reset error state
    setCameraError("")
    setQrDetectionFailed(false)
    setIsCameraLoading(true)

    try {
      setCameraActive(true)
    } catch (err) {
      console.error("Error in camera activation:", err)
      handleCameraError(err)
    } finally {
      setIsCameraLoading(false)
    }
  }

  // Add camera access effect after the other useEffect hooks
  useEffect(() => {
    if (!cameraActive) return

    console.log("Camera active, accessing camera stream")
    console.log("videoRef.current:", videoRef.current)

    if (!videoRef.current) {
      console.warn("Video element ref still not available")
      setCameraError("Video element not available. Please try again.")
      setCameraActive(false)
      return
    }

    // Set camera facing mode based on device type
    const facingMode = isMobileDevice() ? "environment" : "user"
    console.log(`Using camera with facing mode: ${facingMode}`)

    navigator.mediaDevices
      .getUserMedia({
        video:
          availableCameras.length > 0 && availableCameras[currentCameraIndex]
            ? { deviceId: { exact: availableCameras[currentCameraIndex].deviceId } }
            : { facingMode },
      })
      .then((stream) => {
        console.log("Camera stream obtained successfully")
        streamRef.current = stream
        videoRef.current!.srcObject = stream

        // Initialize QR scanner
        const qrContainer = document.createElement("div")
        qrContainer.id = "qr-reader"
        qrContainer.style.position = "absolute"
        qrContainer.style.top = "0"
        qrContainer.style.left = "0"
        qrContainer.style.width = "100%"
        qrContainer.style.height = "100%"
        qrContainer.style.opacity = "0" // Make it invisible but functional

        // Add the QR container to the DOM
        if (videoContainerRef.current) {
          videoContainerRef.current.appendChild(qrContainer)

          // Initialize the QR scanner with improved configuration
          const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: false,
              aspectRatio: 1.0,
              formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Support all formats
              disableFlip: false, // Allow the scanner to try different orientations
              verbose: false, // Disable verbose logging to reduce console noise
            },
            /* verbose= */ false, // Set to false to reduce console noise
          )

          // Store the scanner reference for cleanup
          html5QrScannerRef.current = html5QrcodeScanner

          // Define success callback
          const onScanSuccess = (decodedText, decodedResult) => {
            console.log("Html5QrcodeScanner detected QR code:", decodedText)

            // Check if the QR code contains any of our valid sequences
            const validationResult = containsValidQrSequence(decodedText)

            if (validationResult.found) {
              // Process the valid QR code
              processValidQrCode(decodedText, validationResult)

              // Stop scanning
              if (html5QrScannerRef.current) {
                html5QrScannerRef.current.clear()
              }
            }
          }

          // Render the scanner
          html5QrcodeScanner.render(onScanSuccess, (errorMessage) => {
            // Ignore common scanning errors
            if (
              errorMessage.includes("QR code not found") ||
              errorMessage.includes("No MultiFormat Readers were able to detect the code") ||
              errorMessage.includes("No barcode or QR code detected")
            ) {
              return
            }
            console.error("QR scan error:", errorMessage)
          })

          setIsScanning(true)
        } else {
          console.warn("Video container ref not available for QR scanner")
        }
      })
      .catch((err) => {
        console.error("Failed to access camera", err)
        handleCameraError(err)
        setCameraActive(false)
      })

    // Cleanup function
    return () => {
      stopCameraStream()
    }
  }, [cameraActive, availableCameras, currentCameraIndex])

  const deactivateCamera = () => {
    setCameraActive(false)
  }

  // Check if a string contains any of the valid QR sequences
  const containsValidQrSequence = (text) => {
    if (!text) return { found: false }

    for (const sequence of VALID_QR_SEQUENCES) {
      if (text.includes(sequence)) {
        const qrType = sequence.includes("53034185802LA") ? "LAPNET" : "LAOQR"
        return {
          found: true,
          sequence: sequence,
          type: qrType,
        }
      }
    }

    return { found: false }
  }

  // Manual QR detection (for button click)
  const handleQrDetection = () => {
    // This is now just a fallback in case automatic detection doesn't work
    toast({
      title: "Scanning",
      description: "Looking for QR codes and text. Please hold the image steady.",
    })

    // Run OCR on the current camera feed
    if (cameraActive && videoRef.current) {
      runOcrOnCameraFeed()
    }

    // If no QR code was found after 5 seconds, show error
    setTimeout(() => {
      if (!qrDetected && cameraActive) {
        setQrDetectionFailed(true)
        setCameraError("")
        toast({
          title: "Invalid QR Code",
          description: "No valid QR code or text detected. Please try again.",
          variant: "destructive",
        })
      }
    }, 5000)
  }

  // UPDATED detectQrCodeLogo function to use multiple methods for file scanning
  const detectQrCodeLogo = async (imageFile) => {
    // Early return if no image file is provided
    if (!imageFile) {
      console.log("No image file provided to detectQrCodeLogo")
      return {
        success: false,
        error: "No image file provided",
      }
    }

    try {
      // Try multiple QR code detection methods
      console.log("Attempting to detect QR code using multiple methods...")

      // Method 1: Html5Qrcode library
      const html5QrResult = await detectQrCodeWithHtml5Qrcode(imageFile)
      if (html5QrResult.success) {
        console.log("QR code detected with Html5Qrcode:", html5QrResult)
        return html5QrResult
      }

      // Method 2: jsQR library with canvas
      const jsQrResult = await detectQrCodeWithJsQr(imageFile)
      if (jsQrResult.success) {
        console.log("QR code detected with jsQR:", jsQrResult)
        return jsQrResult
      }

      // Method 3: Try OCR as a fallback
      console.log("QR code detection failed with all methods, trying OCR...")
      const ocrResult = await performOcr(imageFile)

      if (ocrResult.success) {
        // Validate OCR text
        const ocrValidation = validateOcrText(ocrResult.text)

        if (ocrValidation.valid) {
          console.log(
            `OCR detected valid keywords for ${ocrValidation.type} with ${ocrValidation.confidence} confidence:`,
            ocrResult.text,
          )
          return {
            success: true,
            type: ocrValidation.type,
            sequence: "OCR_DETECTED", // Placeholder
            data: `OCR_DETECTED_${ocrValidation.type}_${Date.now()}`,
            method: "OCR",
            confidence: ocrValidation.confidence,
          }
        }
      }

      // If all methods failed
      return {
        success: false,
        error: "No valid QR code or text detected in the image",
      }
    } catch (error) {
      console.error("Error in detectQrCodeLogo:", error)
      return {
        success: false,
        error: "Error processing image: " + (error ? error.message || "Unknown error" : "Unknown error"),
      }
    }
  }

  // Detect QR code in file using Html5Qrcode
  const detectQrCodeWithHtml5Qrcode = async (imageFile) => {
    return new Promise((resolve) => {
      try {
        // Create a temporary HTML5QrCode instance for file scanning
        const html5QrCode = new Html5Qrcode("qr-reader-file", { verbose: false }) // Set verbose to false to reduce console noise

        html5QrCode
          .scanFile(imageFile, true)
          .then((decodedText) => {
            console.log("QR code detected in image with Html5Qrcode:", decodedText)

            // Check if the QR code contains any of our valid sequences
            const validationResult = containsValidQrSequence(decodedText)

            if (validationResult.found) {
              // Valid sequence found
              resolve({
                success: true,
                type: validationResult.type,
                sequence: validationResult.sequence,
                data: decodedText,
                method: "Html5Qrcode",
              })
            } else {
              // QR code found but no valid sequence
              resolve({
                success: false,
                error: "QR code found but it doesn't contain a valid payment sequence",
                qrData: decodedText,
              })
            }
          })
          .catch((error) => {
            console.log("Html5Qrcode could not detect a QR code, trying alternative methods")
            resolve({
              success: false,
              error: "Html5Qrcode could not detect a QR code",
            })
          })
      } catch (error) {
        // Handle any errors in the image processing
        console.error("Error processing image with Html5Qrcode:", error)
        resolve({
          success: false,
          error: "Error processing image with Html5Qrcode",
        })
      }
    })
  }

  // Detect QR code in file using jsQR
  const detectQrCodeWithJsQr = async (imageFile) => {
    return new Promise((resolve) => {
      try {
        const img = new Image()
        img.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Set canvas dimensions to match image
          canvas.width = img.width
          canvas.height = img.height

          // Draw image to canvas
          ctx.drawImage(img, 0, 0)

          // Get image data for QR code detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // Detect QR code using jsQR
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            console.log("QR code detected with jsQR:", code.data)

            // Check if the QR code contains any of our valid sequences
            const validationResult = containsValidQrSequence(code.data)

            if (validationResult.found) {
              // Valid sequence found
              resolve({
                success: true,
                type: validationResult.type,
                sequence: validationResult.sequence,
                data: code.data,
                method: "jsQR",
              })
            } else {
              // QR code found but no valid sequence
              resolve({
                success: false,
                error: "QR code found but it doesn't contain a valid payment sequence",
                qrData: code.data,
              })
            }
          } else {
            console.log("No QR code detected with jsQR")
            resolve({
              success: false,
              error: "jsQR could not detect a QR code",
            })
          }
        }

        img.onerror = () => {
          console.error("Error loading image for jsQR processing")
          resolve({
            success: false,
            error: "Error loading image for jsQR processing",
          })
        }

        // Set image source to file URL
        img.src = URL.createObjectURL(imageFile)
        img.crossOrigin = "anonymous"
      } catch (error) {
        console.error("Error in jsQR processing:", error)
        resolve({
          success: false,
          error: "Error in jsQR processing",
        })
      }
    })
  }

  // UPDATED checkImageForQrCode function to use real QR detection and OCR
  const checkImageForQrCode = async (imageFile) => {
    // Early return if no image file is provided
    if (!imageFile) {
      console.log("No image file provided to checkImageForQrCode")
      return {
        success: false,
        error: "No image file provided",
      }
    }

    // Check if the file is an image
    if (!imageFile.type.startsWith("image/")) {
      console.log("File is not an image:", imageFile.type)
      return {
        success: false,
        error: "The selected file is not an image. Please upload a QR code image.",
      }
    }

    try {
      // Check for valid QR code sequences or OCR text
      const detectionResult = await detectQrCodeLogo(imageFile)

      // Safely check the result without destructuring
      if (!detectionResult) {
        return {
          success: false,
          error: "No QR code detected in the image",
        }
      }

      if (!detectionResult.success) {
        return {
          success: false,
          error: detectionResult.error || "No valid QR code detected in the image",
          qrData: detectionResult.qrData,
        }
      }

      // Rest of the function remains the same...
      // If we have a valid detection result
      // Use safe property access
      const qrType = detectionResult.type || "LAOQR" // Default to LAOQR if type is missing
      const qrSequence = detectionResult.sequence || ""
      const qrData = detectionResult.data || ""
      const detectionMethod = detectionResult.method || "QR"
      const confidence = detectionResult.confidence || "medium"

      // Generate merchant info based on the QR type
      const merchantInfo = {
        id: `merchant_${Date.now()}`,
        name: qrType === "LAOQR" ? "BCEL One" : qrType === "COMBINED" ? "BCEL/LAPNet Payment" : "LAPNet Payment",
        reference: `inv_${Math.floor(Math.random() * 10000)}`,
        qrContent: qrData,
        qrType: qrType,
        accountNumber: qrType === "LAOQR" ? "092-12-00-xxxxx514-001" : "LAPNet-Account-123456",
        bankName: qrType === "LAOQR" ? "BCEL" : qrType === "COMBINED" ? "BCEL/LAPNet" : "LAPNet",
        detectionMethod: detectionMethod,
        detectionConfidence: confidence,
      }

      return {
        success: true,
        data: merchantInfo,
        type: qrType,
        method: detectionMethod,
        confidence: confidence,
      }
    } catch (error) {
      // Log the full error without destructuring
      console.error("Error in QR code checking:", error)

      // Return a safe error object
      return {
        success: false,
        error: "Error processing image: " + (error ? error.message || "Unknown error" : "Unknown error"),
      }
    }
  }

  // Function to upload QR code image to database
  const uploadQrImageToDatabase = async (imageFile, qrData) => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("qrData", JSON.stringify(qrData))
      formData.append("qrType", qrData.qrType || "unknown")
      formData.append("detectionMethod", qrData.detectionMethod || "QR")
      formData.append("timestamp", new Date().toISOString())

      // Call the server action to upload the image
      const result = await uploadImage(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to save image")
      }

      console.log("Image saved to database:", result.imageId)

      return {
        success: true,
        imageId: result.imageId,
        url: result.url,
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

  // REWRITTEN handleFileUpload function to avoid any destructuring
  const handleFileUpload = async (event) => {
    // Safely check if we have files
    if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
      console.log("No file selected")
      return
    }

    const file = event.target.files[0]
    if (!file) {
      console.log("File is undefined")
      return
    }

    // Reset states
    setQrDetectionFailed(false)
    setCameraError("")
    setDetectedQrType("")

    // Show loading state
    setIsFileLoading(true)

    try {
      // Check if the image contains a QR code or valid OCR text
      const checkResult = await checkImageForQrCode(file)

      // Safely check the result without destructuring
      if (!checkResult) {
        setQrDetectionFailed(true)
        setCameraError("No QR code detected in image")
        setQrDetected(false)
        setIsFileLoading(false)

        toast({
          title: "Invalid Image",
          description: "No QR code detected. Please try again with a valid QR code image.",
          variant: "destructive",
        })
        return
      }

      if (checkResult.success) {
        // Valid detection - existing code remains the same
        const merchantInfo = checkResult.data
        const qrType = checkResult.type
        const detectionMethod = checkResult.method || "QR"
        const confidence = checkResult.confidence || "medium"

        // Save image to database
        const uploadResult = await uploadQrImageToDatabase(file, merchantInfo)

        if (uploadResult && uploadResult.success) {
          console.log("QR code processing successful:", uploadResult.imageId)

          // Check if image upload was skipped due to missing Blob token
          if (uploadResult.skipUpload) {
            console.log("Image upload skipped - Blob storage not configured")
          } else {
            console.log("Image saved to database:", uploadResult.imageId)

            // Store the uploaded image reference
            setUploadedQrImage({
              file: file,
              id: uploadResult.imageId,
              url: uploadResult.url, // Store the URL from Vercel Blob
              type: qrType,
              method: detectionMethod,
              confidence: confidence,
            })
          }

          // Set QR data and proceed
          setQrValue(JSON.stringify(merchantInfo))
          setDetectedQrType(qrType)
          setMemo("")
          setQrDetected(true)
          setQrDetectionFailed(false)

          toast({
            title: `${qrType} ${detectionMethod === "OCR" ? "Text" : "QR Code"} Detected`,
            description: `Valid ${qrType} ${detectionMethod === "OCR" ? "text" : "QR code"} found with ${confidence} confidence.`,
          })
        } else {
          // Database upload failed but detection was valid
          console.error("Failed to save image:", uploadResult ? uploadResult.error : "Unknown error")

          // Still proceed with payment since detection was valid
          setQrValue(JSON.stringify(merchantInfo))
          setDetectedQrType(qrType)
          setMemo("")
          setQrDetected(true)
          setQrDetectionFailed(false)

          toast({
            title: `${qrType} ${detectionMethod === "OCR" ? "Text" : "QR Code"} Detected`,
            description: `Valid ${qrType} ${detectionMethod === "OCR" ? "text" : "QR code"} found with ${confidence} confidence.`,
          })
        }
      } else {
        // No valid detection - improved error message
        setQrDetectionFailed(true)
        setCameraError("No valid QR code detected")
        setQrDetected(false)

        toast({
          title: "Invalid QR Code",
          description: "The image does not contain a valid QR code. Please try again with a LAOQR or LAPNET code.",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Log the full error without destructuring
      console.error("Error processing image:", error)

      setQrDetectionFailed(true)
      setCameraError("Failed to process image")
      setQrDetected(false)

      toast({
        title: "Image Processing Failed",
        description: "Unable to process the image. Please try again with a different QR code image.",
        variant: "destructive",
      })
    } finally {
      setIsFileLoading(false)

      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Reset the QR detection process
  const resetQrDetection = () => {
    setQrDetected(false)
    setQrDetectionFailed(false)
    setQrValue("")
    setAmountLAK("")
    setAmountSats(0)
    setMemo("")
    setPaymentHash("")
    setPaymentRequest("")
    setPaymentCreated(false)
    setIsPaymentPaid(false)
    setUploadedQrImage(null)
    setDetectedQrType("")
    setOcrText("")
    setIsWaitingForBill(false)
    setBillRequestTime(null)
    stopCameraStream()

    // Clear any payment check interval
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval)
      setPaymentCheckInterval(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Copy payment request to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Payment request copied to clipboard",
      })

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!amountLAK || isNaN(Number(amountLAK)) || Number(amountLAK) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount in LAK",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the request payload
      const payload = {
        out: false,
        amount: amountSats, // Use the calculated satoshi amount
        memo: memo || `Payment of ${amountLAK} LAK`,
        expiry: 3600, // 1 hour expiry
        unit: "sat", // Using satoshis as the unit
        internal: false,
      }

      // Make the API request
      const response = await fetch("https://lnbits.de/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": "bee5341ef9a849a4a421dbd240c9d940",
        },
        body: JSON.stringify(payload),
      })

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API request failed with status ${response.status}`)
      }

      // Parse the response
      const data = await response.json()

      // Store the payment details
      setPaymentHash(data.payment_hash)
      setPaymentRequest(data.payment_request)
      setPaymentCreated(true)

      // If we have an uploaded QR image, associate it with the payment
      if (uploadedQrImage) {
        // In a real app, you would update the database record with the payment hash
        console.log("Associating image with payment:", {
          imageId: uploadedQrImage.id,
          paymentHash: data.payment_hash,
          qrType: uploadedQrImage.type || detectedQrType,
          method: uploadedQrImage.method || "QR",
        })

        // Simulate API call to update the record
        console.log("Database record updated with payment hash")
      }

      toast({
        title: "Payment Created",
        description: "Lightning invoice has been generated successfully",
      })
    } catch (error) {
      console.error("Payment API error:", error)
      toast({
        title: "Payment Creation Failed",
        description: error.message || "There was an error creating the payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manually check payment status (for the refresh button)
  const manualCheckPayment = () => {
    checkPaymentStatus()

    toast({
      title: "Checking Payment",
      description: "Verifying payment status...",
    })
  }

  // Handle Get Bill button click
  const handleGetBill = () => {
    setIsWaitingForBill(true)
    setBillRequestTime(new Date())

    toast({
      title: "Bill Requested",
      description: "Please wait while we process your bill. Do not leave this page.",
    })

    // Simulate bill processing (in a real app, this would be an API call)
    // For demo purposes, we'll just keep the waiting state active
  }

  // Create a hidden div for file scanning
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Check if the div already exists
      if (!document.getElementById("qr-reader-file")) {
        const fileReaderDiv = document.createElement("div")
        fileReaderDiv.id = "qr-reader-file"
        fileReaderDiv.style.display = "none"
        document.body.appendChild(fileReaderDiv)
      }
    }

    // Cleanup
    return () => {
      if (typeof document !== "undefined") {
        const fileReaderDiv = document.getElementById("qr-reader-file")
        if (fileReaderDiv) {
          document.body.removeChild(fileReaderDiv)
        }
      }
    }
  }, [])

  // Function to process a valid QR code
  const processValidQrCode = (decodedText, validationResult) => {
    // Extract the QR code type
    const qrType = validationResult?.type || "LAOQR"
    const confidence = validationResult?.confidence || "medium"

    // Generate merchant info based on the QR type
    const merchantInfo = {
      id: `merchant_${Date.now()}`,
      name: qrType === "LAOQR" ? "BCEL One" : qrType === "COMBINED" ? "BCEL/LAPNet Payment" : "LAPNet Payment",
      reference: `inv_${Math.floor(Math.random() * 10000)}`,
      qrContent: decodedText,
      qrType: qrType,
      accountNumber: qrType === "LAOQR" ? "092-12-00-xxxxx514-001" : "LAPNet-Account-123456",
      bankName: qrType === "LAOQR" ? "BCEL" : qrType === "COMBINED" ? "BCEL/LAPNet" : "LAPNet",
      detectionConfidence: confidence,
    }

    // Set the QR value and other states
    setQrValue(JSON.stringify(merchantInfo))
    setDetectedQrType(qrType)
    setMemo("")
    setQrDetected(true)
    setQrDetectionFailed(false)
    stopCameraStream()

    // Show success toast with confidence level
    toast({
      title: `${qrType} ${decodedText.startsWith("OCR_DETECTED") ? "Text" : "QR Code"} Detected`,
      description: `Valid ${qrType} ${decodedText.startsWith("OCR_DETECTED") ? "text" : "QR code"} found (${confidence} confidence).`,
    })
  }

  // Handle confirmation for finishing payment
  const handleFinishPayment = () => {
    setIsConfirmationOpen(true)
  }

  // Handle confirmation result
  const handleConfirmationResult = (confirmed) => {
    setIsConfirmationOpen(false)
    if (confirmed) {
      resetQrDetection()
    }
  }

  // Handle QR scan from the new QrScanner component
  const handleQrScan = (text) => {
    console.log("QR code scanned:", text)

    // Check if the QR code contains any of our valid sequences
    const validationResult = containsValidQrSequence(text)

    if (validationResult.found) {
      // Process the valid QR code
      processValidQrCode(text, validationResult)
    } else {
      // Invalid QR code test edit
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not a valid LAOQR or LAPNET code.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-20">
      <div className="mx-auto max-w-md space-y-6 w-full">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Pay with Bitcoin Lightning</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("pay.subtitle")}</p>
        </div>

        {!qrDetected ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="mr-2 h-5 w-5 text-amber-500" />
                {t("pay.scanQr.title")}
              </CardTitle>
              <CardDescription>{t("pay.scanQr.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 w-full">
                <div className="flex items-start">
                  <Info className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please scan QR code or upload QR code with logo LAOQR.
                  </p>
                </div>
              </div>

              {useNewScanner ? (
                // New QrScanner component
                <div className="w-full">
                  <QrScanner onScan={handleQrScan} />
                </div>
              ) : (
                // Original camera view
                <div className="relative h-64 w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  {cameraActive ? (
                    <>
                      <div
                        className="video-container absolute inset-0 h-full w-full rounded-lg"
                        ref={videoContainerRef}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-48 w-48 border-4 border-amber-500 rounded-lg opacity-70 animate-pulse"></div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {availableCameras.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white dark:bg-gray-800"
                            onClick={switchCamera}
                          >
                            <SwitchCamera className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white dark:bg-gray-800"
                          onClick={stopCameraStream}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative">
                        <Camera className="h-20 w-20 text-gray-300 dark:text-gray-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <QrCode className="h-10 w-10 text-amber-500 opacity-80" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Ready to scan QR code</p>
                    </div>
                  )}
                </div>
              )}

              {!useNewScanner && (
                <>
                  {cameraActive ? (
                    <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={stopCameraStream}>
                      <X className="mr-2 h-4 w-4" />
                      Stop Camera
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      onClick={() => setCameraActive(true)}
                      disabled={isCameraLoading}
                    >
                      {isCameraLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Activating Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          {t("pay.scanQr.activateCamera")}
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}

              <div className="relative w-full">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={isFileLoading}
                />
                <Button
                  variant="outline"
                  className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:text-amber-400 dark:border-amber-400"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isFileLoading}
                >
                  {isFileLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>

              {qrDetectionFailed && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md flex flex-col items-center justify-center">
                  <div className="flex items-center mb-2">
                    <X className="h-5 w-5 mr-2 text-red-500" />
                    <span className="font-medium">Invalid QR Code</span>
                  </div>
                  <p>
                    {cameraError ||
                      "No valid QR code detected in the image. Please try again with a valid LAOQR or LAPNET code."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      setQrDetectionFailed(false)
                      setCameraError("")
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              {cameraError && !qrDetectionFailed && (
                <div className="text-sm text-red-500 text-center">{cameraError}</div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="mr-2 h-5 w-5 text-amber-500" />
                {isWaitingForBill
                  ? "Waiting for Bill"
                  : paymentCreated
                    ? isPaymentPaid
                      ? "Payment Successful"
                      : "Payment Invoice"
                    : t("pay.qrDetected.title")}
              </CardTitle>
              <CardDescription>
                {isWaitingForBill
                  ? "Please wait while we process your bill"
                  : paymentCreated
                    ? isPaymentPaid
                      ? "Your payment has been successfully received"
                      : "Lightning Network payment invoice has been created"
                    : t("pay.qrDetected.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isWaitingForBill ? (
                // Waiting for Bill UI
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
                    <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-amber-500">Processing Your Bill</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Please wait while we process your payment and generate your bill.
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 w-full">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <span className="font-bold">Important:</span> Please do not close or refresh this page until
                        your bill is ready. Doing so may result in loss of your bill information.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 w-full">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Details</p>
                    <p className="font-medium">
                      Amount: {amountLAK} LAK ({amountSats.toLocaleString()} sats)
                    </p>
                    <p className="font-medium">Payment Hash: {paymentHash.substring(0, 10)}...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Request Time: {billRequestTime ? new Date(billRequestTime).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>
                </div>
              ) : !paymentCreated ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lak-amount">{t("pay.qrDetected.amount")}</Label>
                    <Input
                      id="lak-amount"
                      placeholder="0.00"
                      type="number"
                      inputMode="decimal"
                      value={amountLAK}
                      onChange={(e) => {
                        const value = e.target.value
                        if (Number(value) > 2000000) {
                          setAmountExceedsLimit(true)
                          toast({
                            title: "Amount Limit Exceeded",
                            description: "Maximum amount is 2,000,000 LAK",
                            variant: "destructive",
                          })
                        } else {
                          setAmountExceedsLimit(false)
                          setAmountLAK(value)
                        }
                      }}
                      max="2000000"
                      min="0"
                      className={amountExceedsLimit ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {amountExceedsLimit && (
                      <div className="text-sm text-red-500 flex items-center mt-1">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Maximum amount is 2,000,000 LAK
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memo">Payment Memo (Optional)</Label>
                    <Input
                      id="memo"
                      placeholder="Add a note to this payment"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("pay.qrDetected.bitcoinAmount")}
                        </p>
                        <p className="text-2xl font-bold text-amber-500">{amountSats.toLocaleString()} sats</p>
                      </div>
                      <div className="flex items-center">
                        <Bitcoin className="h-8 w-8 text-amber-500" />
                        {isLoadingRate && <RefreshCw className="ml-2 h-4 w-4 text-amber-500 animate-spin" />}
                      </div>
                    </div>
                    {rateError && <p className="text-xs text-red-500 mt-1">{rateError}</p>}
                  </div>
                </>
              ) : isPaymentPaid ? (
                // Payment Success UI
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-green-500">Payment Successful!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your payment of {amountSats.toLocaleString()} sats ({amountLAK} LAK) has been received.
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 w-full">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Hash</p>
                    <p className="font-mono text-sm break-all">{paymentHash}</p>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount Paid</p>
                        <p className="text-2xl font-bold text-amber-500">{amountSats.toLocaleString()} sats</p>
                      </div>
                      <Bitcoin className="h-8 w-8 text-amber-500" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Approximately {amountLAK} LAK</p>
                  </div>
                </div>
              ) : (
                // Payment Invoice UI (waiting for payment)
                <>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Hash</p>
                    <p className="font-mono text-sm break-all">{paymentHash}</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lightning Invoice</p>
                      <Button variant="ghost" size="sm" className="h-6 p-1" onClick={copyToClipboard}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="font-mono text-xs break-all">{paymentRequest}</p>
                  </div>

                  <div className="flex justify-center">
                    {paymentRequest && (
                      <div className="bg-white p-4 rounded-lg">
                        <Image
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentRequest)}&size=200x200&margin=10`}
                          alt="Lightning Invoice QR Code"
                          width={200}
                          height={200}
                          className="rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-2xl font-bold text-amber-500">{amountSats.toLocaleString()} sats</p>
                      </div>
                      <div className="flex items-center">
                        <Bitcoin className="h-8 w-8 text-amber-500" />
                        {isCheckingPayment && <RefreshCw className="ml-2 h-4 w-4 text-amber-500 animate-spin" />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Approximately {amountLAK} LAK</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 p-1 text-amber-500"
                        onClick={manualCheckPayment}
                        disabled={isCheckingPayment}
                      >
                        <RefreshCw className={`h-3 w-3 ${isCheckingPayment ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-500">
                      {isCheckingPayment
                        ? "Checking payment status..."
                        : "Waiting for payment. Scan the QR code with your Lightning wallet."}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {isWaitingForBill ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:text-amber-400 dark:border-amber-400"
                    onClick={handleFinishPayment}
                  >
                    Finish and Start New Payment
                  </Button>

                  {isConfirmationOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Do you want to finish this payment and start a new one?
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            className="w-full bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleConfirmationResult(true)}
                          >
                            Yes
                          </Button>
                          <Button variant="outline" className="w-full" onClick={() => handleConfirmationResult(false)}>
                            No
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : !paymentCreated ? (
                <>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting || isLoadingRate}
                  >
                    {isSubmitting ? "Processing..." : t("pay.qrDetected.payNow")}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={resetQrDetection}>
                    {t("pay.qrDetected.cancel")}
                  </Button>
                </>
              ) : isPaymentPaid ? (
                <>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={handleGetBill}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Get Payment Received
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:text-amber-400 dark:border-amber-400"
                    onClick={resetQrDetection}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    New Payment
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:text-amber-400 dark:border-amber-400"
                    onClick={resetQrDetection}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    New Payment
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
