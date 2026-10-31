
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../contexts/useAuth'
import { supabase } from '../lib/supabase'

function AccountControls() {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()

    const [isSigningOut, setIsSigningOut] = useState(false)
    const [error, setError] = useState('')

    async function handleSignOut() {
        if (isSigningOut) return

        setError('')
        setIsSigningOut(true)

        try {
            const { error: signOutError } = await supabase.auth.signOut()

            if (signOutError) {
                setError('Не удалось выйти из аккаунта.')
                return
            }

            navigate('/')
        } catch {
            setError('Не удалось связаться с сервером.')
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <div className="account-controls">
            {isLoading ? (
                <span className="account-controls__status">
                    Проверяем вход...
                </span>
            ) : user ? (
                <>
                    <span
                        className="account-controls__email"
                        title={user.email}
                    >
                        {user.email}
                    </span>
                    <button
                        type="button"
                        className="account-controls__button"
                        onClick={() => void handleSignOut()}
                        disabled={isSigningOut}
                    >
                        {isSigningOut ? 'Выходим...' : 'Выйти'}
                    </button>
                </>
            ) : (
                <Link to="/login" className="account-controls__button">
                    Войти
                </Link>
            )}

            {error && (
                <p className="account-controls__error" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}

export default AccountControls
