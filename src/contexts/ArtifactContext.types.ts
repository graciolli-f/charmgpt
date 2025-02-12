import { createContext } from 'react'

export type EditorMode = 'code' | 'plan'
export type ViewMode = 'plot' | 'data' | 'output'

export type ArtifactType = 'chat' | 'code' | 'visualization' | 'data'

/**
 * Gets the display name for a file by removing the runId prefix.
 * This matches the server-side logic for symlink names.
 */
export const getDisplayName = (artifact: Artifact): string => {
  if (!artifact.dataFile) {
    return artifact.name
  }
  // Use a display name based on the artifact name or original filename
  const displayName = artifact.name.endsWith('.csv')
    ? artifact.name
    : artifact.dataFile.replace(/^[^_]+_/, '') // Remove runId prefix
  return displayName
}

export const dataHeader = (dataFile?: string): string|undefined => {
  if (!dataFile) return undefined;
  
  // Use XMLHttpRequest for sync request
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/api/header/${dataFile}`, false);  // false makes it synchronous
  xhr.send(null);
  
  if (xhr.status === 200) {
    return xhr.responseText;
  }
  
  return undefined;
}

export interface ProcessingJob {
  jobId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  type: 'conversion' | 'summary';
  error?: string;
}

export interface Artifact {
  id: number
  name: string
  output: string
  plotFile?: string
  dataFile?: string
  dataFiles: Record<string, string>  // Map of step name to file name
  lineNumbers: Record<string, number>  // Map of step name to line number
  type: ArtifactType
  timestamp: number
  code?: string
  source?: string
  pinned?: boolean
  chatInput?: string
  processingJob?: ProcessingJob
}

export interface ArtifactContextType {
  artifacts: Artifact[]
  activeArtifact: Artifact | null
  viewMode: ViewMode
  mode: EditorMode
  setMode: (mode: EditorMode) => void
  setViewMode: (mode: ViewMode) => void
  setActiveArtifact: (artifact: Artifact | null) => void
  runArtifact: (code: string, name?: string, chatInput?: string) => Promise<void>
  editorContent: string
  setEditorContent: (content: string) => void
  planContent: string
  setPlanContent: (content: string) => void
  addArtifact: (artifact: Omit<Artifact, 'id' | 'timestamp'>) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  generateSummary: () => Promise<string>
  togglePin: (artifactId: number) => Promise<void>
  updateArtifact: (artifact: Artifact) => void
  handleChat: (message?: string) => Promise<boolean>
  selectedStep: string
  setSelectedStep: (step: string) => void
}

export const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined)

export const getDefaultViewMode = (artifact: Artifact): ViewMode => {
  if (artifact.dataFile) {
    return 'data'  // Only default to data view for final data files
  } else if (artifact.plotFile) {
    return 'plot'
  } else {
    return 'output'
  }
<<<<<<< HEAD
}

// Add helper to check if artifact has any data
export const hasData = (artifact: Artifact): boolean => {
  const result = !!(artifact.dataFile || Object.keys(artifact.dataFiles).length > 0)
  console.log('hasData check:', {
    artifact,
    hasDataFile: !!artifact.dataFile,
    hasDataFiles: Object.keys(artifact.dataFiles).length > 0,
    result
  })
  return result
} 
=======
} 
>>>>>>> main
