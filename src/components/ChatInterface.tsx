import { Box, TextField, Button, Stack, Paper, Typography, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useState } from 'react'
import { chatWithLLM } from '../services/api'
import { useArtifact } from '../contexts/useArtifact'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addArtifact, setEditorContent, setMode, runArtifact } = useArtifact()

  const parseCodeFromResponse = async (response: string, input: string) => {
    // Look for code blocks with ```python
    const codeBlockRegex = /```python\n([\s\S]*?)```/g
    const matches = [...response.matchAll(codeBlockRegex)]
    
    // Create a concise title from the user's input
    const artifactName = input.length > 50 ? input.substring(0, 47) + '...' : input
    
    // Get the last code block to set in editor
    const lastCodeBlock = matches[matches.length - 1]
    
    for (const match of matches) {
      if (match[1]) {
        const code = match[1].trim()
        
        // If this is the last code block, set it in the editor and run it
        if (match === lastCodeBlock) {
          setMode('code')
          setEditorContent(code)
          try {
            // Let runArtifact handle the artifact creation and execution
            await runArtifact(code, artifactName)
          } catch (err) {
            console.error('Failed to run code:', err)
            // Only add artifact if execution failed
            addArtifact({
              type: 'code',
              name: artifactName,
              code,
              output: err instanceof Error ? err.message : 'Failed to run code',
              plotFile: undefined,
              dataFile: undefined,
              source: 'assistant'
            })
          }
        }
      }
    }

    // Return the response with code blocks removed for chat display
    return response.replace(codeBlockRegex, '[Code added to editor and executed]')
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      role: 'user',
      content: input
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await chatWithLLM(input, {
        provider: 'ollama',
        model: 'qwen2.5'
      })

      // Parse code blocks and create artifacts
      const processedResponse = await parseCodeFromResponse(response, input)

      const assistantMessage: Message = {
        role: 'assistant',
        content: processedResponse
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((message, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 2, 
              mb: 1, 
              bgcolor: message.role === 'user' ? 'primary.light' : 'secondary.light',
              ml: message.role === 'user' ? 'auto' : 0,
              mr: message.role === 'assistant' ? 'auto' : 0,
              maxWidth: '80%'
            }}
          >
            <Typography>{message.content}</Typography>
          </Paper>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {error && (
          <Paper sx={{ p: 2, mb: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          size="small"
          disabled={isLoading}
        />
        <Button 
          variant="contained" 
          onClick={handleSend}
          endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          disabled={isLoading || !input.trim()}
        >
          Send
        </Button>
      </Stack>
    </Box>
  )
} 