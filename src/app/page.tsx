import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles, Clock, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg">SwiftLogNG</span>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-6">
            <Sparkles size={14} />
            <span>AI-Powered Logbook Assistant</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Fill Your SIWES Logbook
            <br />
            <span className="text-gray-500">In Seconds, Not Hours</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Write a quick summary of your week, and let AI generate detailed,
            professional daily log entries tailored to your role and company.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Writing
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Why Students Love SwiftLogNG
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save Hours Weekly</h3>
              <p className="text-gray-600 text-sm">
                Turn a 5-minute summary into 5 detailed daily logs. No more
                staring at blank pages every weekend.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Professional Quality</h3>
              <p className="text-gray-600 text-sm">
                AI generates logs that match your department, role, and company
                context. Ready for supervisor review.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Version History</h3>
              <p className="text-gray-600 text-sm">
                Edit and regenerate anytime. All previous versions are saved so
                you never lose your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Your Logbook?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of IT/SIWES students already using SwiftLogNG
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            4 weeks free every month. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm text-gray-600">
              SwiftLogNG &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Made with care for Nigerian students
          </p>
        </div>
      </footer>
    </div>
  );
}
