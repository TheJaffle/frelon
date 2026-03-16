
"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ───────────────────────────────────────────
// Types
// ───────────────────────────────────────────
type Trapper = {
    name: string
    address: string | null
    latitude: number
    longitude: number
    trap_type: string | null
}

type Props = {
    trappers: Trapper[]
}

// ───────────────────────────────────────────
// Color mapping by trap type
// ───────────────────────────────────────────
const TRAP_COLORS: Record<string, string> = {
    "BeeVital": "#EAB308",
    "Grilel Neoppi": "#3B82F6",
    "Ornetin": "#8B5CF6",
    "Osaka": "#EF4444",
    "Vespa Catch Select": "#22C55E",
    "Vespa Catch": "#F97316",
    "Good4Bees": "#EC4899",
    "Bouteille": "#6B7280",
}

const DEFAULT_COLOR = "#1F2937"

function getColor(trapType: string | null): string {
    if (!trapType) return DEFAULT_COLOR
    return TRAP_COLORS[trapType] ?? DEFAULT_COLOR
}

// ───────────────────────────────────────────
// Marker size based on zoom level
// ───────────────────────────────────────────
function getMarkerSize(zoom: number): { width: number; height: number } {
    if (zoom >= 15) return { width: 32, height: 48 }
    if (zoom >= 14) return { width: 28, height: 42 }
    if (zoom >= 13) return { width: 22, height: 33 }
    if (zoom >= 12) return { width: 18, height: 27 }
    return { width: 14, height: 21 }
}

// ───────────────────────────────────────────
// SVG marker icon generator (zoom-aware)
// ───────────────────────────────────────────
function createColoredIcon(color: string, zoom: number): L.DivIcon {
    const { width, height } = getMarkerSize(zoom)

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${width}" height="${height}">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
    </svg>`

    return L.divIcon({
        html: svg,
        className: "",
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height + 6],
    })
}

// ───────────────────────────────────────────
// Auto-fit bounds component
// ───────────────────────────────────────────
function FitBounds({ trappers }: { trappers: Trapper[] }) {
    const map = useMap()

    useEffect(() => {
        if (trappers.length === 0) return

        const bounds = L.latLngBounds(
            trappers.map((t) => [t.latitude, t.longitude] as [number, number])
        )

        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }, [map, trappers])

    return null
}

// ───────────────────────────────────────────
// Zoom tracker — returns current zoom level
// ───────────────────────────────────────────
function useZoomLevel(initialZoom: number): number {
    const [zoom, setZoom] = useState(initialZoom)

    useMapEvents({
        zoomend(e) {
            setZoom(e.target.getZoom())
        },
    })

    return zoom
}

function ZoomAwareMarkers({ trappers }: { trappers: Trapper[] }) {
    const zoom = useZoomLevel(14)

    // Cluster radius adapts to zoom: tighter clusters when zoomed in
    const clusterRadius = zoom >= 15 ? 30 : zoom >= 13 ? 40 : 50

    // Custom cluster icon that stays visible at any zoom
    const createClusterIcon = useCallback((cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount()
        const size = zoom >= 14 ? 40 : zoom >= 12 ? 34 : 28
        const fontSize = zoom >= 14 ? 14 : zoom >= 12 ? 12 : 10

        return L.divIcon({
            html: `<div style="
                width: ${size}px;
                height: ${size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(217, 119, 6, 0.85);
                border: 2px solid #fff;
                border-radius: 50%;
                color: #fff;
                font-weight: 700;
                font-size: ${fontSize}px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${count}</div>`,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        })
    }, [zoom])

    return (
        <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={clusterRadius}
            iconCreateFunction={createClusterIcon}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            disableClusteringAtZoom={17}
        >
            {trappers.map((t, i) => (
                <Marker
                    key={`${t.name}-${i}`}
                    position={[t.latitude, t.longitude]}
                    icon={createColoredIcon(getColor(t.trap_type), zoom)}
                >
                    <Popup>
                        <div className="text-sm leading-relaxed">
                            <p className="font-bold text-gray-800">{t.name}</p>
                            {t.address && (
                                <p className="text-gray-500 text-xs mt-0.5">{t.address}</p>
                            )}
                            {t.trap_type && (
                                <p className="mt-1">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle"
                                        style={{ backgroundColor: getColor(t.trap_type) }}
                                    />
                                    <span className="text-gray-700">{t.trap_type}</span>
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MarkerClusterGroup>
    )
}

// ───────────────────────────────────────────
// Map component
// ───────────────────────────────────────────
export default function MapClient({ trappers }: Props) {
    return (
        <MapContainer
            center={[45.8145, 4.716]}
            zoom={14}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
            minZoom={10}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds trappers={trappers} />
            <ZoomAwareMarkers trappers={trappers} />
        </MapContainer>
    )
}