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
    <main className="min-h-screen bg-gradient-to-br from-black/50 via-litRed/50 to-litPurple/80 md:from-black md:via-litRed/60 md:to-litPurple">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Center block */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
          {/* Logo (unchanged) */}
          <div className="mb-4">
            <div className="p-6 rounded-3xl  ">
              <Image
                src="/pixsee-logo.png"
                alt="Pixsee - Be your own box office"
                width={400}
                height={200}
                className="h-auto object-contain"
                priority
              />
            </div>
            <h2 className="text-medium text-4xl text-litBlue3">Be your own box office</h2>
          </div>

      
          <p className="text-base md:text-2xl mt-16 text-litPurple/90">
          Sign up for future updates! 
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col items-center gap-3"
          >
            <label htmlFor="email" className="sr-only">Email</label>

            {/* Fixed-width input — NOT full width */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              className="w-[320px] sm:w-[360px] h-[40px] rounded-full py-4 px-5 text-base
                         bg-white border border-gray-300
                         placeholder:text-gray-400
                         outline-none focus:ring-2 focus:ring-litBlue4 focus:border-litBlue4"
            />
 
            {/* Purple oval button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[320px] sm:w-[360px] h-[60px] rounded-full py-4 px-5
                         bg-litBlue3 hover:bg-litBlue4
                         text-white font-semibold
                         transition-transform duration-150
                         hover:scale-[1.01] active:scale-[0.99]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  Subscribing…
                </span>
              ) : (
                'SUBMIT'
              )}
            </button>

           

            {!!message && (
              <div
                aria-live="polite"
                className={`mt-2 w-[320px] sm:w-[360px] rounded-2xl px-4 py-3 text-sm font-medium 
                ${isSuccess ? 'bg-green-50 text-green-800 border-green-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}
              >
                {message}
              </div>
            )}
          </form>
        </section>

        <footer className="text-center py-10 text-gray-900">
          <p>&copy; {new Date().getFullYear()} Pixsee. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
