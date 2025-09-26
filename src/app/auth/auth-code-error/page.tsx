'use client'

import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem with the authentication process
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Possible causes:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Supabase environment variables not configured</li>
                <li>Google OAuth credentials not set up</li>
                <li>Redirect URI mismatch</li>
              </ul>
            </div>
          </div>

          <Link
            href="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Login
          </Link>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Check the setup guide for configuration instructions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
