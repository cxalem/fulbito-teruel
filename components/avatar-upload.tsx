'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'
import { uploadAvatar } from '@/lib/utils/avatar-upload'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatar?: string | null
  displayName: string
  onAvatarChange: (avatarUrl: string | null) => void
  className?: string
}

export function AvatarUpload({ 
  currentAvatar, 
  displayName, 
  onAvatarChange,
  className = ""
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string): string => {
    const words = name.split(' ').filter(Boolean)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Upload to Supabase
      const result = await uploadAvatar(file)
      
      if (result.success && result.url) {
        onAvatarChange(result.url)
        toast.success('Avatar subido con éxito')
      } else {
        // Revert preview on error
        setPreviewUrl(currentAvatar || null)
        toast.error(result.error || 'Error al subir avatar')
      }

      // Clean up object URL
      URL.revokeObjectURL(objectUrl)
      
    } catch (error) {
      console.error('Upload error:', error)
      setPreviewUrl(currentAvatar || null)
      toast.error('Error inesperado al subir avatar')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-16 w-16">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback className="text-lg font-medium">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="cursor-pointer"
        >
          <Camera className="h-4 w-4 mr-2" />
          {currentAvatar || previewUrl ? 'Cambiar avatar' : 'Subir avatar'}
        </Button>
        
        {(currentAvatar || previewUrl) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPreviewUrl(null)
              onAvatarChange(null)
              toast.success('Avatar eliminado')
            }}
            disabled={isUploading}
            className="cursor-pointer text-muted-foreground"
          >
            Eliminar avatar
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
