"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Lock } from "lucide-react"

interface AuthFormProps {
    onSubmit: (token: string) => void
}

export default function AuthForm({ onSubmit }: AuthFormProps) {
    const [token, setToken] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (token.trim()) {
            onSubmit(token.trim())
        }
    }

    return (
        <div className="border-2 border-gray-700 p-3 bg-gray-900">
            <div className="text-xs uppercase mb-2 text-center border-b border-gray-700 pb-1">
                <span className="text-amber-500">SECURITY</span> AUTHORIZATION
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs mb-2">Enter authorization token to connect to CCTV server:</div>

                <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={14} />
                    </div>
                    <Input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="AUTH TOKEN"
                        className="pl-8 bg-gray-800 border-gray-700 text-green-500 font-mono text-sm"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-green-900 hover:bg-green-800 text-white font-mono uppercase tracking-wider"
                >
                    Connect
                </Button>

                <div className="text-xs text-gray-500 text-center">Unauthorized access is prohibited and will be logged.</div>
            </form>
        </div>
    )
}
