"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ── Default center: La Tour de Salvagny ──
const DEFAULT_CENTER: [number, number] = [45.8145, 4.716]
const DEFAULT_ZOOM = 15

// ── Marker icon ──
const markerIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
    </svg>`,
    className: "",
    iconSize: [32, 48],
    iconAnchor: [16, 48],
})

// ── Click handler ──
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

// ── Fly to initial position once map is ready ──
function FlyToCenter({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [map, center])
    return null
}

// ── Types ──
type Props = {
    initialLat?: number | null
    initialLng?: number | null
    onConfirm: (lat: number, lng: number) => void
    onClose: () => void
}

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
    const hasInitial = initialLat != null && initialLng != null
    const center: [number, number] = hasInitial
        ? [initialLat!, initialLng!]
        : DEFAULT_CENTER

    const [pickedLat, setPickedLat] = useState<number | null>(hasInitial ? initialLat! : null)
    const [pickedLng, setPickedLng] = useState<number | null>(hasInitial ? initialLng! : null)

    const handlePick = (lat: number, lng: number) => {
        setPickedLat(lat)
        setPickedLng(lng)
    }

    const handleConfirm = () => {
        if (pickedLat != null && pickedLng != null) {
            onConfirm(pickedLat, pickedLng)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Cliquez sur la carte pour placer le piège
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Map */}
                <div className="w-full" style={{ height: "55vh" }}>
                    <MapContainer
                        center={center}
                        zoom={DEFAULT_ZOOM}
                        className="w-full h-full"
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FlyToCenter center={center} />
                        <ClickHandler onPick={handlePick} />
                        {pickedLat != null && pickedLng != null && (
                            <Marker position={[pickedLat, pickedLng]} icon={markerIcon} />
                        )}
                    </MapContainer>
                </div>

                {/* Coordinates display + buttons */}
                <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-3">
                    {pickedLat != null && pickedLng != null ? (
                        <p className="text-xs text-gray-500 text-center">
                            Lat: <span className="font-mono text-gray-700">{pickedLat.toFixed(6)}</span>
                            {" · "}
                            Lng: <span className="font-mono text-gray-700">{pickedLng.toFixed(6)}</span>
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 text-center">
                            Cliquez sur la carte pour choisir un emplacement.
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={pickedLat == null || pickedLng == null}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}