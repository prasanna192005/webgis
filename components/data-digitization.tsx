"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Eye, Download, CheckCircle, AlertCircle } from "lucide-react"
import { mockFRAClaims } from "@/lib/mock-data"
import type { OCRResult } from "@/lib/types"

export default function DataDigitization() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [extractedClaims, setExtractedClaims] = useState(mockFRAClaims.slice(0, 2))

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const simulateOCRProcessing = async () => {
    setProcessing(true)

    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock OCR results
    const mockOCRResults: OCRResult[] = [
      {
        extractedText:
          "Forest Rights Act Claim Form\nVillage: Kanha Village\nDistrict: Mandla\nState: Madhya Pradesh\nPatta Holder: Ramesh Kumar\nClaim Type: Individual Forest Rights (IFR)\nCoordinates: 22.3344°N, 80.6093°E\nArea: 2.5 hectares\nStatus: Under Verification",
        confidence: 0.92,
        entities: {
          villageName: "Kanha Village",
          pattalHolderName: "Ramesh Kumar",
          coordinates: "22.3344°N, 80.6093°E",
          claimType: "IFR",
          status: "Under Verification",
        },
      },
      {
        extractedText:
          "Community Forest Rights Application\nVillage: Agartala Rural\nDistrict: West Tripura\nState: Tripura\nCommunity Representative: Biplab Debbarma\nClaim Type: Community Forest Rights (CFR)\nArea: 15.0 hectares\nSubmission Date: 20/01/2024",
        confidence: 0.87,
        entities: {
          villageName: "Agartala Rural",
          pattalHolderName: "Biplab Debbarma",
          claimType: "CFR",
          status: "Pending",
        },
      },
    ]

    setOcrResults(mockOCRResults)
    setProcessing(false)
  }

  const exportData = (format: "json" | "csv") => {
    const data = extractedClaims.map((claim) => ({
      id: claim.id,
      village: claim.villageName,
      district: claim.district,
      state: claim.state,
      pattaHolder: claim.pattalHolderName,
      claimType: claim.claimType,
      status: claim.status,
      area: claim.areaHectares,
      coordinates: `${claim.coordinates.latitude}, ${claim.coordinates.longitude}`,
    }))

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "fra_claims_data.json"
      a.click()
    } else {
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((row) => Object.values(row).join(","))
      const csv = [headers, ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "fra_claims_data.csv"
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Digitization Module</h2>
          <p className="text-slate-600">OCR + NER processing for FRA claim documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {extractedClaims.length} Claims Processed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="ocr">OCR Processing</TabsTrigger>
          <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
          <TabsTrigger value="export">Export Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload FRA Documents</CardTitle>
              <CardDescription>
                Upload scanned FRA claim documents (PDF, JPG, PNG). The system will extract structured data using OCR
                and NER.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-slate-900">Drop files here or click to upload</p>
                    <p className="text-sm text-slate-600">Supports PDF, JPG, PNG files up to 10MB each</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Badge variant="outline">Ready</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process Button */}
                {uploadedFiles.length > 0 && (
                  <Button onClick={simulateOCRProcessing} disabled={processing} className="w-full">
                    {processing ? "Processing Documents..." : "Start OCR Processing"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle>OCR Processing Results</CardTitle>
              <CardDescription>Optical Character Recognition and Named Entity Recognition results</CardDescription>
            </CardHeader>
            <CardContent>
              {processing && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-slate-600">Processing documents...</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}

              {ocrResults.length > 0 && (
                <div className="space-y-4">
                  {ocrResults.map((result, index) => (
                    <Card key={index} className="border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Document {index + 1}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={result.confidence > 0.9 ? "default" : "secondary"}>
                              {(result.confidence * 100).toFixed(0)}% Confidence
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Extracted Text */}
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 mb-2">Extracted Text</h4>
                          <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono">{result.extractedText}</div>
                        </div>

                        {/* Named Entities */}
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 mb-2">Identified Entities</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(result.entities).map(
                              ([key, value]) =>
                                value && (
                                  <div key={key} className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-600 capitalize">
                                      {key.replace(/([A-Z])/g, " $1")}:
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {value}
                                    </Badge>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!processing && ocrResults.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600">No OCR results yet. Upload and process documents first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extracted">
          <Card>
            <CardHeader>
              <CardTitle>Extracted FRA Claims Data</CardTitle>
              <CardDescription>Structured data extracted from processed documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {extractedClaims.map((claim) => (
                  <Card key={claim.id} className="border-slate-200">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Village</label>
                          <p className="text-sm font-medium text-slate-900">{claim.villageName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">District</label>
                          <p className="text-sm font-medium text-slate-900">{claim.district}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">State</label>
                          <p className="text-sm font-medium text-slate-900">{claim.state}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Patta Holder
                          </label>
                          <p className="text-sm font-medium text-slate-900">{claim.pattalHolderName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Claim Type
                          </label>
                          <Badge variant="outline">{claim.claimType}</Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Status</label>
                          <Badge
                            variant={
                              claim.status === "granted"
                                ? "default"
                                : claim.status === "pending"
                                  ? "secondary"
                                  : claim.status === "verified"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {claim.status}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Area</label>
                          <p className="text-sm font-medium text-slate-900">{claim.areaHectares} hectares</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Coordinates
                          </label>
                          <p className="text-sm font-medium text-slate-900">
                            {claim.coordinates.latitude}, {claim.coordinates.longitude}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Submission Date
                          </label>
                          <p className="text-sm font-medium text-slate-900">{claim.submissionDate}</p>
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
              <CardTitle>Export Processed Data</CardTitle>
              <CardDescription>Download extracted FRA claims data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Export Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Processed Claims</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">{extractedClaims.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Data Quality</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">92%</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Validation Status</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">Ready</p>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Export Formats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => exportData("json")}
                      variant="outline"
                      className="flex items-center space-x-2 h-12"
                    >
                      <Download className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">JSON Format</p>
                        <p className="text-xs text-slate-600">Structured data for APIs</p>
                      </div>
                    </Button>
                    <Button
                      onClick={() => exportData("csv")}
                      variant="outline"
                      className="flex items-center space-x-2 h-12"
                    >
                      <Download className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">CSV Format</p>
                        <p className="text-xs text-slate-600">Spreadsheet compatible</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Data Preview</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <pre className="text-xs text-slate-700 overflow-x-auto">
                      {JSON.stringify(
                        {
                          id: "fra-001",
                          village: "Kanha Village",
                          district: "Mandla",
                          state: "Madhya Pradesh",
                          pattaHolder: "Ramesh Kumar",
                          claimType: "IFR",
                          status: "granted",
                          area: 2.5,
                          coordinates: "22.3344, 80.6093",
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
