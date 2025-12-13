import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { Play, Pause, RotateCcw, Settings, History } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const appId = "treadmill-tactician-v1"

// Initialize Firebase (only if config is present)
let db = null
if (firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

// Utility function to merge Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [cockpitMode, setCockpitMode] = useState(false)

  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((time) => time + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setElapsedTime(0)
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 transition-colors",
      cockpitMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"
    )}>
      <header className="mb-8 text-center">
        <h1 className={cn(
          "font-bold",
          cockpitMode ? "text-6xl" : "text-3xl"
        )}>
          Treadmill Tactician
        </h1>
        <p className={cn(
          "mt-2",
          cockpitMode ? "text-2xl text-gray-300" : "text-gray-600"
        )}>
          Interval Training Timer
        </p>
      </header>

      <main className="w-full max-w-md">
        {/* Timer Display */}
        <div className={cn(
          "text-center mb-8 font-mono",
          cockpitMode ? "text-9xl" : "text-6xl"
        )}>
          {formatTime(elapsedTime)}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className={cn(
                "rounded-full p-4 transition-colors",
                cockpitMode
                  ? "bg-green-500 hover:bg-green-400"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <Play className={cockpitMode ? "w-12 h-12" : "w-8 h-8"} />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className={cn(
                "rounded-full p-4 transition-colors",
                cockpitMode
                  ? "bg-yellow-500 hover:bg-yellow-400"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              )}
            >
              <Pause className={cockpitMode ? "w-12 h-12" : "w-8 h-8"} />
            </button>
          )}
          <button
            onClick={handleReset}
            className={cn(
              "rounded-full p-4 transition-colors",
              cockpitMode
                ? "bg-red-500 hover:bg-red-400"
                : "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            <RotateCcw className={cockpitMode ? "w-12 h-12" : "w-8 h-8"} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setCockpitMode(!cockpitMode)}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-colors",
              cockpitMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-800 text-white hover:bg-gray-700"
            )}
          >
            {cockpitMode ? "Exit Cockpit Mode" : "Enter Cockpit Mode"}
          </button>
        </div>
      </main>

      <footer className={cn(
        "mt-8 text-sm",
        cockpitMode ? "text-gray-500" : "text-gray-400"
      )}>
        {/* Placeholder for future features: Settings, History */}
      </footer>
    </div>
  )
}

export default App
