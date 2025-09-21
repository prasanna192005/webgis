"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Satellite, Map, Download, Layers, Calendar, MapPin } from "lucide-react"
import { mockAssets } from "@/lib/mock-data"

export default function AssetMapping() {
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedLandUse, setSelectedLandUse] = useState<string>("all")
  const [processing, setProcessing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(mockAssets)
  const [classificationProgress, setClassificationProgress] = useState(0)

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"]
  const landUseTypes = ["Agriculture", "Forest", "Water", "Settlements", "Degraded"]

  const simulateImageAnalysis = async () => {
    setProcessing(true)
    setClassificationProgress(0)

    // Simulate progressive analysis
    const intervals = [20, 45, 70, 85, 100]
    for (const progress of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setClassificationProgress(progress)
    }

    setProcessing(false)
  }

  const filteredAssets = analysisResults.filter((asset) => {
    const stateMatch = selectedState === "all" || true // Mock filtering
    const landUseMatch = selectedLandUse === "all" || asset.landUseType === selectedLandUse
    return stateMatch && landUseMatch
  })

  const getLandUseColor = (type: string) => {
    switch (type) {
      case "Forest":
        return "bg-green-100 text-green-800 border-green-200"
      case "Agriculture":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Water":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Settlements":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Degraded":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const exportGeoJSON = () => {
    const geoJSON = {
      type: "FeatureCollection",
      features: filteredAssets.map((asset) => ({
        type: "Feature",
        properties: {
          id: asset.id,
          landUseType: asset.landUseType,
          areaHectares: asset.areaHectares,
          confidence: asset.confidence,
          lastUpdated: asset.lastUpdated,
          satelliteSource: asset.satelliteSource,
        },
        geometry: {
          type: "Point",
          coordinates: [asset.coordinates.longitude, asset.coordinates.latitude],
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "asset_mapping_data.geojson"
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Asset Mapping System</h2>
          <p className="text-slate-600">AI-powered land-use classification from satellite imagery</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {analysisResults.length} Assets Mapped
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Satellite Analysis</TabsTrigger>
          <TabsTrigger value="classification">Land Use Classification</TabsTrigger>
          <TabsTrigger value="results">Mapping Results</TabsTrigger>
          <TabsTrigger value="export">Export Layers</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satellite Data Sources</CardTitle>
                <CardDescription>Configure satellite imagery sources and analysis parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Satellite Source</label>
                  <Select defaultValue="sentinel-2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sentinel-2">Sentinel-2 (10m resolution)</SelectItem>
                      <SelectItem value="landsat-8">Landsat-8 (30m resolution)</SelectItem>
                      <SelectItem value="modis">MODIS (250m resolution)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Analysis Period</label>
                  <Select defaultValue="2024">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024 (Latest)</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Target States</label>
                  <div className="grid grid-cols-2 gap-2">
                    {states.map((state) => (
                      <div key={state} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{state}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={simulateImageAnalysis} disabled={processing} className="w-full">
                  {processing ? "Analyzing Imagery..." : "Start Satellite Analysis"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Progress</CardTitle>
                <CardDescription>Real-time satellite imagery processing status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Satellite className="h-5 w-5 text-blue-600 animate-pulse" />
                      <span className="text-sm font-medium">Processing satellite imagery...</span>
                    </div>
                    <Progress value={classificationProgress} className="w-full" />
                    <p className="text-xs text-slate-600">
                      {classificationProgress < 30
                        ? "Downloading satellite tiles..."
                        : classificationProgress < 60
                          ? "Applying machine learning models..."
                          : classificationProgress < 90
                            ? "Classifying land use types..."
                            : "Generating confidence scores..."}
                    </p>
                  </div>
                )}

                {!processing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Last Updated</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">January 15, 2024</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Coverage</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">4 States Mapped</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-900">Processing Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Images Processed</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Area Covered</span>
                          <span className="font-medium">236.8 km²</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Average Confidence</span>
                          <span className="font-medium">88.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classification">
          <Card>
            <CardHeader>
              <CardTitle>Land Use Classification Results</CardTitle>
              <CardDescription>AI-powered classification of satellite imagery into land use categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Classification Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {landUseTypes.map((type) => {
                    const count = analysisResults.filter((asset) => asset.landUseType === type).length
                    const totalArea = analysisResults
                      .filter((asset) => asset.landUseType === type)
                      .reduce((sum, asset) => sum + asset.areaHectares, 0)

                    return (
                      <div key={type} className={`p-4 rounded-lg border ${getLandUseColor(type)}`}>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-sm font-medium">{type}</p>
                          <p className="text-xs mt-1">{totalArea.toFixed(1)} ha</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Classification Model Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Classification Model Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Model Type:</span>
                      <p className="font-medium">Random Forest Classifier</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Training Data:</span>
                      <p className="font-medium">50,000+ labeled samples</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Accuracy:</span>
                      <p className="font-medium">92.3% validation accuracy</p>
                    </div>
                  </div>
                </div>

                {/* Feature Importance */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Spectral Band Importance</h4>
                  <div className="space-y-2">
                    {[
                      { band: "Near Infrared (NIR)", importance: 0.35 },
                      { band: "Red Edge", importance: 0.28 },
                      { band: "Short Wave Infrared (SWIR)", importance: 0.22 },
                      { band: "Red", importance: 0.15 },
                    ].map((item) => (
                      <div key={item.band} className="flex items-center space-x-3">
                        <span className="text-sm text-slate-600 w-48">{item.band}</span>
                        <div className="flex-1">
                          <Progress value={item.importance * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12">{(item.importance * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Mapping Results</CardTitle>
                  <CardDescription>Classified land use assets with confidence scores</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedLandUse} onValueChange={setSelectedLandUse}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {landUseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} className="border-slate-200">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Land Use Type
                          </label>
                          <Badge className={getLandUseColor(asset.landUseType)}>{asset.landUseType}</Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Area</label>
                          <p className="text-sm font-medium text-slate-900">{asset.areaHectares} hectares</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Confidence
                          </label>
                          <div className="flex items-center space-x-2">
                            <Progress value={asset.confidence * 100} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{(asset.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Coordinates
                          </label>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <p className="text-sm font-medium text-slate-900">
                              {asset.coordinates.latitude.toFixed(4)}, {asset.coordinates.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Last Updated
                          </label>
                          <p className="text-sm font-medium text-slate-900">{asset.lastUpdated}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Source</label>
                          <p className="text-sm font-medium text-slate-900">{asset.satelliteSource}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Asset Layers</CardTitle>
              <CardDescription>Download classified asset data in GIS-compatible formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Export Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Map className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Total Assets</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">{filteredAssets.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Land Use Types</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">{landUseTypes.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Satellite className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Coverage Area</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {filteredAssets.reduce((sum, asset) => sum + asset.areaHectares, 0).toFixed(0)} ha
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Avg Confidence</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 mt-2">
                      {(
                        (filteredAssets.reduce((sum, asset) => sum + asset.confidence, 0) / filteredAssets.length) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Export Formats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={exportGeoJSON}
                      variant="outline"
                      className="flex items-center space-x-2 h-12 bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">GeoJSON</p>
                        <p className="text-xs text-slate-600">Web mapping compatible</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2 h-12 bg-transparent">
                      <Download className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">Shapefile</p>
                        <p className="text-xs text-slate-600">GIS software compatible</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Layer Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">GeoJSON Preview</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-xs text-slate-700 overflow-x-auto">
                      {JSON.stringify(
                        {
                          type: "Feature",
                          properties: {
                            id: "asset-001",
                            landUseType: "Forest",
                            areaHectares: 150.5,
                            confidence: 0.92,
                            lastUpdated: "2024-01-15",
                            satelliteSource: "Sentinel-2",
                          },
                          geometry: {
                            type: "Point",
                            coordinates: [80.6093, 22.3344],
                          },
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
