"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Info, ZoomIn, Compass } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function MapsPage() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Set map as loaded after component mounts
    setMapLoaded(true)

    // Add viewport meta tag for better mobile rendering if not already present
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (!viewportMeta) {
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      document.head.appendChild(meta)
    }

    // Clean up function
    return () => {
      // Reset any fullscreen state when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => console.error(err))
      }
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      const mapContainer = document.getElementById("map-container")
      if (!mapContainer) return

      if (!document.fullscreenElement) {
        await mapContainer.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen API error:", err)
    }
  }

  return (
    <div className="container py-6 md:py-10 px-4 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Merchant Locations</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Find stores and businesses that accept Lightning Network payments in Laos
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <MapPin className="mr-2 h-5 w-5 text-amber-500" />
              Lightning Network Merchants Map
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Explore merchants that accept Lightning Network payments in Vientiane
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div id="map-container" className="relative aspect-[4/3] md:aspect-video w-full overflow-hidden">
              {mapLoaded ? (
                <>
                  <iframe
                    src="https://www.google.com/maps/d/embed?mid=1yaCpDjNZ5yWDz9JFQ4GoINpvK8KsSJ8&ehbc=2E312F"
                    width="100%"
                    height="100%"
                    style={{ position: "absolute", top: 0, left: 0, border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lightning Network Merchants in Laos"
                    aria-label="Map showing Lightning Network merchant locations in Laos"
                  ></iframe>

                  {/* Mobile-friendly map controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      <ZoomIn className="h-5 w-5 text-gray-700" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white"
                      onClick={() => {
                        // This is just a visual indicator - actual zoom is handled by the iframe
                        const iframe = document.querySelector("iframe")
                        if (iframe) {
                          iframe.focus()
                        }
                      }}
                      aria-label="Center map"
                    >
                      <Compass className="h-5 w-5 text-gray-700" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Image
                    src="/map-preview.jpeg"
                    alt="Map Preview"
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              )}
            </div>
            <div className="p-4 flex items-start rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs md:text-sm m-4">
              <Info className="mr-2 h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <CardDescription className="text-xs md:text-sm dark:text-gray-400">
                Tap on any marker to see details about the merchant. You can pinch to zoom in/out and drag the map to
                explore different areas.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
