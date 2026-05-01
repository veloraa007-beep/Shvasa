import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_50%_0%,_#F5F3EF_0%,_#FDFBF7_100%)]">
      <div className="mb-8 p-4 bg-primary/10 rounded-full animate-pulse">
        <Leaf className="w-16 h-16 text-primary" />
      </div>
      
      <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 tracking-tight text-on-surface">
        Shvasa
      </h1>
      
      <p className="font-body text-xl md:text-2xl text-on-surface-variant max-w-2xl mb-12">
        A nature-inspired sanctuary for your focus and discipline. Stop doom-scrolling and start growing.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/login"
          className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/signup"
          className="px-8 py-4 bg-surface-container border-2 border-primary/20 text-primary rounded-xl font-bold text-lg hover:bg-primary/10 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
