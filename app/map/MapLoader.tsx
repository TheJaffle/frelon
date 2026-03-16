"use client"

import dynamic from "next/dynamic"

const MapClient = dynamic(() => import("./MapClient"), { ssr: false })

type Trapper = {
    name: string
    address: string | null
    latitude: number
    longitude: number
    trap_type: string | null
}

export default function MapLoader({ trappers }: { trappers: Trapper[] }) {
    return <MapClient trappers={trappers} />
}