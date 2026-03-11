"use client"

import { useEffect, useState, useActionState, useRef, useCallback } from "react"
import Image from "next/image"
import { getUsers, login } from "./actions"

type User = { id: string; name: string }

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([])
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [nameError, setNameError] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [state, formAction, isPending] = useActionState(
      async (_prev: { error: string } | null, formData: FormData) => {
        const result = await login(formData)
        return result ?? null
      },
      null
  )

  useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  const resolveUser = useCallback(
      (value: string) => {
        const normalized = value.trim().toUpperCase()
        const match = users.find((u) => u.name.toUpperCase() === normalized)
        if (match) {
          setSelectedUserId(match.id)
          setNameError("")
        } else {
          setSelectedUserId("")
        }
      },
      [users]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setActiveIndex(-1)
    setNameError("")
    if (value.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedUserId("")
      return
    }
    const filtered = users.filter((u) =>
        u.name.toUpperCase().startsWith(value.trim().toUpperCase())
    )
    setSuggestions(filtered)
    setShowSuggestions(true)
    resolveUser(value)
  }

  const selectSuggestion = (user: User) => {
    setInputValue(user.name)
    setSelectedUserId(user.id)
    setNameError("")
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault()
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false)
      if (inputValue.trim().length > 0 && !selectedUserId) {
        setNameError("Ce nom n'existe pas dans la liste des participants.")
      }
    }, 150)
  }

  const handleSubmit = (formData: FormData) => {
    if (!selectedUserId) {
      setNameError(
          inputValue.trim().length === 0
              ? "Veuillez saisir votre nom."
              : "Ce nom n'existe pas dans la liste des participants."
      )
      return
    }
    formAction(formData)
  }

  const nameIsValid = selectedUserId !== ""

  return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-amber-600 shadow-md relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
            <span className="text-white font-semibold text-lg tracking-wide">
            Frelon Asiatique
          </span>
          </div>
        </header>

        <main className="flex-1 relative flex items-center justify-center px-6 py-16">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image src="/frelon-flight.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-amber-950/70 backdrop-blur-sm" />
          </div>

          <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-amber-200">
                <Image src="/frelon-face.jpg" alt="Frelon asiatique" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <h1 className="text-2xl font-bold text-amber-800 text-center">
                Connexion
              </h1>
              <p className="text-gray-500 text-sm text-center">
                Saisissez votre nom et votre mot de passe.
              </p>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="userId" value={selectedUserId} />

              <div className="flex flex-col gap-1 relative">
                <label htmlFor="userName" className="text-sm font-medium text-gray-700">
                  Participant
                </label>
                <input
                    ref={inputRef}
                    id="userName"
                    type="text"
                    autoComplete="off"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                    placeholder="Tapez votre nom…"
                    className={`border rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 transition ${
                        nameError
                            ? "border-red-400 focus:ring-red-300"
                            : nameIsValid
                                ? "border-green-400 focus:ring-green-300"
                                : "border-gray-300 focus:ring-amber-400"
                    }`}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul ref={listRef} className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {suggestions.map((u, i) => (
                          <li
                              key={u.id}
                              onMouseDown={() => selectSuggestion(u)}
                              className={`px-4 py-2.5 cursor-pointer text-gray-800 text-sm transition-colors ${
                                  i === activeIndex ? "bg-amber-100 text-amber-900 font-medium" : "hover:bg-amber-50"
                              }`}
                          >
                            {u.name}
                          </li>
                      ))}
                    </ul>
                )}
                {showSuggestions && suggestions.length === 0 && inputValue.trim().length > 0 && (
                    <p className="text-gray-400 text-xs mt-1 px-1">Aucun participant trouvé.</p>
                )}
                {nameError && <p className="text-red-600 text-sm mt-1">{nameError}</p>}
              </div>

              {nameIsValid && (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe (4 derniers chiffres de votre numéro de portable)
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Saisissez votre mot de passe"
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                    {state?.error && <p className="text-red-600 text-sm mt-1">{state.error}</p>}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={isPending}
                  className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 text-white font-semibold text-base py-3 rounded-full shadow-md transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
              >
                {isPending ? "Connexion en cours…" : "Se connecter"}
              </button>
            </form>
          </div>
        </main>

        <footer className="bg-amber-600 py-4 relative z-10">
          <p className="text-center text-amber-100 text-sm">
            © {new Date().getFullYear()} — Campagne de piégeage du frelon asiatique
          </p>
        </footer>
      </div>
  )
}