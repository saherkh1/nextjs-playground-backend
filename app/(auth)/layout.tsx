import { Camera } from 'lucide-react';
import { H1, H2, P } from '@/components/ui/typography';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface-muted">
      <div className="flex min-h-screen">
        {/* Left side - Brand */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-surface/50">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <span className="text-3xl font-semibold text-text-primary font-brand">PhotoFlow</span>
            </div>
            
            <div className="space-y-6 mb-10">
              <H1 className="text-4xl leading-tight">
                Beautiful Galleries,<br />
                <span className="text-primary">Simple Sharing</span>
              </H1>
              
              <P className="text-lg text-text-secondary leading-relaxed">
                Create stunning photo galleries and share them securely 
                with your clients. Professional photography made simple.
              </P>
            </div>
            
            <div className="space-y-4 text-text-secondary">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="font-normal">Drag & drop photo uploads</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="font-normal">Password-protected galleries</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="font-normal">Mobile-responsive viewing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="font-normal">Client download controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-surface/30">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile brand header */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <H2 className="text-2xl font-semibold text-text-primary font-brand">PhotoFlow</H2>
            </div>
            
            {children}
            
            {/* Footer */}
            <div className="mt-8 text-center">
              <P className="text-sm text-text-muted">&copy; 2024 PhotoFlow. Built for photographers.</P>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}