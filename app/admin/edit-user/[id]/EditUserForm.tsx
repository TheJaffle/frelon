
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { updateUser } from "../../actions"

const MapPickerModal = dynamic(() => import("../../MapPickerModal"), { ssr: false })

/**
 * Geocode an address using the French government API.
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const query = encodeURIComponent(`${address}, La Tour de Salvagny, France`)
    try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}&limit=1`)
        if (!res.ok) return null
        const data = await res.json()
        const feature = data?.features?.[0]
        if (!feature) return null
        const [lng, lat] = feature.geometry.coordinates
        return { lat, lng }
    } catch {
        return null
    }
}

type User = {
    id: string
    name: string
    address: string | null
    telephone: string | null
    email: string | null
    password_hash: string | null
    trap_type: string | null
    appat: string | null
    admin: boolean
    latitude: number | null
    longitude: number | null
}

type Props = {
    user: User
}

export default function EditUserForm({ user }: Props) {
    const router = useRouter()

    const [name, setName] = useState(user.name ?? "")
    const [address, setAddress] = useState(user.address ?? "")
    const [latitude, setLatitude] = useState(user.latitude != null ? String(user.latitude) : "")
    const [longitude, setLongitude] = useState(user.longitude != null ? String(user.longitude) : "")
    const [telephone, setTelephone] = useState(user.telephone ?? "")
    const [email, setEmail] = useState(user.email ?? "")
    const [passwordHash, setPasswordHash] = useState(user.password_hash ?? "")
    const [trapType, setTrapType] = useState(user.trap_type ?? "Vespa Catch Select")
    const [appat, setAppat] = useState(user.appat ?? "Classique 1/3-1/3-1/3")
    const [isAdminUser, setIsAdminUser] = useState(user.admin)
    const [isSaving, setIsSaving] = useState(false)
    const [isGeocoding, setIsGeocoding] = useState(false)
    const [showMapPicker, setShowMapPicker] = useState(false)
    const [geoMessage, setGeoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emailTouched = email.length > 0
    const emailValid = emailRegex.test(email.trim())

    const isValid =
        name.trim() &&
        address.trim() &&
        telephone.trim() &&
        email.trim() &&
        emailValid &&
        passwordHash.trim()

    const handleGeocode = async () => {
        if (!address.trim()) {
            setGeoMessage({ type: "error", text: "Saisissez une adresse d'abord." })
            return
        }
        setIsGeocoding(true)
        setGeoMessage(null)

        const result = await geocodeAddress(address)
        setIsGeocoding(false)

        if (result) {
            setLatitude(String(result.lat))
            setLongitude(String(result.lng))
            setGeoMessage({ type: "success", text: "Coordonnées trouvées !" })
        } else {
            setGeoMessage({ type: "error", text: "Aucun résultat trouvé pour cette adresse." })
        }
    }

    const handleMapConfirm = (lat: number, lng: number) => {
        setLatitude(String(lat))
        setLongitude(String(lng))
        setShowMapPicker(false)
        setGeoMessage({ type: "success", text: "Position choisie sur la carte !" })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        if (!name.trim() || !address.trim() || !telephone.trim() || !email.trim() || !passwordHash.trim()) {
            setError("Tous les champs sont obligatoires.")
            return
        }

        if (!emailValid) {
            setError("Le format de l'email est invalide.")
            return
        }

        setIsSaving(true)

        let finalLat = latitude
        let finalLng = longitude
        if (!finalLat || !finalLng) {
            const geo = await geocodeAddress(address)
            if (geo) {
                finalLat = String(geo.lat)
                finalLng = String(geo.lng)
                setLatitude(finalLat)
                setLongitude(finalLng)
            }
        }

        const formData = new FormData()
        formData.set("name", name)
        formData.set("address", address)
        formData.set("telephone", telephone)
        formData.set("email", email)
        formData.set("password_hash", passwordHash)
        formData.set("trap_type", trapType)
        formData.set("appat", appat)
        formData.set("admin", isAdminUser ? "true" : "false")
        formData.set("latitude", finalLat)
        formData.set("longitude", finalLng)

        const result = await updateUser(user.id, formData)
        setIsSaving(false)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => router.push("/admin"), 1200)
        } else {
            setError(result.error ?? "Erreur inconnue.")
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Nom
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError("") }}
                        placeholder="Nom du piégeur"
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Adresse
                    </label>
                    <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setError(""); setGeoMessage(null) }}
                        placeholder="Adresse du piégeur"
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>

                {/* Two buttons side by side */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={isGeocoding || !address.trim()}
                        className="bg-blue-50 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-50 text-blue-700 text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        {isGeocoding ? "Recherche…" : "📍 Trouver coordonnées automatiquement"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                        🗺️ Choisir manuellement sur la carte
                    </button>
                </div>

                {geoMessage && (
                    <p className={`text-xs px-1 ${geoMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                        {geoMessage.text}
                    </p>
                )}

                {/* Latitude / Longitude */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                            Latitude
                        </label>
                        <input
                            id="latitude"
                            type="text"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="45.8145"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                            Longitude
                        </label>
                        <input
                            id="longitude"
                            type="text"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="4.716"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
                    </div>
                </div>

                {/* Telephone */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="telephone" className="text-sm font-medium text-gray-700">
                        Téléphone
                    </label>
                    <input
                        id="telephone"
                        type="tel"
                        value={telephone}
                        onChange={(e) => { setTelephone(e.target.value); setError("") }}
                        placeholder="06 12 34 56 78"
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError("") }}
                        placeholder="exemple@mail.com"
                        className={`border rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 transition ${
                            emailTouched && !emailValid
                                ? "border-red-400 focus:ring-red-300"
                                : emailTouched && emailValid
                                    ? "border-green-400 focus:ring-green-300"
                                    : "border-gray-300 focus:ring-amber-400"
                        }`}
                    />
                    {emailTouched && !emailValid && (
                        <p className="text-red-600 text-xs mt-0.5">
                            Format d&apos;email invalide.
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="password_hash" className="text-sm font-medium text-gray-700">
                        Mot de passe
                    </label>
                    <input
                        id="password_hash"
                        type="text"
                        value={passwordHash}
                        onChange={(e) => { setPasswordHash(e.target.value); setError("") }}
                        placeholder="4 derniers chiffres du portable"
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                        Utilisé pour la connexion du piégeur.
                    </p>
                </div>

                {/* Trap type — SELECT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="trap_type" className="text-sm font-medium text-gray-700">Type de piège</label>
                    <select id="trap_type" value={trapType} onChange={(e) => { setTrapType(e.target.value); setError("") }}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition">
                        <option value="">— Sélectionnez —</option>
                        {["BeeVital","Grilel Neoppi","Ornetin","Osaka","Vespa Catch Select","Vespa Catch","Good4Bees","Bouteille (à proscrire)"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Appat — SELECT */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="appat" className="text-sm font-medium text-gray-700">Type d&apos;appât</label>
                    <select id="appat" value={appat} onChange={(e) => { setAppat(e.target.value); setError("") }}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition">
                        <option value="">— Sélectionnez —</option>
                        {["Classique 1/3-1/3-1/3","Eau sucrée","Autre"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>



                {/* Admin switch */}
                <div className="flex items-center gap-3 py-1">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isAdminUser}
                        onClick={() => { setIsAdminUser(!isAdminUser); setError("") }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                            isAdminUser ? "bg-amber-600" : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isAdminUser ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </button>
                    <label className="text-sm font-medium text-gray-700">
                        Administrateur
                    </label>
                </div>

                {error && (
                    <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-center">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-center">
                        Modifications enregistrées ! Redirection…
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSaving || !isValid}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 text-white font-semibold text-base py-3 rounded-xl shadow-sm transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 mt-2"
                >
                    {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
            </form>

            {/* Map picker modal */}
            {showMapPicker && (
                <MapPickerModal
                    initialLat={latitude ? parseFloat(latitude) : user.latitude}
                    initialLng={longitude ? parseFloat(longitude) : user.longitude}
                    onConfirm={handleMapConfirm}
                    onClose={() => setShowMapPicker(false)}
                />
            )}
        </>
    )
}