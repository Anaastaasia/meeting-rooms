import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'

const BookingApp = lazy(() => import('./BookingApp'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))


function AppRoutes() {
  return (
    <Suspense fallback={<div>Загрузка страницы...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={<BookingApp />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes