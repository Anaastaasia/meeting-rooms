
import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import './AuthPage.css'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (isLoading) return

        setError('')

        if (password !== confirmPassword) {
            setError('Пароли не совпадают.')
            return
        }

        if (password.length < 12) {
            setError('Пароль должен содержать не менее 12 символов.')
            return
        }

        setIsLoading(true)

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            })

            if (authError) {
                setError(authError.message)
                return
            }

            if (data.session) {
                await supabase.auth.signOut()
            }

            setIsRegistered(true)
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

                {isRegistered ? (
                    <>
                        <h1>Проверь почту</h1>
                        <p className="auth-description">
                            Если регистрация доступна для этого адреса,
                            на {email.trim()} придёт письмо с подтверждением.
                            Перейди по ссылке в письме, затем войди в аккаунт.
                        </p>
                        <p className="auth-footer">
                            <Link to="/login">Перейти ко входу</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h1>Регистрация</h1>
                        <p className="auth-description">
                            Создай аккаунт, чтобы бронировать переговорные.
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <label htmlFor="register-email">
                                Электронная почта
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                disabled={isLoading}
                            />

                            <label htmlFor="register-password">
                                Пароль
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={12}
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={isLoading}
                            />

                            <label htmlFor="register-confirm-password">
                                Повтори пароль
                            </label>
                            <input
                                id="register-confirm-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={12}
                                required
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                disabled={isLoading}
                            />

                            {error && (
                                <p className="auth-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Уже есть аккаунт? <Link to="/login">Войти</Link>
                        </p>
                    </>
                )}
            </main>
        </div>
    )
}
