'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setIsSuccess(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        setMessage("Thank you for subscribing! We'll keep you updated.")
        setEmail('')
      } else {
        setIsSuccess(false)
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setIsSuccess(false)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen relative bg-[#f5f4f2] overflow-hidden">
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-80"
        style={{
          backgroundImage: "url('/bg_grid_pattern_white.png')",
          backgroundSize: '1600px 900px',
  
        }}
      />
      {/* Cloud background - positioned at top */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 pointer-events-none z-0">
        <Image
          src="/Clouds.png"
          alt=""
          width={1200}
          height={800}
          className="object-contain"
          priority
        />
      </div>

      {/* Circle text graphic */}
      <div
        className="absolute z-20 pointer-events-none select-none"
        style={{ top: '27%', left: 'calc(50% + 260px)' }}
      >
        <Image
          src="/circle.svg"
          alt="Watch • Create • Earn"
          width={180}
          height={180}
          className="w-[110px] sm:w-[140px] md:w-[160px] h-auto"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        {/* Center block */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
          {/* Logo and tagline */}
          <div className="space-y-2">
            <Image
              src="/logo.svg"
              alt="Pixsee"
              width={600}
              height={250}
              className="h-auto object-contain"
              priority
            />
     
          </div>

          <p className="text-base md:text-lg text-gray-600 pt-4">
            Sign up for future updates
          </p>

          {/* Form - inline input and button */}
          <form
            onSubmit={handleSubmit}
            className="pt-2 flex flex-col items-center gap-3"
          >
            <div className="w-[320px] sm:w-[420px]">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="flex items-center h-[50px] rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-litBlue3 focus-within:border-litBlue3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className="flex-1 h-full bg-transparent px-6 text-base text-gray-800 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-full px-8 rounded-full bg-litBlue3 hover:bg-litBlue4 text-white font-bold text-sm uppercase tracking-wide transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-md"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    'SUBMIT'
                  )}
                </button>
              </div>
            </div>

            {!!message && (
              <div
                aria-live="polite"
                className={`mt-2 w-full max-w-[500px] rounded-2xl px-4 py-3 text-sm font-medium 
                ${isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}
              >
                {message}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}
