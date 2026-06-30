import { Smartphone, Download, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "./ui/dialog"
import { useLocale } from "../lib/LocaleContext"

interface DownloadHubProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DownloadHub({ open, onOpenChange }: DownloadHubProps) {
  const { t } = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            <DialogTitle>{t("downloadHub.title")}</DialogTitle>
          </div>
          <DialogDescription>{t("downloadHub.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.72 12.47c-.01-2.11 1.72-3.12 1.8-3.17-.98-1.44-2.51-1.63-3.05-1.66-1.3-.13-2.53.76-3.19.76-.66 0-1.68-.74-2.76-.72-1.42.02-2.73.83-3.46 2.1-1.48 2.56-.38 6.35 1.06 8.43.7 1.01 1.54 2.15 2.64 2.11 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.76.66 1.14-.02 1.86-1.03 2.56-2.04.81-1.18 1.14-2.33 1.16-2.39-.02-.01-2.22-.85-2.24-3.39M16.28 7.14c.58-.7.97-1.68.86-2.65-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.88 2.57.93.07 1.88-.47 2.46-1.17"/></svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Android</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("downloadHub.androidDesc")}</p>
            <ol className="text-xs text-gray-500 dark:text-gray-400 text-start space-y-1.5">
              <li>{t("downloadHub.step1")}</li>
              <li>{t("downloadHub.step2")}</li>
              <li>{t("downloadHub.step3")}</li>
            </ol>
            <a
              href={t("downloadHub.repoUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium transition-colors shadow-md"
            >
              <Download className="h-4 w-4" />
              {t("downloadHub.getApk")}
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.5-.6 1.08-1.1 1.79-1.5.7-.37 1.49-.56 2.29-.5.26 1.18-.3 2.35-1.01 3.16-.68.74-1.63 1.28-2.66 1.21-.15-1.11.43-2.24 1.09-2.97z"/></svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">iOS</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("downloadHub.iosDesc")}</p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-5 py-2.5 text-sm font-medium cursor-default">
              <ExternalLink className="h-4 w-4" />
              {t("downloadHub.appStore")}
            </div>
            <p className="text-xs text-gray-400">{t("downloadHub.iosTip")}</p>
          </div>
        </div>

        <div className="text-center pb-2">
          <p className="text-xs text-gray-400">{t("downloadHub.footer")}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
