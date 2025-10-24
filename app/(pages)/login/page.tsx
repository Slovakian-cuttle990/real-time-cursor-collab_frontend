'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
    const [name, setName] = useState("")
    const router = useRouter()

    const handleLogin = () => {
        if (name.trim()) {
            localStorage.setItem("username", name.trim())
        } else {
            localStorage.setItem("username", "Guest")
        }
        router.push("/dashboard")
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-100 to-gray-300">
            <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-sm">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-8">Login</h1>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                >
                    Login
                </button>
            </div>
        </div>
    )
}
