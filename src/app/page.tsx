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
    <>
      <main className="min-h-screen relative bg-[#f5f4f2] overflow-hidden">
      {/* Cloud background - positioned at top */}
      <div className="absolute top-[0%] sm:top-[18%] left-1/2 w-[880px] sm:w-[1100px] -translate-x-1/2 pointer-events-none z-10">
        <div className="relative w-full">
          <div
            className="absolute inset-0 opacity-80 z-15 animate-[gridGlide_24s_linear_infinite]"
            style={{
              backgroundImage: "url('/bg_grid_pattern_white.png')",
              backgroundSize: '1200px 1200px',
              backgroundRepeat: 'repeat',
              backgroundBlendMode: 'screen',
              backgroundPosition: 'center',
              mixBlendMode: 'screen',
            }}
          />
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute inset-0 animate-[lightningPulse_8s_linear_infinite]" style={{ background: 'radial-gradient(circle at 68% 42%, rgba(255,255,255,0.45), transparent 55%)' }} />
            <div className="absolute inset-0 animate-[lightningPulseAlt_12s_linear_infinite]" style={{ background: 'radial-gradient(circle at 32% 58%, rgba(255,240,200,0.38), transparent 60%)' }} />
            <div className="absolute inset-0 animate-[lightningStrand_14s_linear_infinite] opacity-70" style={{ background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.35) 48%, transparent 55%)' }} />
          </div>
          <Image
            src="/Clouds.png"
            alt=""
            width={1200}
            height={800}
            className="w-full h-auto relative z-10 animate-[cloudDrift_16s_ease-in-out_infinite]"
            priority
          />
        </div>
      </div>

      {/* Circle text graphic */}
      <div className="absolute top-[26%] left-1/2 hidden md:block z-20 pointer-events-none select-none">
        <Image
          src="/circle.svg"
          alt="Watch • Create • Earn"
          width={180}
          height={180}
          className="w-[160px] lg:w-[180px] h-auto translate-x-[240px] lg:translate-x-[280px] animate-[spin_25s_linear_infinite]"
          priority
        />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4">
        {/* Center block */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
          {/* Logo and tagline */}
          <div className="space-y-2">
            <Image
              src="/logo.svg"
              alt="Pixsee"
              width={600}
              height={250}
            className="w-[300px] sm:w-[420px] md:w-[520px] lg:w-[560px] h-auto object-contain"
              priority
            />
     
          </div>

          <p className="text-base md:text-lg text-gray-600 pt-4">
            Sign up for future updates
          </p>

          {/* Form - inline input and button */}
          <form
            onSubmit={handleSubmit}
            className="pt-2 flex flex-col items-center gap-4"
          >
            <div className="w-full max-w-[500px] px-2 sm:px-0">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="flex items-center h-[50px] rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-litBlue3 focus-within:border-litBlue3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  autoComplete="email"
                  className="flex-1 h-full bg-transparent px-5 sm:px-6 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-full px-7 sm:px-8 rounded-full bg-litBlue3 hover:bg-litBlue4 text-white font-bold text-sm uppercase tracking-wide transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-md flex-shrink-0"
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

          <div className="pt-3">
            <a
              href="https://pump.fun/coin/7Lafx33QDj3ATpT3gHzUuwukav2CUjGAhKwgZpM2pump"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#692f96] px-6 py-3 text-xs sm:text-sm font-semibold  tracking-wide text-white shadow-md transition-transform duration-150 hover:scale-[1.03] hover:bg-[#7e38b3] active:scale-[0.97]"
            >
              7Lafx33QDj3ATpT3gHzUuwukav2CUjGAhKwgZpM2pump
            </a>
          </div>
        </section>
      </div>
      </main>
      <style jsx global>{`
        @keyframes cloudDrift {
          0% {
            transform: translateY(-2%) scale(1);
          }
          50% {
            transform: translateY(3%) scale(1.02);
          }
          100% {
            transform: translateY(-2%) scale(1);
          }
        }

        @keyframes gridGlide {
          0% {
            background-position: center 0px;
          }
          50% {
            background-position: calc(50% + 25px) 30px;
          }
          100% {
            background-position: center 0px;
          }
        }

        @keyframes lightningPulse {
          0%, 52%, 100% {
            opacity: 0;
          }
          53% {
            opacity: 0.95;
          }
          55% {
            opacity: 0.2;
          }
          60% {
            opacity: 0.7;
          }
          63% {
            opacity: 0;
          }
        }

        @keyframes lightningPulseAlt {
          0%, 28%, 100% {
            opacity: 0;
          }
          29% {
            opacity: 0.85;
          }
          31% {
            opacity: 0.15;
          }
          36% {
            opacity: 0.6;
          }
          38% {
            opacity: 0;
          }
        }

        @keyframes lightningStrand {
          0%, 70%, 100% {
            opacity: 0;
            transform: translateX(-10%) skewX(-18deg);
          }
          71% {
            opacity: 0.85;
            transform: translateX(0%) skewX(-12deg);
          }
          73% {
            opacity: 0.2;
            transform: translateX(6%) skewX(-8deg);
          }
          78% {
            opacity: 0.65;
            transform: translateX(-4%) skewX(-16deg);
          }
          80% {
            opacity: 0;
            transform: translateX(0%) skewX(-18deg);
          }
        }
      `}</style>
    </>
  )
}
