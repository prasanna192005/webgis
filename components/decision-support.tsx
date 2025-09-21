"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Target, TrendingUp, CheckCircle, Download, Lightbulb } from "lucide-react"
import { mockRecommendations, mockVillages } from "@/lib/mock-data"
import type { PolicyRecommendation } from "@/lib/types"

export default function DecisionSupport() {
  const [selectedVillage, setSelectedVillage] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [processing, setProcessing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [recommendations, setRecommendations] = useState(mockRecommendations)
  const [selectedRecommendation, setSelectedRecommendation] = useState<PolicyRecommendation | null>(null)

  const generateRecommendations = async () => {
    setProcessing(true)
    setAnalysisProgress(0)

    // Simulate AI analysis progress
    const steps = [
      { progress: 20, message: "Analyzing FRA claim data..." },
      { progress: 40, message: "Processing village demographics..." },
      { progress: 60, message: "Evaluating land use patterns..." },
      { progress: 80, message: "Applying policy matching rules..." },
      { progress: 100, message: "Generating recommendations..." },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalysisProgress(step.progress)
    }

    // Generate additional mock recommendations
    const newRecommendations: PolicyRecommendation[] = [
      {
        id: "rec-004",
        villageId: "vil-003",
        villageName: "Simlipal Buffer",
        recommendationType: "Forest Conservation",
        priority: "High",
        reasoning: "High forest cover (85%) with active FRA claims requires conservation support",
        estimatedBenefit: "Preserve 85 hectares of forest ecosystem",
        implementationSteps: [
          "Establish community forest management committee",
          "Provide training on sustainable forest practices",
          "Set up monitoring and protection systems",
        ],
        generatedDate: "2024-01-20",
      },
      {
        id: "rec-005",
        villageId: "vil-001",
        villageName: "Kanha Village",
        recommendationType: "PM-KISAN",
        priority: "Medium",
        reasoning: "Granted FRA patta holders engaged in agricultural activities",
        estimatedBenefit: "₹6,000 annual support for 15 farming families",
        implementationSteps: [
          "Verify agricultural land ownership through FRA pattas",
          "Register eligible farmers in PM-KISAN database",
          "Facilitate bank account linking for direct transfers",
        ],
        generatedDate: "2024-01-20",
      },
    ]

    setRecommendations([...mockRecommendations, ...newRecommendations])
    setProcessing(false)
  }

  const filteredRecommendations = recommendations.filter((rec) => {
    const villageMatch = selectedVillage === "all" || rec.villageName === selectedVillage
    const priorityMatch = selectedPriority === "all" || rec.priority === selectedPriority
    return villageMatch && priorityMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getSchemeIcon = (scheme: string) => {
    switch (scheme) {
      case "PM-KISAN":
        return "🌾"
      case "Jal Jeevan Mission":
        return "💧"
      case "MGNREGA":
        return "🏗️"
      case "Forest Conservation":
        return "🌳"
      default:
        return "📋"
    }
  }

  const exportRecommendations = () => {
    const exportData = filteredRecommendations.map((rec) => ({
      village: rec.villageName,
      scheme: rec.recommendationType,
      priority: rec.priority,
      reasoning: rec.reasoning,
      estimatedBenefit: rec.estimatedBenefit,
      implementationSteps: rec.implementationSteps.join("; "),
      generatedDate: rec.generatedDate,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "policy_recommendations.json"
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Decision Support System</h2>
          <p className="text-slate-600">AI-powered policy recommendations based on FRA data analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            {recommendations.length} Recommendations
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="rules">Policy Rules</TabsTrigger>
          <TabsTrigger value="analytics">Impact Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendation Engine</CardTitle>
                <CardDescription>Generate policy recommendations using machine learning analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Analysis Scope</label>
                  <Select defaultValue="all-villages">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-villages">All Villages</SelectItem>
                      <SelectItem value="high-priority">High Priority Villages</SelectItem>
                      <SelectItem value="new-claims">Villages with New Claims</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Policy Focus</label>
                  <Select defaultValue="comprehensive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      <SelectItem value="agriculture">Agriculture Schemes</SelectItem>
                      <SelectItem value="water">Water & Sanitation</SelectItem>
                      <SelectItem value="forest">Forest Conservation</SelectItem>
                      <SelectItem value="employment">Employment Programs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Data Sources</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "FRA Claims Database",
                      "Satellite Imagery Analysis",
                      "Village Demographics",
                      "Land Use Classification",
                    ].map((source) => (
                      <div key={source} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={generateRecommendations} disabled={processing} className="w-full">
                  {processing ? "Generating Recommendations..." : "Generate AI Recommendations"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Progress</CardTitle>
                <CardDescription>Real-time AI processing status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
                      <span className="text-sm font-medium">AI Analysis in Progress...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-xs text-slate-600">
                      {analysisProgress < 30
                        ? "Analyzing FRA claim data..."
                        : analysisProgress < 60
                          ? "Processing village demographics..."
                          : analysisProgress < 90
                            ? "Applying policy matching rules..."
                            : "Generating recommendations..."}
                    </p>
                  </div>
                )}

                {!processing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Villages Analyzed</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900 mt-1">{mockVillages.length}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Match Accuracy</span>
                        </div>
                        <p className="text-lg font-bold text-green-900 mt-1">94.2%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-900">AI Model Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Policy Matching Confidence</span>
                          <span className="font-medium">94.2%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Benefit Estimation Accuracy</span>
                          <span className="font-medium">87.8%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Implementation Feasibility</span>
                          <span className="font-medium">91.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by village" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Villages</SelectItem>
                  {mockVillages.map((village) => (
                    <SelectItem key={village.id} value={village.name}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportRecommendations} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Recommendations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedRecommendation(rec)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getSchemeIcon(rec.recommendationType)}</span>
                        <CardTitle className="text-lg">{rec.recommendationType}</CardTitle>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                    </div>
                    <CardDescription>{rec.villageName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1">Reasoning</h4>
                      <p className="text-sm text-slate-600">{rec.reasoning}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1">Estimated Benefit</h4>
                      <p className="text-sm font-semibold text-green-700">{rec.estimatedBenefit}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Generated: {rec.generatedDate}</span>
                      <span>{rec.implementationSteps.length} steps</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Policy Matching Rules</CardTitle>
              <CardDescription>Rule-based logic for generating policy recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rule Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Agricultural Schemes</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-sm">PM-KISAN Rule</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          IF FRA patta holder = agricultural land AND status = granted &gt; Recommend PM-KISAN
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Crop Insurance Rule</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          IF agricultural area &gt; 2 hectares AND climate risk = high &gt; Recommend crop insurance
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Infrastructure Schemes</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Jal Jeevan Mission Rule</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          IF village water index &lt; 0.4 &gt; Recommend Jal Jeevan Mission with high priority
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">MGNREGA Rule</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          IF land use = degraded forest AND unemployment &gt; 20% &gt; Recommend MGNREGA plantation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rule Engine Statistics */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-3">Rule Engine Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">24</p>
                      <p className="text-sm text-slate-600">Active Rules</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">94.2%</p>
                      <p className="text-sm text-slate-600">Match Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">156</p>
                      <p className="text-sm text-slate-600">Rules Triggered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">12</p>
                      <p className="text-sm text-slate-600">Policy Schemes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact Projections</CardTitle>
                <CardDescription>Estimated benefits from recommended policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">PM-KISAN Benefits</p>
                      <p className="text-sm text-green-700">Direct income support</p>
                    </div>
                    <p className="text-lg font-bold text-green-900">₹1,20,000</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Water Access Improvement</p>
                      <p className="text-sm text-blue-700">Households benefited</p>
                    </div>
                    <p className="text-lg font-bold text-blue-900">890</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-900">Employment Generation</p>
                      <p className="text-sm text-yellow-700">Person-days of work</p>
                    </div>
                    <p className="text-lg font-bold text-yellow-900">15,600</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900">Forest Restoration</p>
                      <p className="text-sm text-purple-700">Hectares to be restored</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">28.3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
                <CardDescription>Projected rollout schedule for recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { phase: "Phase 1: High Priority", duration: "0-3 months", count: 3 },
                    { phase: "Phase 2: Medium Priority", duration: "3-6 months", count: 2 },
                    { phase: "Phase 3: Long-term", duration: "6-12 months", count: 2 },
                  ].map((phase, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{phase.phase}</h4>
                        <Badge variant="outline">{phase.count} schemes</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{phase.duration}</p>
                      <Progress value={(index + 1) * 33} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-slate-900 mb-2">Success Metrics</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Expected Implementation Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Beneficiary Coverage</span>
                      <span className="font-medium">3,820 people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Investment Required</span>
                      <span className="font-medium">₹45.2 lakhs</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Recommendation Modal */}
      {selectedRecommendation && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getSchemeIcon(selectedRecommendation.recommendationType)}</span>
                <div>
                  <CardTitle className="text-xl">{selectedRecommendation.recommendationType}</CardTitle>
                  <CardDescription>{selectedRecommendation.villageName}</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Analysis & Reasoning</h4>
                <p className="text-sm text-slate-600 mb-4">{selectedRecommendation.reasoning}</p>

                <h4 className="font-medium text-slate-900 mb-2">Estimated Benefits</h4>
                <p className="text-sm font-semibold text-green-700 mb-4">{selectedRecommendation.estimatedBenefit}</p>

                <div className="flex items-center space-x-4">
                  <Badge className={getPriorityColor(selectedRecommendation.priority)}>
                    {selectedRecommendation.priority} Priority
                  </Badge>
                  <span className="text-xs text-slate-500">Generated: {selectedRecommendation.generatedDate}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Implementation Steps</h4>
                <div className="space-y-2">
                  {selectedRecommendation.implementationSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-600 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
