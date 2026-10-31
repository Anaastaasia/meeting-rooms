
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'

type AuthProviderProps = {
    children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, nextSession) => {
                setSession(nextSession)
                setIsLoading(false)
            })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user: session?.user ?? null,
                session,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
