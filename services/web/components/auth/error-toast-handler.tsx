'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

function ErrorToastHandlerContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      let title = 'Authentication Error'
      let description = 'An error occurred during authentication. Please try again.'

      if (error === 'unauthorized_user') {
        title = 'Access Denied'
        description = 'Your account is not authorized to access this application. Please contact your administrator.'
      } else if (error === 'unauthorized_role') {
        title = 'Insufficient Permissions'
        description = 'Your account does not have the required permissions. Please contact your administrator.'
      } else if (error === 'auth') {
        title = 'Authentication Failed'
        description = 'Failed to authenticate with Google. Please try again.'
      }

      console.log('Showing toast:', title, description)

      // Show the toast
      toast({
        title,
        description,
        variant: 'destructive',
      })

      // Wait 3 seconds before clearing error param to allow toast to be visible
      const timer = setTimeout(() => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('error')
        window.history.replaceState({}, '', newUrl.toString())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [searchParams, toast])

  return null
}

export function ErrorToastHandler() {
  return <ErrorToastHandlerContent />
}
