'use client'

import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import Image from "next/image"
import { CursorPosition } from "@/app/lib/cursor/types"
import cursorImg from "@/public/images/cursor.png"

const getRandomColor = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6C63FF", "#1DD1A1", "#FF9F43", "#00B8D9", "#F368E0"]
    return colors[Math.floor(Math.random() * colors.length)]
}

export default function Page() {
    const [text, setText] = useState("")
    const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
    const [socketId, setSocketId] = useState<string>("")
    const [colors, setColors] = useState<Record<string, string>>({})
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const socket: Socket = io(process.env.NEXT_PUBLIC_SERVER_SOCKET_URL as string)
        socketRef.current = socket

        const savedName = localStorage.getItem("username") || "Guest"

        socket.on("connect", () => {
            setSocketId(socket.id ?? "")
            socket.emit("registername", savedName)
        })

        socket.on("updateText", (newText) => setText(newText))
        socket.on("updateCursor", (data) => {
            setCursors((prev) => ({ ...prev, [data.socketId]: data }))
            setColors((prev) => (prev[data.socketId] ? prev : { ...prev, [data.socketId]: getRandomColor() }))
        })
        socket.on("removeCursor", (id) => {
            setCursors((prev) => {
                const updated = { ...prev }
                delete updated[id]
                return updated
            })
        })
        socket.on("updateCursors", (serverCursors) => setCursors(serverCursors))
        socket.on("userRegistered", ({ id, name }) => {
            setCursors((prev) => ({
                ...prev,
                [id]: { ...(prev[id] || {}), socketId: id, name },
            }))
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setText(value)
        socketRef.current?.emit("textChange", value)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        socketRef.current?.emit("cursorMove", { x, y })
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[110vh] px-5 from-gray-50 to-gray-100">
            <textarea

                className="border border-gray-600 shadow-sm w-full max-w-[800px] min-h-[110vh] p-10 focus:outline-none resize-none mt-10 mb-20 bg-white text-gray-800 placeholder-gray-500"
                value={text}
                onChange={handleChange}
                onMouseMove={handleMouseMove}
            />
            {Object.entries(cursors)
                .filter(([id]) => id !== socketId)
                .map(([id, pos]) => (
                    <div
                        key={id}
                        className="absolute flex flex-col items-center"
                        style={{
                            top: (pos.y ?? 0) + 60,
                            left: (pos.x ?? 0) + 30,
                            pointerEvents: "none",
                            transform: "translate(-50%, -50%)",
                            transition: "top 0.05s linear, left 0.05s linear",
                        }}
                    >
                        <Image
                            src={cursorImg}
                            alt="cursor"
                            width={30}
                            height={30}
                            className="drop-shadow-xl select-none"
                            style={{ filter: `drop-shadow(0 0 6px ${colors[id] || "#4ECDC4"})` }}
                        />
                        <div
                            className="text-white text-xs font-semibold px-2 py-0.5 rounded-md mt-1 shadow-lg opacity-90"
                            style={{ backgroundColor: colors[id] || "#4ECDC4" }}
                        >
                            {pos.name || "Guest"}
                        </div>
                    </div>
                ))}
        </div>
    )
}
