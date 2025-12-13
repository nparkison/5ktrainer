import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, ChevronRight, Settings, BarChart, Calendar, ChevronLeft, Save } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Data Models & Constants ---

// Default speeds (mph) - User can override
const DEFAULT_SPEEDS = {
  walk: 3.5,
  jog: 5.5,
  run: 7.0,
  sprint: 9.0,
};

// The 6-Week "Athlete" 5k Plan
// Phases: 'warmup', 'steady', 'interval', 'hill', 'recovery', 'cooldown'
const TRAINING_PLAN = [
  {
    week: 1,
    title: "Foundation & Speed Play",
    workouts: [
      {
        id: 'w1d1',
        name: "The Rust Buster",
        type: "Intervals",
        description: "Short intervals to get the legs moving fast without fatigue.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 180, incline: 0, speed: 'jog' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w1d2',
        name: "Incline Intro",
        type: "Hills",
        description: "Building posterior chain strength with manageable hills.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 120, incline: 1, speed: 'jog' },
          { type: 'hill', duration: 60, incline: 3, speed: 'jog' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'hill', duration: 60, incline: 4, speed: 'jog' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'hill', duration: 60, incline: 5, speed: 'jog' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 300, incline: 0, speed: 'jog' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w1d3',
        name: "Steady State",
        type: "Endurance",
        description: "A continuous effort to build aerobic base.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 1200, incline: 1, speed: 'jog' }, // 20 mins
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      }
    ]
  },
  {
    week: 2,
    title: "Escalation",
    workouts: [
      {
        id: 'w2d1',
        name: "Pyramid Intervals",
        type: "Intervals",
        description: "Ladder up, ladder down. Mental engagement is high.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 120, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 180, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 120, incline: 0, speed: 'run' },
          { type: 'recovery', duration: 60, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 60, incline: 0, speed: 'run' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w2d2',
        name: "Rolling Hills",
        type: "Hills",
        description: "Constant incline changes. Don't touch the speed, touch the incline.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 120, incline: 2, speed: 'jog' },
          { type: 'hill', duration: 60, incline: 4, speed: 'jog' },
          { type: 'steady', duration: 120, incline: 2, speed: 'jog' },
          { type: 'hill', duration: 60, incline: 5, speed: 'jog' },
          { type: 'steady', duration: 120, incline: 2, speed: 'jog' },
          { type: 'hill', duration: 60, incline: 6, speed: 'jog' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w2d3',
        name: "Long Run",
        type: "Endurance",
        description: "Extending the duration.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 1500, incline: 1, speed: 'jog' }, // 25 mins
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      }
    ]
  },
    {
    week: 3,
    title: "Power Phase",
    workouts: [
      {
        id: 'w3d1',
        name: "Speed Repeats",
        type: "Intervals",
        description: "Hitting that sprint pace.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 45, incline: 0, speed: 'sprint' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 45, incline: 0, speed: 'sprint' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 45, incline: 0, speed: 'sprint' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
           { type: 'interval', duration: 45, incline: 0, speed: 'sprint' },
          { type: 'recovery', duration: 90, incline: 0, speed: 'walk' },
          { type: 'interval', duration: 45, incline: 0, speed: 'sprint' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w3d2',
        name: "The Mountain",
        type: "Hills",
        description: "Sustained climb.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 300, incline: 2, speed: 'jog' },
          { type: 'hill', duration: 180, incline: 4, speed: 'jog' },
          { type: 'hill', duration: 120, incline: 6, speed: 'jog' },
          { type: 'hill', duration: 60, incline: 8, speed: 'walk' }, // steep walk
          { type: 'steady', duration: 300, incline: 0, speed: 'jog' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      },
      {
        id: 'w3d3',
        name: "Mock 5k Pace",
        type: "Endurance",
        description: "30 minutes continuous. Race simulation.",
        segments: [
          { type: 'warmup', duration: 300, incline: 0, speed: 'walk' },
          { type: 'steady', duration: 1800, incline: 1, speed: 'jog' },
          { type: 'cooldown', duration: 300, incline: 0, speed: 'walk' },
        ]
      }
    ]
  }
];

// --- Utility Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "border-2 border-slate-600 text-slate-300 hover:bg-slate-800"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="h-2 bg-slate-700 rounded-full w-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// --- Main Application Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSpeeds, setUserSpeeds] = useState(DEFAULT_SPEEDS);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [runState, setRunState] = useState('idle'); // idle, running, paused, finished
  
  // Auth & Data Loading
  useEffect(() => {
    const initAuth = async () => {
       if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
        } catch (e) {
            console.error("Custom token failed, trying anon", e);
            await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Completed Workouts
  useEffect(() => {
    if (!user) return;
    
    // Fetch speeds if saved, else default
    const loadUserData = async () => {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().speeds) {
            setUserSpeeds(docSnap.data().speeds);
        }
    }
    loadUserData();

    const q = query(
        collection(db, 'artifacts', appId, 'users', user.uid, 'workouts'),
        orderBy('completedAt', 'desc')
    );

    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedWorkouts(workouts.map(w => w.workoutId));
    }, (error) => {
        console.error("Error fetching workouts:", error);
    });

    return () => unsubscribeData();
  }, [user]);

  // Save Settings
  const saveSpeeds = async (newSpeeds) => {
      setUserSpeeds(newSpeeds);
      if(user) {
          try {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), {
                speeds: newSpeeds
            }, { merge: true });
          } catch (e) {
              console.error("Error saving settings", e);
          }
      }
  };

  const markWorkoutComplete = async (workoutId) => {
      if(!user) return;
      try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'workouts', `${workoutId}_${Date.now()}`), {
              workoutId,
              completedAt: serverTimestamp(),
              speedsUsed: userSpeeds
          });
      } catch (e) {
          console.error("Error saving workout", e);
      }
  };

  // --- Render Logic ---

  if (!user) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Trainer...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-20 md:pb-0">
      
      {/* Run Interface (Takes over screen if active) */}
      {selectedWorkout ? (
        <ActiveWorkoutRunner 
            workout={selectedWorkout} 
            userSpeeds={userSpeeds}
            onExit={() => {
                setSelectedWorkout(null);
                setRunState('idle');
            }}
            onComplete={() => {
                markWorkoutComplete(selectedWorkout.id);
                setRunState('finished');
            }}
            runState={runState}
            setRunState={setRunState}
        />
      ) : (
        /* Main Dashboard Interface */
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <header className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Treadmill Tactician</h1>
                        <p className="text-xs text-slate-400 font-mono">NOBLESVILLE WINTER PROTOCOL</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        {completedWorkouts.length}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6">
                
                {activeTab === 'dashboard' && (
                    <>
                        {/* Weekly Progress Overview */}
                        <div className="space-y-4">
                            {TRAINING_PLAN.map((week) => (
                                <div key={week.week} className="space-y-2">
                                    <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold ml-1">Week {week.week}: {week.title}</h2>
                                    <div className="grid gap-3">
                                        {week.workouts.map((workout) => {
                                            const isDone = completedWorkouts.includes(workout.id);
                                            return (
                                                <Card key={workout.id} className={`relative overflow-hidden transition-all ${isDone ? 'opacity-60 grayscale' : 'hover:border-blue-500/50'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                                    workout.type === 'Intervals' ? 'bg-orange-500/20 text-orange-400' :
                                                                    workout.type === 'Hills' ? 'bg-purple-500/20 text-purple-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                    {workout.type}
                                                                </span>
                                                                {isDone && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Done</span>}
                                                            </div>
                                                            <h3 className="font-bold text-lg leading-tight mb-1">{workout.name}</h3>
                                                            <p className="text-sm text-slate-400">{workout.description}</p>
                                                            <div className="mt-3 flex gap-4 text-xs font-mono text-slate-500">
                                                                <span>{Math.round(workout.segments.reduce((acc, curr) => acc + curr.duration, 0) / 60)} MIN</span>
                                                                <span>{workout.segments.length} SEGMENTS</span>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant={isDone ? 'outline' : 'primary'} 
                                                            className="h-10 w-10 !p-0 rounded-full"
                                                            onClick={() => {
                                                                setSelectedWorkout(workout);
                                                                setRunState('idle');
                                                            }}
                                                        >
                                                            {isDone ? <RotateCcw size={18} /> : <Play size={18} fill="currentColor" />}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'settings' && (
                    <SettingsPanel currentSpeeds={userSpeeds} onSave={saveSpeeds} />
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around items-center z-20 max-w-md mx-auto">
                <NavButton icon={Calendar} label="Plan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavButton icon={Settings} label="Pacing" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
        </div>
      )}
    </div>
  );
}

// --- Active Workout Component (The "Cockpit") ---

const ActiveWorkoutRunner = ({ workout, userSpeeds, onExit, onComplete, runState, setRunState }) => {
    const [segmentIndex, setSegmentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(workout.segments[0].duration);
    const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
    
    const currentSegment = workout.segments[segmentIndex];
    const nextSegment = workout.segments[segmentIndex + 1];
    const totalDuration = useMemo(() => workout.segments.reduce((acc, s) => acc + s.duration, 0), [workout]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (runState === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                setTotalTimeElapsed((prev) => prev + 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Segment finished
            if (segmentIndex < workout.segments.length - 1) {
                setSegmentIndex(prev => prev + 1);
                setTimeLeft(workout.segments[segmentIndex + 1].duration);
                // Optional: Play beep sound here
            } else {
                setRunState('finished');
                onComplete();
            }
        }
        return () => clearInterval(interval);
    }, [runState, timeLeft, segmentIndex, workout.segments]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSpeedValue = (speedKey) => {
        return userSpeeds[speedKey] || 0;
    };

    const getSegmentColor = (type) => {
        switch(type) {
            case 'warmup': case 'cooldown': return 'bg-blue-600';
            case 'steady': return 'bg-green-600';
            case 'interval': return 'bg-orange-600';
            case 'hill': return 'bg-purple-600';
            case 'recovery': return 'bg-slate-600';
            default: return 'bg-slate-700';
        }
    };

    // Finished State
    if (runState === 'finished') {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-900/50">
                    <CheckCircle size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold">Workout Complete!</h2>
                <p className="text-slate-400">Great session. That's one step closer to the 5k goal.</p>
                <Button onClick={onExit} className="w-full max-w-xs" variant="primary">Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Top Bar */}
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
                <button onClick={onExit} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
                    <ChevronLeft size={16} /> Exit
                </button>
                <span className="text-xs font-mono text-slate-500">
                    SEGMENT {segmentIndex + 1}/{workout.segments.length}
                </span>
            </div>

            {/* Main Cockpit Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background Progress Indicator */}
                <div className="absolute inset-x-0 top-0 h-1 bg-slate-800 z-10">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${(totalTimeElapsed / totalDuration) * 100}%` }}
                    />
                </div>

                {/* Primary Display */}
                <div className={`flex-1 flex flex-col items-center justify-center transition-colors duration-500 relative ${getSegmentColor(currentSegment.type)}`}>
                    
                    {/* Background Texture/Pattern for visual interest */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />

                    <div className="z-10 text-center space-y-2">
                        <span className="text-white/80 font-bold uppercase tracking-[0.2em] text-sm animate-pulse">
                            {currentSegment.type}
                        </span>
                        <div className="text-9xl font-black tabular-nums tracking-tighter text-white drop-shadow-xl">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-white/90 text-sm font-mono">
                            REMAINING
                        </div>
                    </div>
                </div>

                {/* Treadmill Settings Command Center */}
                <div className="h-1/3 bg-slate-900 border-t border-slate-800 grid grid-cols-2 divide-x divide-slate-800">
                    <div className="flex flex-col items-center justify-center p-4">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Incline</span>
                        <div className="text-5xl font-bold text-purple-400">
                            {currentSegment.incline}<span className="text-2xl text-slate-600 ml-1">%</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Speed</span>
                        <div className="text-5xl font-bold text-blue-400">
                            {getSpeedValue(currentSegment.speed)}<span className="text-2xl text-slate-600 ml-1">mph</span>
                        </div>
                    </div>
                </div>

                {/* Next Segment Preview (Toast style) */}
                {nextSegment && (
                    <div className="absolute bottom-[35%] left-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10 flex justify-between items-center text-sm z-20">
                        <span className="text-slate-300">Up Next: <span className="text-white font-bold uppercase">{nextSegment.type}</span></span>
                        <span className="font-mono text-slate-400">{formatTime(nextSegment.duration)}</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center gap-6">
                {runState === 'running' ? (
                    <Button onClick={() => setRunState('paused')} variant="secondary" className="w-full max-w-xs h-16 text-xl">
                        <Pause fill="currentColor" /> PAUSE
                    </Button>
                ) : (
                    <Button onClick={() => setRunState('running')} variant="success" className="w-full max-w-xs h-16 text-xl">
                        <Play fill="currentColor" /> {runState === 'idle' ? 'START WORKOUT' : 'RESUME'}
                    </Button>
                )}
            </div>
        </div>
    );
};

// --- Settings Panel ---

const SettingsPanel = ({ currentSpeeds, onSave }) => {
    const [speeds, setSpeeds] = useState(currentSpeeds);

    const handleChange = (key, val) => {
        setSpeeds(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <Card>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings size={20} /> Treadmill Calibration
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                    Set your preferred speeds (mph) for each intensity level. The app will use these to generate your workout instructions.
                </p>

                <div className="space-y-6">
                    {[
                        { key: 'walk', label: 'Walk / Recovery', desc: 'Comfortable walking pace' },
                        { key: 'jog', label: 'Jog / Steady', desc: 'Conversational pace, Zone 2' },
                        { key: 'run', label: 'Run / Threshold', desc: 'Uncomfortable but sustainable, Zone 3/4' },
                        { key: 'sprint', label: 'Sprint / Interval', desc: 'Maximum sustainable effort for 1 min' }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-200">{item.label}</label>
                                <span className="text-xs text-slate-500">{item.desc}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-700">
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={speeds[item.key]}
                                    onChange={(e) => handleChange(item.key, parseFloat(e.target.value))}
                                    className="bg-transparent w-16 text-right font-mono font-bold focus:outline-none"
                                />
                                <span className="text-xs text-slate-500 font-mono">MPH</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-700">
                    <Button onClick={() => onSave(speeds)} className="w-full">
                        <Save size={18} /> Save Configuration
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);