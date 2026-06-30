import { useState } from "react"
import { Plus, Trash2, Edit3, Landmark, Gem, BarChart3, Building2, CircleDollarSign, BadgePercent, Moon, Sun } from "lucide-react"
import type { WealthAsset } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Progress } from "./ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { formatCurrency, generateId } from "../lib/utils"
import { useLocale } from "../lib/LocaleContext"

interface WealthPlanningProps {
  assets: WealthAsset[]
  timeline: "lunar" | "solar"
  contributionEnabled: boolean
  contributionAmount: number
  onAdd: (asset: WealthAsset) => void
  onUpdate: (asset: WealthAsset) => void
  onDelete: (id: string) => void
  onSetTimeline: (t: "lunar" | "solar") => void
  onSetContributionEnabled: (enabled: boolean) => void
  onSetContributionAmount: (amount: number) => void
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#10b981"
  if (pct >= 75) return "#f59e0b"
  return "#3b82f6"
}

const ASSET_TYPES = [
  { value: "cash", labelKey: "wealth.assetType.cash", icon: CircleDollarSign },
  { value: "precious_metals", labelKey: "wealth.assetType.precious_metals", icon: Gem },
  { value: "investment_portfolio", labelKey: "wealth.assetType.investment_portfolio", icon: BarChart3 },
  { value: "real_estate", labelKey: "wealth.assetType.real_estate", icon: Building2 },
  { value: "other", labelKey: "wealth.assetType.other", icon: Landmark },
] as const

export default function WealthPlanning({
  assets, timeline, contributionEnabled, contributionAmount,
  onAdd, onUpdate, onDelete, onSetTimeline, onSetContributionEnabled, onSetContributionAmount,
}: WealthPlanningProps) {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", type: "cash" as WealthAsset["type"], value: "" })

  const totalWealth = assets.reduce((s, a) => s + a.value, 0)
  const contributionGoal = totalWealth * 0.025
  const contributionPct = contributionGoal > 0 ? (contributionAmount / contributionGoal) * 100 : 0

  const resetForm = () => {
    setForm({ name: "", type: "cash", value: "" })
    setEditingId(null)
  }

  const openEdit = (asset: WealthAsset) => {
    setForm({ name: asset.name, type: asset.type, value: String(asset.value) })
    setEditingId(asset.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.value) return
    const asset: WealthAsset = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      type: form.type,
      value: Number.parseFloat(form.value) || 0,
    }
    if (editingId) {
      onUpdate(asset)
    } else {
      onAdd(asset)
    }
    setDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("wealth.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("wealth.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("wealth.totalWealth")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalWealth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Gem className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("wealth.assetTypes")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{assets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BadgePercent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("wealth.reviewCycle")}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {timeline === "lunar" ? t("wealth.lunarDays") : t("wealth.solarDays")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t("wealth.registeredAssets")}</CardTitle>
              <CardDescription>{t("wealth.assetDesc")}</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { resetForm(); setDialogOpen(true) }}>
              <Plus className="h-4 w-4" /> {t("wealth.addAsset")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-10">
              <Landmark className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t("wealth.noAssets")}</p>
              <p className="text-gray-400 text-xs mt-1">{t("wealth.noAssetsHint")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => {
                const typeMeta = ASSET_TYPES.find((t) => t.value === asset.type)
                const TypeIcon = typeMeta?.icon ?? Landmark
                const pctOfTotal = totalWealth > 0 ? (asset.value / totalWealth) * 100 : 0
                return (
                  <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(asset.value)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-400">{typeMeta ? t(typeMeta.labelKey) : ""}</p>
                        <p className="text-xs text-gray-400">{pctOfTotal.toFixed(1)}{t("wealth.ofTotal")}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(asset)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(asset.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-coral" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("wealth.planningPreferences")}</CardTitle>
          <CardDescription>{t("wealth.planningDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {timeline === "lunar" ? <Moon className="h-5 w-5 text-gray-500" /> : <Sun className="h-5 w-5 text-gray-500" />}
              <div>
                <Label htmlFor="timeline-toggle" className="font-medium text-gray-900 dark:text-gray-100">{t("wealth.annualReviewTimeline")}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("wealth.timelineDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${timeline === "lunar" ? "text-emerald-600" : "text-gray-400"}`}>{t("wealth.lunar")}</span>
              <Switch id="timeline-toggle" checked={timeline === "solar"} onCheckedChange={(v) => onSetTimeline(v ? "solar" : "lunar")} />
              <span className={`text-sm font-medium ${timeline === "solar" ? "text-emerald-600" : "text-gray-400"}`}>{t("wealth.solar")}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BadgePercent className="h-5 w-5 text-emerald-600" />
                <div>
                  <Label htmlFor="contribution-toggle" className="font-medium text-gray-900 dark:text-gray-100">{t("wealth.calculateContribution")}</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("wealth.contributionDesc")}</p>
                </div>
              </div>
              <Switch id="contribution-toggle" checked={contributionEnabled} onCheckedChange={onSetContributionEnabled} />
            </div>
            {contributionEnabled && totalWealth > 0 && (
              <div className="pl-12 space-y-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">{t("wealth.suggestedContribution")}</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold">{formatCurrency(contributionGoal)}</span>
                  </div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-3">
                    {t("wealth.percentOfTotal", { total: formatCurrency(totalWealth) })}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Label htmlFor="contribution-amount" className="text-gray-500 dark:text-gray-400">{t("wealth.alreadyContributed")}</Label>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contributionAmount)}</span>
                    </div>
                    <Input
                      id="contribution-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={contributionAmount || ""}
                      onChange={(e) => onSetContributionAmount(Number.parseFloat(e.target.value) || 0)}
                      placeholder={t("common.amountPlaceholder")}
                    />
                    <div className="pt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{t("wealth.progressTowardGoal")}</span>
                        <span className="font-medium">{contributionPct.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(contributionPct, 100)} indicatorColor={getProgressColor(contributionPct)} />
                    </div>
                    {contributionPct >= 100 && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">{t("wealth.goalReached")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {contributionEnabled && totalWealth === 0 && (
              <p className="pl-12 text-sm text-gray-400">{t("wealth.noWealthForContribution")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("wealth.editAsset") : t("wealth.addAsset")}</DialogTitle>
            <DialogDescription>{t("wealth.addAssetDialog")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">{t("wealth.assetName")}</Label>
              <Input id="asset-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("wealth.assetNamePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-type">{t("wealth.assetType")}</Label>
              <Select value={form.type} onValueChange={(v: WealthAsset["type"]) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((at) => (
                    <SelectItem key={at.value} value={at.value}>{t(at.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-value">{t("wealth.currentValue")}</Label>
              <Input id="asset-value" type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={t("common.amountPlaceholder")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>{t("wealth.cancel")}</Button>
            <Button onClick={handleSubmit}>{editingId ? t("wealth.update") : t("wealth.addAssetBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
