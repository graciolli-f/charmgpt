import { createContext } from 'react'

export type EditorMode = 'code' | 'plan'
export type ViewMode = 'plot' | 'data'

export type ArtifactType = 'chat' | 'code' | 'visualization'

export interface Artifact {
  id: number
  name: string
  output: string
  plotFile?: string
  dataFile?: string
  type: ArtifactType
  timestamp: number
  code?: string
  source?: string
}

export interface ArtifactContextType {
  artifacts: Artifact[]
  activeArtifact: Artifact | null
  viewMode: ViewMode
  mode: string
  setViewMode: (mode: ViewMode) => void
  setActiveArtifact: (artifact: Artifact | null) => void
  runArtifact: (code: string) => Promise<void>
  updateEditorContent: (content: string) => void
  editorContent: string
  addArtifact: (artifact: Omit<Artifact, 'id' | 'timestamp'>) => void
  setEditorContent: (content: string) => void
  planContent: string
  setPlanContent: (content: string) => void
}

export const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined) 