
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import './AuthPage.css'

export default function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (isLoading) return

        setError('')
        setIsLoading(true)

        try {
            const { error: authError } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                })

            if (authError) {
                setError('Не удалось войти. Проверь email, пароль и подтверждение почты.')
                return
            }

            navigate('/')
        } catch {
            setError('Не удалось связаться с сервером. Попробуй ещё раз.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <main className="auth-card">
                <Link to="/" className="auth-logo">
                    <span aria-hidden="true">▲</span> Место
                </Link>

                <h1>Вход в аккаунт</h1>
                <p className="auth-description">
                    Войди, чтобы бронировать переговорные.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="login-email">Электронная почта</label>
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isLoading}
                    />

                    <label htmlFor="login-password">Пароль</label>
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={isLoading}
                    />

                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Входим...' : 'Войти'}
                    </button>
                </form>

                <p className="auth-footer">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </main>
        </div>
    )
}
