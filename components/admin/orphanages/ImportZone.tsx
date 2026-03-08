'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

interface RowError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: RowError[]
}

interface PreviewRow {
  rowNum: number
  data: Record<string, unknown>
  isValid: boolean
  errors: string[]
}

// Columns to show in the preview table (DB field names, post-normalisation)
const PREVIEW_COLS = ['name', 'area', 'address', 'org_type', 'is_registered', 'children_count']

export default function ImportZone({ onImportSuccess }: { onImportSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Send file to server preview endpoint — no client-side xlsx parsing
  const processFile = useCallback(async (f: File) => {
    setFile(f)
    setResult(null)
    setParseError(null)
    setPreview([])
    setTotalRows(0)
    setDuplicates([])
    setPreviewing(true)

    try {
      const formData = new FormData()
      formData.append('file', f)
      const res = await fetch('/api/v1/import/preview', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setParseError(json.error ?? 'Could not parse this file.')
        return
      }
      const json = (await res.json()) as { rows: PreviewRow[]; total: number; duplicates: string[] }
      setPreview(json.rows ?? [])
      setTotalRows(json.total ?? 0)
      setDuplicates(json.duplicates ?? [])
    } catch {
      setParseError('Network error while generating preview.')
    } finally {
      setPreviewing(false)
    }
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) void processFile(dropped)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) void processFile(selected)
  }

  function reset() {
    setFile(null)
    setPreview([])
    setTotalRows(0)
    setDuplicates([])
    setResult(null)
    setParseError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleConfirmImport(mode: 'new_only' | 'upsert') {
    if (!file) return
    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      const res = await fetch('/api/v1/import', {
        method: 'POST',
        body: formData,
      })
      const json = (await res.json()) as ImportResult & { error?: string }

      if (!res.ok) {
        setResult({
          imported: 0,
          skipped: 0,
          errors: json.errors ?? [
            { row: 0, field: 'server', message: json.error ?? 'Import failed' },
          ],
        })
      } else {
        setResult(json)
        if (json.imported > 0) {
          onImportSuccess()
          reset()
        }
      }
    } catch {
      setResult({
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, field: 'network', message: 'Network error. Please try again.' }],
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-12 transition-colors ${
            dragOver
              ? 'border-[#E8620A] bg-zinc-800'
              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          aria-label="Upload spreadsheet file"
        >
          <Upload className="h-8 w-8 text-zinc-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">Drop .xlsx or .csv here</p>
            <p className="mt-1 text-xs text-zinc-500">or click to browse — max 5 MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFileChange}
        aria-label="File input"
      />

      {/* Parse error */}
      {parseError && (
        <div className="flex items-center gap-2 rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {parseError}
        </div>
      )}

      {/* File selected + preview */}
      {file && !parseError && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB
                {totalRows > 0 && ` · ${totalRows} row${totalRows !== 1 ? 's' : ''} total`}
              </p>
            </div>
            {previewing && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
            <button
              type="button"
              onClick={reset}
              className="text-zinc-400 hover:text-white"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview table (up to 50 rows) */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Preview (first {preview.length} of {totalRows} rows)
              </p>
              <div className="overflow-x-auto rounded-md border border-zinc-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-zinc-400">
                      <th className="w-8 px-3 py-2">#</th>
                      <th className="px-3 py-2">Status</th>
                      {PREVIEW_COLS.map((col) => (
                        <th key={col} className="px-3 py-2 capitalize">
                          {col.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row) => (
                      <tr
                        key={row.rowNum}
                        className={`border-b border-zinc-800 ${
                          row.isValid ? 'bg-emerald-950/20' : 'bg-red-950/20'
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-zinc-500">{row.rowNum}</td>
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <Badge className="bg-emerald-900/50 text-[10px] text-emerald-400">
                              Valid
                            </Badge>
                          ) : (
                            <Badge className="bg-red-900/50 text-[10px] text-red-400">Error</Badge>
                          )}
                        </td>
                        {PREVIEW_COLS.map((col) => (
                          <td key={col} className="px-3 py-2 text-zinc-300">
                            {String(row.data[col] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicate conflict warning */}
          {!previewing && duplicates.length > 0 && (
            <div className="space-y-3 rounded-md border border-amber-800 bg-amber-950/30 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-300">
                    {duplicates.length} existing record{duplicates.length !== 1 ? 's' : ''} found
                  </p>
                  <p className="mt-1 max-h-16 overflow-y-auto text-xs text-amber-500">
                    {duplicates.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleConfirmImport('new_only')}
                  disabled={uploading}
                  className="bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                >
                  {uploading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Add new entries only
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handleConfirmImport('upsert')}
                  disabled={uploading}
                  className="bg-[#E8620A] text-white hover:bg-[#cb5309]"
                >
                  {uploading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Add new &amp; update existing
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={reset}
                  disabled={uploading}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Confirm button (no duplicates) */}
          {!previewing && duplicates.length === 0 && preview.length > 0 && (
            <Button
              onClick={() => void handleConfirmImport('upsert')}
              disabled={uploading}
              className="bg-[#E8620A] text-white hover:bg-[#cb5309]"
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? 'Importing…' : `Confirm Import (${totalRows} rows)`}
            </Button>
          )}
        </div>
      )}

      {/* Import result */}
      {result && (
        <div
          className={`space-y-2 rounded-md border p-4 ${
            result.errors.length === 0
              ? 'border-emerald-900 bg-emerald-950/30'
              : 'border-red-900 bg-red-950/30'
          }`}
        >
          {result.errors.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Imported {result.imported} record{result.imported !== 1 ? 's' : ''}.
              {result.skipped > 0 && (
                <span className="text-zinc-400"> {result.skipped} skipped (duplicate slugs).</span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Import blocked — {result.errors.length} row error
                {result.errors.length !== 1 ? 's' : ''} found. Fix errors and re-upload.
              </div>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-300">
                    Row {e.row} · <span className="font-mono">{e.field}</span>: {e.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
