"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QrScanner from "./qr-scanner"

export default function QrTest() {
  const [scannedText, setScannedText] = useState<string | null>(null)

  const handleScan = (text: string) => {
    console.log("QR code scanned:", text)
    setScannedText(text)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Scanner Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QrScanner onScan={handleScan} />

        {scannedText && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="font-medium">Scanned QR Code:</p>
            <p className="text-sm break-all">{scannedText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
