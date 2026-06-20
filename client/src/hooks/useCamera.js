// useCamera — MediaDevices camera access for handwriting photo capture

import { useState, useCallback, useRef, useEffect } from 'react'

export function useCamera() {
  const [capturedImage, setCapturedImage] = useState(null) // base64 data URL
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsActive(true)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError' ? 'Camera access denied. Please allow camera access.' :
        err.name === 'NotFoundError' ? 'No camera found on this device.' :
        `Camera error: ${err.message}`
      setError(msg)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return null

    // Create a canvas to capture the frame
    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)

    // Stop the camera after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsActive(false)

    // Return the base64 data (without the data:image/jpeg;base64, prefix)
    return dataUrl.split(',')[1]
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }, [])

  const resetCapture = useCallback(() => {
    setCapturedImage(null)
    setError(null)
  }, [])

  return {
    capturedImage,
    isActive,
    error,
    videoRef,
    canvasRef,
    startCamera,
    capturePhoto,
    stopCamera,
    resetCapture,
  }
}
