"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Server,
  Wrench,
  Lock,
  Eye,
  ArrowUpCircle
} from 'lucide-react'

interface Vulnerability {
  id: string
  name: string
  description: string
  severity: string
  cvss_score: number
  owasp_category?: string
  mitre_technique?: string
  evidence: Record<string, any>
  remediation: string
}

interface ScanResult {
  server_url: string
  status: string
  tools_found: number
  risk_score: number
  overall_severity: string
  scan_duration: number
  vulnerabilities: Vulnerability[]
}

interface MCPScanResultsProps {
  result: ScanResult
}

export default function MCPScanResults({ result }: MCPScanResultsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Card className="mt-6 bg-v-bg2 border-v-border2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-v-text1">
              <Server className="w-5 h-5 text-acid" />
              Scan Results
            </CardTitle>
            <CardDescription className="text-v-muted2">
              {result.server_url} • {result.scan_duration.toFixed(2)}s • {result.tools_found} tools found
            </CardDescription>
          </div>
          <Badge className={`${getSeverityColor(result.overall_severity)} text-white`}>
            {result.overall_severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-v-bg1 border border-v-border2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-acid data-[state=active]:text-black">Overview</TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="data-[state=active]:bg-acid data-[state=active]:text-black">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-acid data-[state=active]:text-black">Tools ({result.tools_found})</TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-acid data-[state=active]:text-black">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-v-bg1 border-v-border2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-v-text1">Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Progress value={result.risk_score} className="flex-1" />
                    <span className="font-bold text-v-text1">{result.risk_score.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-v-bg1 border-v-border2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-v-text1">Tools Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-acid" />
                    <span className="font-bold text-v-text1">{result.tools_found}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-v-bg1 border-v-border2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-v-text1">Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(result.overall_severity)}
                    <span className="font-bold text-v-text1">{result.vulnerabilities.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.vulnerabilities.length === 0 ? (
              <Alert className="bg-green-900/20 border-green-800">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertTitle className="text-green-400">No Vulnerabilities Found</AlertTitle>
                <AlertDescription className="text-green-300">
                  The MCP server appears to be secure with no detected vulnerabilities.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <AlertTitle className="text-red-400">Vulnerabilities Detected</AlertTitle>
                <AlertDescription className="text-red-300">
                  {result.vulnerabilities.length} security issues were found. Review the vulnerabilities tab for details.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="mt-6">
            <div className="space-y-4">
              {result.vulnerabilities.map((vuln) => (
                <Card key={vuln.id} className="border-l-4 border-l-red-500 bg-v-bg1 border-v-border2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-v-text1">{vuln.name}</CardTitle>
                      <Badge className={getSeverityColor(vuln.severity)}>
                        {vuln.severity}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 text-v-muted2">{vuln.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm text-v-text1">
                      <div>
                        <span className="font-medium text-v-muted2">CVSS Score:</span> {vuln.cvss_score}
                      </div>
                      {vuln.owasp_category && (
                        <div>
                          <span className="font-medium text-v-muted2">OWASP:</span> {vuln.owasp_category}
                        </div>
                      )}
                      {vuln.mitre_technique && (
                        <div>
                          <span className="font-medium text-v-muted2">MITRE ATLAS:</span> {vuln.mitre_technique}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-v-bg2 rounded border border-v-border2">
                      <p className="font-medium text-sm text-v-muted2">Remediation:</p>
                      <p className="text-sm text-v-text1 mt-1">{vuln.remediation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="mt-6">
            <Alert className="bg-v-bg1 border-v-border2">
              <Wrench className="w-4 h-4 text-acid" />
              <AlertTitle className="text-v-text1">Tool Enumeration</AlertTitle>
              <AlertDescription className="text-v-muted2">
                Found {result.tools_found} tools on the MCP server. Review the vulnerability analysis for security issues.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6">
            <div className="space-y-4">
              <Card className="bg-v-bg1 border-v-border2">
                <CardHeader>
                  <CardTitle className="text-base text-v-text1">OWASP LLM Top 10</CardTitle>
                  <CardDescription className="text-v-muted2">
                    Mapping of vulnerabilities to OWASP LLM security categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.vulnerabilities
                      .filter(v => v.owasp_category)
                      .map((vuln, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-v-text1">
                          <CheckCircle className="w-4 h-4 text-acid" />
                          <span>{vuln.owasp_category}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-v-bg1 border-v-border2">
                <CardHeader>
                  <CardTitle className="text-base text-v-text1">MITRE ATLAS</CardTitle>
                  <CardDescription className="text-v-muted2">
                    Mapping of vulnerabilities to MITRE ATLAS techniques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.vulnerabilities
                      .filter(v => v.mitre_technique)
                      .map((vuln, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-v-text1">
                          <ArrowUpCircle className="w-4 h-4 text-purple-400" />
                          <span>{vuln.mitre_technique}: {vuln.name}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}