"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { mockFRAClaims, mockVillages, mockRecommendations } from "@/lib/mock-data"
import { FileText, MapPin, CheckCircle, Clock } from "lucide-react"

export default function Dashboard() {
  // Calculate statistics
  const totalClaims = mockFRAClaims.length
  const grantedClaims = mockFRAClaims.filter((claim) => claim.status === "granted").length
  const pendingClaims = mockFRAClaims.filter((claim) => claim.status === "pending").length
  const verifiedClaims = mockFRAClaims.filter((claim) => claim.status === "verified").length
  const rejectedClaims = mockFRAClaims.filter((claim) => claim.status === "rejected").length

  // State-wise data for charts
  const stateData = [
    { state: "MP", claims: mockFRAClaims.filter((c) => c.state === "Madhya Pradesh").length },
    { state: "Tripura", claims: mockFRAClaims.filter((c) => c.state === "Tripura").length },
    { state: "Odisha", claims: mockFRAClaims.filter((c) => c.state === "Odisha").length },
    { state: "Telangana", claims: mockFRAClaims.filter((c) => c.state === "Telangana").length },
  ]

  // Claim type distribution
  const claimTypeData = [
    { name: "IFR", value: mockFRAClaims.filter((c) => c.claimType === "IFR").length, color: "#10b981" },
    { name: "CFR", value: mockFRAClaims.filter((c) => c.claimType === "CFR").length, color: "#3b82f6" },
    { name: "CR", value: mockFRAClaims.filter((c) => c.claimType === "CR").length, color: "#f59e0b" },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalClaims}</div>
            <p className="text-xs text-blue-700">Across 4 states</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Granted Claims</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{grantedClaims}</div>
            <p className="text-xs text-green-700">{((grantedClaims / totalClaims) * 100).toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingClaims}</div>
            <p className="text-xs text-yellow-700">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Villages Covered</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{mockVillages.length}</div>
            <p className="text-xs text-purple-700">Active monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Claims by State</CardTitle>
            <CardDescription>Distribution of FRA claims across target states</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="claims" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Types Distribution</CardTitle>
            <CardDescription>Breakdown by Individual, Community, and Community Forest Rights</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={claimTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {claimTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent FRA Claims</CardTitle>
            <CardDescription>Latest submissions and status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFRAClaims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{claim.villageName}</p>
                    <p className="text-xs text-slate-600">
                      {claim.pattalHolderName} • {claim.claimType}
                    </p>
                  </div>
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
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Recommendations</CardTitle>
            <CardDescription>AI-generated suggestions for government schemes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rec.recommendationType}</p>
                    <p className="text-xs text-slate-600">{rec.villageName}</p>
                  </div>
                  <Badge
                    variant={
                      rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "secondary" : "outline"
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Processing Status</CardTitle>
          <CardDescription>Current status of data processing modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OCR Processing</span>
                <span className="text-sm text-slate-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Asset Mapping</span>
                <span className="text-sm text-slate-600">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GIS Analysis</span>
                <span className="text-sm text-slate-600">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DSS Recommendations</span>
                <span className="text-sm text-slate-600">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
