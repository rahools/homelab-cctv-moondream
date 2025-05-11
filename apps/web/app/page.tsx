import CCTVMonitor from "./_components/cctv-monitor"

import "./globals.css"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl">
        <CCTVMonitor />
      </div>
    </main>
  )
}

