// useSpeechRecognition — Web Speech API wrapper for voice input

import { useState, useCallback, useRef, useEffect } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const [isSupported] = useState(
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
  const recognitionRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    setError(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let newTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (newTranscript.trim()) {
        setTranscript((prev) => (prev ? prev + ' ' : '') + newTranscript.trim())
      }
    }

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your mic.',
        'not-allowed': 'Microphone access denied. Please allow mic access.',
        'network': 'Network error during speech recognition.',
      }
      setError(errorMessages[event.error] || `Speech error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)

    // Auto-stop after 60 seconds to prevent runaway recording
    setTimeout(() => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }, 60000)
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return { transcript, isListening, error, isSupported, startListening, stopListening, resetTranscript, setTranscript }
}
