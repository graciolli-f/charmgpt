import { ReactNode, useState } from 'react'
import { ArtifactContext } from './createArtifactContext'
import { Artifact, ViewMode, EditorMode } from './ArtifactContext.types'

interface ArtifactProviderProps {
  children: ReactNode
}

export function ArtifactProvider({ children }: ArtifactProviderProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('plot')
  const [editorContent, setEditorContent] = useState('')
  const [planContent, setPlanContent] = useState('')
  const [mode, setMode] = useState<EditorMode>('code')

  const addArtifact = (artifact: Omit<Artifact, 'id' | 'timestamp'>) => {
    const newArtifact = {
      ...artifact,
      id: Date.now(),
      timestamp: Date.now()
    }
    setArtifacts(prev => [...prev, newArtifact])
  }

  const runArtifact = async (code: string, name: string = 'Run Result') => {
    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to run code: ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}...`)
      }

      const result = await response.json()

      const newArtifact = {
        type: 'code' as const,
        name,
        code,
        output: result.output,
        plotFile: result.plotFile,
        dataFile: result.dataFile,
        source: 'assistant'
      }

      addArtifact(newArtifact)

      // Set this as the active artifact
      setActiveArtifact({
        ...newArtifact,
        id: artifacts.length, // This assumes addArtifact adds to the end of the list
        timestamp: Date.now()
      })

      // Set the most appropriate view mode based on what's available
      if (result.plotFile) {
        setViewMode('plot')
      } else if (result.dataFile) {
        setViewMode('data')
      } else if (result.output) {
        setViewMode('output')
      }

      return result
    } catch (error) {
      console.error('Failed to run code:', error)
      throw error
    }
  }

  return (
    <ArtifactContext.Provider
      value={{
        artifacts,
        activeArtifact,
        viewMode,
        mode,
        setMode,
        setViewMode,
        setActiveArtifact,
        runArtifact,
        editorContent,
        setEditorContent,
        addArtifact,
        planContent,
        setPlanContent,
      }}
    >
      {children}
    </ArtifactContext.Provider>
  )
} 