import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">PhotoFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Beautiful Photo Galleries
            <br />
            <span className="text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create stunning photo galleries, share them securely with clients, 
            and manage your photography business all in one place.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
            <p className="text-gray-600">
              Upload and organize hundreds of photos in minutes. 
              Your galleries are ready to share instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Secure Sharing</h3>
            <p className="text-gray-600">
              Password-protected galleries ensure only your clients 
              can access their photos.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
              <Camera className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Professional</h3>
            <p className="text-gray-600">
              Clean, beautiful galleries that showcase your work 
              and impress your clients.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-gray-500">
          <p>&copy; 2024 PhotoFlow. Built for photographers, by photographers.</p>
        </div>
      </footer>
    </div>
  )
}