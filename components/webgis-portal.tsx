"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Map,
  Satellite,
  Trees,
  Droplets,
  Home,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Download,
  Share2,
  Layers,
  MapPin,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react"
import { mockFRAClaims, mockAssets, mockVillages, mockRecommendations } from "@/lib/mock-data"

let L: any = null
if (typeof window !== "undefined") {
  import("leaflet").then((leaflet) => {
    L = leaflet.default
  })
}

export default function WebGISPortal() {
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedVillage, setSelectedVillage] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [activeLayers, setActiveLayers] = useState({
    fraClaims: true,
    assets: true,
    villages: true,
    boundaries: true,
    recommendations: true,
    heatmap: false, // Added heatmap layer
    clusters: false, // Added clustering option
  })
  const [claimTypeFilter, setClaimTypeFilter] = useState<string[]>(["IFR", "CFR", "CR"])
  const [statusFilter, setStatusFilter] = useState<string[]>(["granted", "pending", "verified", "rejected"])
  const [opacity, setOpacity] = useState([80])
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  const [mapStyle, setMapStyle] = useState<string>("osm") // Added map style selector
  const [showMeasurements, setShowMeasurements] = useState<boolean>(false) // Added measurement tools

  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerGroupsRef = useRef<any>({})

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"]
  const districts = ["Mandla", "West Tripura", "Mayurbhanj", "Warangal"]

  const filteredClaims = mockFRAClaims.filter((claim) => {
    const stateMatch = selectedState === "all" || claim.state === selectedState
    const districtMatch = selectedDistrict === "all" || claim.district === selectedDistrict
    const villageMatch = selectedVillage === "all" || claim.villageName === selectedVillage
    const typeMatch = claimTypeFilter.includes(claim.claimType)
    const statusMatch = statusFilter.includes(claim.status)
    const searchMatch =
      searchQuery === "" ||
      claim.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.pattalHolderName.toLowerCase().includes(searchQuery.toLowerCase())
    return stateMatch && districtMatch && villageMatch && typeMatch && statusMatch && searchMatch
  })

  const generateLandParcelBoundary = (centerLat: number, centerLng: number, areaHectares: number) => {
    const radiusKm = Math.sqrt(areaHectares / Math.PI) / 100
    const radiusDeg = radiusKm / 111

    const points = []
    const numPoints = 8
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI
      const variation = 0.3 + Math.random() * 0.7
      const lat = centerLat + radiusDeg * variation * Math.cos(angle)
      const lng = centerLng + radiusDeg * variation * Math.sin(angle)
      points.push([lat, lng])
    }
    return points
  }

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      import("leaflet").then((leaflet) => {
        const L = leaflet.default

        const map = L.map(mapRef.current, {
          zoomControl: false, // Custom zoom controls
          attributionControl: false,
        }).setView([22.9734, 78.6569], 6)

        const baseLayers = {
          OpenStreetMap: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }),
          Satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "© Esri, Maxar, GeoEye, Earthstar Geographics",
            },
          ),
          Terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenTopoMap contributors",
          }),
          Dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: "© CARTO",
          }),
        }

        // Set default layer
        baseLayers["OpenStreetMap"].addTo(map)

        const layerControl = L.control
          .layers(
            baseLayers,
            {},
            {
              position: "topright",
              collapsed: false,
            },
          )
          .addTo(map)

        L.control
          .zoom({
            position: "bottomright",
          })
          .addTo(map)

        L.control
          .scale({
            position: "bottomleft",
          })
          .addTo(map)

        // Create enhanced layer groups
        layerGroupsRef.current = {
          fraClaims: L.layerGroup().addTo(map),
          assets: L.layerGroup().addTo(map),
          villages: L.layerGroup().addTo(map),
          boundaries: L.layerGroup().addTo(map),
          recommendations: L.layerGroup().addTo(map),
          heatmap: L.layerGroup(), // Added heatmap layer group
          clusters: L.layerGroup(), // Added cluster layer group
        }

        mapInstanceRef.current = map
        updateMapLayers()

        map.on("click", (e: any) => {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          console.log("[v0] Map clicked at:", e.latlng)
        })
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const updateMapLayers = () => {
    if (!L || !mapInstanceRef.current || !layerGroupsRef.current) return

    Object.values(layerGroupsRef.current).forEach((layerGroup: any) => {
      layerGroup.clearLayers()
    })

    if (activeLayers.boundaries) {
      filteredClaims.forEach((claim) => {
        const boundary = generateLandParcelBoundary(
          claim.coordinates.latitude,
          claim.coordinates.longitude,
          claim.areaHectares,
        )

        const color = getClaimStatusColor(claim.status).replace("bg-", "").replace("-500", "")
        const colorMap: any = {
          green: "#10b981",
          blue: "#3b82f6",
          yellow: "#f59e0b",
          red: "#ef4444",
          gray: "#6b7280",
        }

        const polygon = L.polygon(boundary, {
          color: colorMap[color] || "#6b7280",
          fillColor: colorMap[color] || "#6b7280",
          fillOpacity: 0.3,
          weight: 2,
          className: "land-parcel-boundary", // Added CSS class for styling
        })

        polygon.bindPopup(
          `
          <div class="p-4 max-w-sm bg-white rounded-lg shadow-lg">
            <div class="flex items-center space-x-2 mb-3 border-b pb-2">
              <div class="w-4 h-4 rounded-full border-2 border-white shadow-sm" style="background-color: ${colorMap[color] || "#6b7280"}"></div>
              <h3 class="font-bold text-lg text-gray-900">${claim.villageName}</h3>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">${claim.claimType}</span>
            </div>
            
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <div class="text-xs text-gray-500">Owner</div>
                    <div class="font-medium text-sm">${claim.pattalHolderName}</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <div class="text-xs text-gray-500">Area</div>
                    <div class="font-medium text-sm">${claim.areaHectares} ha</div>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between pt-2 border-t">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">Status:</span>
                  <span class="px-2 py-1 rounded text-xs font-medium" style="background-color: ${colorMap[color]}20; color: ${colorMap[color]}">${claim.status}</span>
                </div>
                <div class="text-xs text-gray-500">${claim.submissionDate}</div>
              </div>
              
              ${
                claim.documents
                  ? `
                <div class="pt-2 border-t">
                  <div class="text-xs text-gray-500 mb-1">Documents (${claim.documents.length})</div>
                  <div class="flex flex-wrap gap-1">
                    ${claim.documents
                      .slice(0, 3)
                      .map(
                        (doc: string) =>
                          `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${doc.split(".")[0]}</span>`,
                      )
                      .join("")}
                    ${claim.documents.length > 3 ? `<span class="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">+${claim.documents.length - 3} more</span>` : ""}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `,
          {
            maxWidth: 350,
            className: "custom-popup",
          },
        )

        polygon.on("click", (e: any) => {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          setSelectedFeature({ ...claim, type: "claim", boundary })
        })

        layerGroupsRef.current.boundaries.addLayer(polygon)
      })
    }

    // Add FRA Claims (as markers on top of boundaries)
    if (activeLayers.fraClaims) {
      filteredClaims.forEach((claim) => {
        const color = getClaimStatusColor(claim.status).replace("bg-", "").replace("-500", "")
        const colorMap: any = {
          green: "#10b981",
          blue: "#3b82f6",
          yellow: "#f59e0b",
          red: "#ef4444",
          gray: "#6b7280",
        }

        const marker = L.circleMarker([claim.coordinates.latitude, claim.coordinates.longitude], {
          radius: 6,
          fillColor: colorMap[color] || "#6b7280",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: opacity[0] / 100,
        })

        marker.on("click", () => setSelectedFeature({ ...claim, type: "claim" }))
        layerGroupsRef.current.fraClaims.addLayer(marker)
      })
    }

    if (activeLayers.assets) {
      mockAssets.forEach((asset) => {
        const iconMap: any = {
          Forest: "🌲",
          Water: "💧",
          Agriculture: "🌾",
          Settlements: "🏠",
          Degraded: "⚠️",
        }

        const marker = L.marker([asset.coordinates.latitude, asset.coordinates.longitude], {
          icon: L.divIcon({
            html: `<div style="font-size: 24px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">${iconMap[asset.landUseType] || "📍"}</div>`,
            className: "custom-div-icon",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        })

        marker.bindPopup(`
          <div class="p-4 max-w-sm">
            <div class="flex items-center space-x-2 mb-3">
              <span style="font-size: 24px;">${iconMap[asset.landUseType] || "📍"}</span>
              <h3 class="font-bold text-lg">${asset.landUseType} Asset</h3>
            </div>
            
            <div class="space-y-2 mb-3">
              <div class="flex items-center justify-between">
                <span class="font-medium">Coverage Area:</span>
                <span>${asset.areaHectares} hectares</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-medium">AI Confidence:</span>
                <div class="flex items-center space-x-2">
                  <div class="w-16 h-2 bg-gray-200 rounded">
                    <div class="h-2 bg-green-500 rounded" style="width: ${asset.confidence * 100}%"></div>
                  </div>
                  <span class="text-sm">${(asset.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-medium">Data Source:</span>
                <span class="text-sm">${asset.satelliteSource}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-medium">Last Updated:</span>
                <span class="text-sm">${asset.lastUpdated}</span>
              </div>
            </div>
            
            <div class="pt-3 border-t border-gray-200">
              <span class="text-xs text-gray-600">Coordinates: ${asset.coordinates.latitude.toFixed(4)}, ${asset.coordinates.longitude.toFixed(4)}</span>
            </div>
          </div>
        `)

        marker.on("click", () => setSelectedFeature({ ...asset, type: "asset" }))
        layerGroupsRef.current.assets.addLayer(marker)
      })
    }

    if (activeLayers.recommendations) {
      mockRecommendations.forEach((rec) => {
        const village = mockVillages.find((v) => v.id === rec.villageId)
        if (!village) return

        const priorityColors: any = {
          High: "#ef4444",
          Medium: "#f59e0b",
          Low: "#10b981",
        }

        const schemeIcons: any = {
          "PM-KISAN": "🌾",
          "Jal Jeevan Mission": "💧",
          MGNREGA: "🏗️",
          "Forest Conservation": "🌳",
        }

        const marker = L.marker([village.coordinates.latitude, village.coordinates.longitude], {
          icon: L.divIcon({
            html: `
              <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white shadow-lg" style="border-color: ${priorityColors[rec.priority]}">
                <span style="font-size: 16px;">${schemeIcons[rec.recommendationType] || "📋"}</span>
              </div>
            `,
            className: "custom-recommendation-icon",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        })

        marker.bindPopup(`
          <div class="p-4 max-w-sm">
            <div class="flex items-center space-x-2 mb-3">
              <span style="font-size: 24px;">${schemeIcons[rec.recommendationType] || "📋"}</span>
              <div>
                <h3 class="font-bold text-lg">${rec.recommendationType}</h3>
                <p class="text-sm text-gray-600">${rec.villageName}</p>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">Priority:</span>
                <span class="px-2 py-1 rounded text-xs text-white" style="background-color: ${priorityColors[rec.priority]}">${rec.priority}</span>
              </div>
              
              <div class="mb-2">
                <span class="font-medium text-sm">Reasoning:</span>
                <p class="text-sm text-gray-700 mt-1">${rec.reasoning}</p>
              </div>
              
              <div class="mb-2">
                <span class="font-medium text-sm">Expected Benefit:</span>
                <p class="text-sm text-green-700 font-medium mt-1">${rec.estimatedBenefit}</p>
              </div>
            </div>
            
            <div class="pt-3 border-t border-gray-200">
              <span class="text-xs text-gray-600">Generated: ${rec.generatedDate}</span>
              <br>
              <span class="text-xs text-gray-600">${rec.implementationSteps.length} implementation steps</span>
            </div>
          </div>
        `)

        marker.on("click", () => setSelectedFeature({ ...rec, type: "recommendation", village }))
        layerGroupsRef.current.recommendations.addLayer(marker)
      })
    }

    // Add Villages
    if (activeLayers.villages) {
      mockVillages.forEach((village) => {
        const marker = L.marker([village.coordinates.latitude, village.coordinates.longitude], {
          icon: L.divIcon({
            html: `<div class="bg-white px-2 py-1 rounded shadow-sm text-xs border flex items-center">
              <span class="mr-1">📍</span>${village.name}
            </div>`,
            className: "custom-village-icon",
            iconSize: [120, 30],
            iconAnchor: [60, 15],
          }),
        })

        marker.bindPopup(`
          <div class="p-4 max-w-sm">
            <h3 class="font-bold text-lg mb-3">${village.name}</h3>
            
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div class="text-center p-2 bg-blue-50 rounded">
                <div class="text-lg font-bold text-blue-900">${village.population?.toLocaleString()}</div>
                <div class="text-xs text-blue-700">Population</div>
              </div>
              
              <div class="text-center p-2 bg-green-50 rounded">
                <div class="text-lg font-bold text-green-900">${village.forestCover}%</div>
                <div class="text-xs text-green-700">Forest Cover</div>
              </div>
              
              <div class="text-center p-2 bg-cyan-50 rounded">
                <div class="text-lg font-bold text-cyan-900">${village.waterIndex}</div>
                <div class="text-xs text-cyan-700">Water Index</div>
              </div>
              
              <div class="text-center p-2 bg-purple-50 rounded">
                <div class="text-lg font-bold text-purple-900">${village.claims?.length || 0}</div>
                <div class="text-xs text-purple-700">FRA Claims</div>
              </div>
            </div>
            
            <div class="pt-3 border-t border-gray-200">
              <div class="text-sm">
                <span class="font-medium">District:</span> ${village.district}<br>
                <span class="font-medium">State:</span> ${village.state}
              </div>
            </div>
          </div>
        `)

        marker.on("click", () => setSelectedFeature({ ...village, type: "village" }))
        layerGroupsRef.current.villages.addLayer(marker)
      })
    }

    if (activeLayers.heatmap && filteredClaims.length > 0) {
      const heatmapData = filteredClaims.map((claim) => [
        claim.coordinates.latitude,
        claim.coordinates.longitude,
        claim.areaHectares / 10, // Intensity based on area
      ])

      // Note: In a real implementation, you'd use L.heatLayer from leaflet.heat plugin
      // For now, we'll create density circles
      heatmapData.forEach(([lat, lng, intensity]) => {
        const circle = L.circle([lat, lng], {
          radius: intensity * 1000,
          fillColor: "#ff7800",
          color: "#ff7800",
          weight: 1,
          opacity: 0.3,
          fillOpacity: 0.2,
        })
        layerGroupsRef.current.heatmap.addLayer(circle)
      })
    }
  }

  useEffect(() => {
    updateMapLayers()
  }, [filteredClaims, activeLayers, opacity])

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return

    Object.entries(activeLayers).forEach(([layerName, isActive]) => {
      const layerGroup = layerGroupsRef.current[layerName]
      if (layerGroup) {
        if (isActive && !mapInstanceRef.current.hasLayer(layerGroup)) {
          mapInstanceRef.current.addLayer(layerGroup)
        } else if (!isActive && mapInstanceRef.current.hasLayer(layerGroup)) {
          mapInstanceRef.current.removeLayer(layerGroup)
        }
      }
    })
  }, [activeLayers])

  // Update map style based on selection
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const baseLayersMap: { [key: string]: L.TileLayer } = {
      osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }),
      satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri, Maxar, GeoEye, Earthstar Geographics" },
      ),
      terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors",
      }),
      dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© CARTO" }),
    }

    // Remove existing base layer
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (
        layer instanceof L.TileLayer &&
        !layer.options.attribution.includes("OpenStreetMap contributors") &&
        !layer.options.attribution.includes("Esri") &&
        !layer.options.attribution.includes("OpenTopoMap") &&
        !layer.options.attribution.includes("CARTO")
      ) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Add new base layer
    if (baseLayersMap[mapStyle]) {
      baseLayersMap[mapStyle].addTo(mapInstanceRef.current)
    }
  }, [mapStyle])

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return "bg-green-500"
      case "verified":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "Forest":
        return <Trees className="h-4 w-4 text-green-600" />
      case "Water":
        return <Droplets className="h-4 w-4 text-blue-600" />
      case "Settlements":
        return <Home className="h-4 w-4 text-gray-600" />
      case "Degraded":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Satellite className="h-4 w-4 text-yellow-600" />
    }
  }

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }

  const toggleClaimType = (type: string) => {
    setClaimTypeFilter((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.9734, 78.6569], 6)
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      claims: filteredClaims,
      timestamp: new Date().toISOString(),
      filters: {
        state: selectedState,
        district: selectedDistrict,
        village: selectedVillage,
        claimTypes: claimTypeFilter,
        statuses: statusFilter,
      },
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fra-claims-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareMap = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "FRA Atlas - WebGIS Portal",
          text: `Viewing ${filteredClaims.length} FRA claims in the WebGIS portal`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Map URL copied to clipboard!")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`space-y-6 transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}>
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Map className="h-6 w-6 text-blue-600" />
            <span>WebGIS Portal</span>
          </h2>
          <p className="text-slate-600">Interactive mapping interface for FRA claims and asset visualization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <BarChart3 className="h-3 w-3 mr-1" />
            {filteredClaims.length} Claims
          </Badge>
          <Button size="sm" variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={handleShareMap}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${isFullscreen ? "grid-cols-5" : "grid-cols-1 lg:grid-cols-4"}`}>
        <div className={`space-y-4 ${isFullscreen ? "col-span-1" : "lg:col-span-1"}`}>
          {/* Search and Quick Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search villages, owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={statusFilter.includes("granted") ? "default" : "outline"}
                  onClick={() => toggleStatus("granted")}
                  className="text-xs"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Granted
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter.includes("pending") ? "default" : "outline"}
                  onClick={() => toggleStatus("pending")}
                  className="text-xs"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                  Pending
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Map Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateMapLayers()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Layer Opacity</label>
                <Slider value={opacity} onValueChange={setOpacity} max={100} step={10} className="w-full" />
                <p className="text-xs text-slate-600">{opacity[0]}%</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Map Style</label>
                <Select value={mapStyle} onValueChange={setMapStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="osm">OpenStreetMap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>Layer Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(activeLayers).map(([layer, active]) => (
                <div key={layer} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={active} onCheckedChange={() => toggleLayer(layer)} />
                    <span className="text-sm capitalize flex items-center space-x-1">
                      {layer === "fraClaims" && <MapPin className="h-3 w-3" />}
                      {layer === "assets" && <Satellite className="h-3 w-3" />}
                      {layer === "villages" && <Home className="h-3 w-3" />}
                      {layer === "boundaries" && <Map className="h-3 w-3" />}
                      {layer === "recommendations" && <AlertTriangle className="h-3 w-3" />}
                      <span>{layer.replace(/([A-Z])/g, " $1")}</span>
                    </span>
                  </div>
                  {active ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Geographic Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Geographic Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Claim Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["IFR", "CFR", "CR"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox checked={claimTypeFilter.includes(type)} onCheckedChange={() => toggleClaimType(type)} />
                  <span className="text-sm">{type}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["granted", "pending", "verified", "rejected"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox checked={statusFilter.includes(status)} onCheckedChange={() => toggleStatus(status)} />
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getClaimStatusColor(status)}`} />
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className={`${isFullscreen ? "col-span-4" : "lg:col-span-3"}`}>
          <Card className={`${isFullscreen ? "h-screen" : "h-[800px]"} shadow-lg border-2`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  <span>Interactive Map</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Live Data
                  </Badge>
                  <Badge variant="outline">Enhanced WebGIS</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full p-0">
              <div
                ref={mapRef}
                className="w-full h-full rounded-b-lg border-t"
                style={{ minHeight: isFullscreen ? "calc(100vh - 120px)" : "700px" }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Information Panel */}
      {selectedFeature && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Feature Information</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setSelectedFeature(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
                <TabsTrigger value="related">Related Data</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {selectedFeature.type === "claim" ? (
                  // FRA Claim Details
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Village</label>
                      <p className="text-lg font-semibold">{selectedFeature.villageName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Patta Holder</label>
                      <p className="text-lg font-semibold">{selectedFeature.pattalHolderName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Claim Type</label>
                      <Badge variant="outline">{selectedFeature.claimType}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <Badge
                        variant={
                          selectedFeature.status === "granted"
                            ? "default"
                            : selectedFeature.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {selectedFeature.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Area</label>
                      <p>{selectedFeature.areaHectares} hectares</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Coordinates</label>
                      <p>
                        {selectedFeature.coordinates.latitude}, {selectedFeature.coordinates.longitude}
                      </p>
                    </div>
                    {selectedFeature.documents && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Documents</label>
                        <div className="mt-1">
                          {selectedFeature.documents.map((doc: string) => (
                            <div key={doc} className="text-xs text-blue-600">
                              📄 {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedFeature.type === "asset" ? (
                  // Asset Details
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Land Use Type</label>
                      <div className="flex items-center space-x-2">
                        {getAssetTypeIcon(selectedFeature.landUseType)}
                        <span className="text-lg font-semibold">{selectedFeature.landUseType}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Area</label>
                      <p className="text-lg font-semibold">{selectedFeature.areaHectares} hectares</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">AI Confidence</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded">
                          <div
                            className="h-2 bg-green-500 rounded"
                            style={{ width: `${selectedFeature.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(selectedFeature.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Data Source</label>
                      <p>{selectedFeature.satelliteSource}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Last Updated</label>
                      <p>{selectedFeature.lastUpdated}</p>
                    </div>
                  </div>
                ) : selectedFeature.type === "village" ? (
                  // Village Details
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Village Name</label>
                      <p className="text-lg font-semibold">{selectedFeature.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Population</label>
                      <p className="text-lg font-semibold">{selectedFeature.population?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Forest Cover</label>
                      <p>{selectedFeature.forestCover}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Water Index</label>
                      <p>{selectedFeature.waterIndex}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">FRA Claims</label>
                      <p>{selectedFeature.claims?.length || 0}</p>
                    </div>
                  </div>
                ) : selectedFeature.type === "recommendation" ? (
                  // Recommendation Details
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Recommendation Type</label>
                      <div className="flex items-center space-x-2">
                        <span style={{ fontSize: "24px" }}>{getAssetTypeIcon(selectedFeature.recommendationType)}</span>
                        <span className="text-lg font-semibold">{selectedFeature.recommendationType}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Priority</label>
                      <span
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{
                          backgroundColor: getClaimStatusColor(selectedFeature.priority)
                            .replace("bg-", "")
                            .replace("-500", ""),
                        }}
                      >
                        {selectedFeature.priority}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Reasoning</label>
                      <p className="text-sm text-gray-700 mt-1">{selectedFeature.reasoning}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Expected Benefit</label>
                      <p className="text-sm text-green-700 font-medium mt-1">{selectedFeature.estimatedBenefit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Generated Date</label>
                      <p>{selectedFeature.generatedDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Implementation Steps</label>
                      <p>{selectedFeature.implementationSteps.length}</p>
                    </div>
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="attributes">
                <div className="space-y-2">
                  {Object.entries(selectedFeature).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-sm text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="text-sm font-medium">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="related">
                <p className="text-sm text-slate-600">
                  Related data and cross-references would be displayed here, including linked claims, nearby assets, and
                  policy recommendations.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
