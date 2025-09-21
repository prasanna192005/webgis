"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, FileText, Satellite, Brain, BarChart3, Phone } from "lucide-react"
import DataDigitization from "@/components/data-digitization"
import AssetMapping from "@/components/asset-mapping"
import WebGISPortal from "@/components/webgis-portal"
import DecisionSupport from "@/components/decision-support"
import Dashboard from "@/components/dashboard"

export default function FRAAtlas() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [showInput, setShowInput] = useState(false)

  async function handleCall() {
    if (!phone) {
      setStatus("⚠️ Please enter a phone number.")
      return
    }
    try {
      setLoading(true)
      setStatus("📞 Connecting...")
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("✅ Call started successfully")
      } else {
        setStatus("❌ Error: " + data.error)
      }
    } catch (err) {
      setStatus("❌ Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">FRA Atlas</h1>
                <p className="text-sm text-slate-600">
                  AI-Powered Decision Support System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Forest Rights Act Atlas & WebGIS Portal
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl">
            Comprehensive system for digitizing FRA claims, mapping forest
            assets, and providing AI-driven policy recommendations across Madhya
            Pradesh, Tripura, Odisha, and Telangana.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="digitization" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Data Digitization</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center space-x-2">
              <Satellite className="w-4 h-4" />
              <span>Asset Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="webgis" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>WebGIS Portal</span>
            </TabsTrigger>
            <TabsTrigger value="dss" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Decision Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="digitization">
            <DataDigitization />
          </TabsContent>

          <TabsContent value="mapping">
            <AssetMapping />
          </TabsContent>

          <TabsContent value="webgis">
            <WebGISPortal />
          </TabsContent>

          <TabsContent value="dss">
            <DecisionSupport />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Call Button + Input Popup */}
      <div className="fixed bottom-6 right-6">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition"
          >
            <Phone className="w-5 h-5" />
          </button>
        ) : (
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-72">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              📞 Call Helpline
            </h3>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleCall}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              {loading ? "Calling..." : "Start Call"}
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="w-full mt-2 border border-slate-300 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            {status && <p className="text-xs text-slate-600 mt-2">{status}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
