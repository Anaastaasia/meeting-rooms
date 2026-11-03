import { getTodayInMoscow } from './utils/date'
import './App.css'
import { rooms } from './data/rooms'
import { useEffect, useState } from 'react'
import Schedule from './components/Schedule'
import type { Booking } from './data/bookings'
import type { BookingSelection } from './types/booking'
import BookingForm from './components/BookingForm'
import BookingList from './components/BookingList'
import RoomPage from './pages/RoomPage'
import BookingDialog from './components/BookingDialog'
import { Link, Route, Routes } from 'react-router'
import RoomsPage from './pages/RoomsPage'
import Sidebar from './components/Sidebar'
import { useAuth } from './contexts/useAuth'
import { useNavigate } from 'react-router'
import AccountControls from './components/AccountControls'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { createBooking, fetchBookings, updateBooking, deleteBooking } from './lib/bookingApi'

function App() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(getTodayInMoscow)
  const [bookingSelection, setBookingSelection] =
    useState<BookingSelection | null>(null)
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [isSavingBooking, setIsSavingBooking] = useState(false)
  const [bookingSaveError, setBookingSaveError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadServerBookings() {
      try {
        const data = await fetchBookings()

        if (isActive) {
          setBookings(data)
          setBookingsError('')
        }
      } catch {
        if (isActive) {
          setBookingsError(
            'Не удалось загрузить бронирования. Попробуй обновить страницу.'
          )
        }
      } finally {
        if (isActive) {
          setBookingsLoading(false)
        }
      }
    }

    void loadServerBookings()

    return () => {
      isActive = false
    }
  }, [])


  function handleCloseBooking() {
    setBookingSelection(null)
    setBookingToEdit(null)
  }


  function handleSelectSlot(selection: BookingSelection) {
    if (isLoading || isSavingBooking) return

    if (!user) {
      navigate('/login')
      return
    }

    setBookingSaveError('')
    setBookingToEdit(null)
    setBookingSelection(selection)
  }


  function handleEditBooking(booking: Booking) {
    if (isLoading || isSavingBooking) return

    if (!user) {
      navigate('/login')
      return
    }

    if (booking.userId !== user.id) {
      window.alert('Редактировать можно только свои бронирования.')
      return
    }

    setBookingSaveError('')
    setBookingToEdit(booking)

    setBookingSelection({
      roomId: booking.roomId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    })
  }




  async function handleSaveBooking(savedBooking: Booking): Promise<void> {
    if (!user || isSavingBooking) return

    console.time('Полное время сохранения')

    if (bookingToEdit && bookingToEdit.userId !== user.id) {
      setBookingSaveError('Редактировать можно только свои бронирования.')
      return
    }

    setIsSavingBooking(true)
    setBookingSaveError('')


    try {
      console.time('Сохранение в Supabase')

      if (bookingToEdit) {
        await updateBooking(savedBooking, user.id)
      } else {
        await createBooking(savedBooking, user.id)
      }

      console.timeEnd('Сохранение в Supabase')

      console.time('Повторная загрузка бронирований')

      const updatedBookings = await fetchBookings()

      console.timeEnd('Повторная загрузка бронирований')

      setBookings(updatedBookings)
      handleCloseBooking()
    }
    finally {
      console.timeEnd('Полное время сохранения')
      setIsSavingBooking(false)
    }
  }




  async function handleCancelBooking(bookingId: string): Promise<void> {
    if (!user || isSavingBooking) return

    const booking = bookings.find((item) => item.id === bookingId)

    if (!booking || booking.userId !== user.id) {
      setBookingSaveError('Отменять можно только свои бронирования.')
      return
    }

    setIsSavingBooking(true)
    setBookingSaveError('')

    try {
      await deleteBooking(bookingId, user.id)

      setBookings((current) =>
        current.filter((item) => item.id !== bookingId)
      )

      handleCloseBooking()
    } catch (error) {
      console.error('Ошибка отмены бронирования:', error)

      setBookingSaveError(
        'Не удалось отменить бронирование. Попробуй ещё раз.'
      )
    } finally {
      setIsSavingBooking(false)
    }
  }



  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app" id="main-content">
        <div className="app__topbar">
          <AccountControls />
        </div>
        <h1 className="visually-hidden">
          Место — бронирование переговорных
        </h1>

        {bookingsLoading && (
          <p role="status">Загружаем бронирования...</p>
        )}

        {bookingsError && (
          <p role="alert">{bookingsError}</p>
        )}



        <Routes>
          <Route
            path="/"
            element={
              <Schedule
                rooms={rooms}
                bookings={bookings}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectSlot={handleSelectSlot}
                onEditBooking={handleEditBooking}
              />
            }
          />

          <Route path="/rooms" element={<RoomsPage />} />

          <Route
            path="/rooms/:roomId"
            element={
              <RoomPage
                bookings={bookings}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectSlot={handleSelectSlot}
                onEditBooking={handleEditBooking}
              />
            }
          />

          <Route
            path="/bookings"
            element={
              <BookingList
                bookings={bookings}
                onEdit={handleEditBooking}
              />
            }
          />

          <Route
            path="*"
            element={
              <section aria-labelledby="not-found-heading">
                <h2 id="not-found-heading">Страница не найдена</h2>
                <p>Проверь адрес или вернись к расписанию.</p>
                <Link to="/">Открыть расписание</Link>
              </section>
            }
          />
        </Routes>
        {bookingSelection && (
          <BookingDialog onClose={handleCloseBooking}
            labelledBy="booking-form-heading">
            <BookingForm
              isSaving={isSavingBooking}
              saveError={bookingSaveError}
              key={`${bookingToEdit?.id ?? 'new'}-${bookingSelection.roomId}-${bookingSelection.date}-${bookingSelection.startTime}-${bookingSelection.endTime}`}
              selection={bookingSelection}
              bookingToEdit={bookingToEdit ?? undefined}
              roomName={
                rooms.find((room) => room.id === bookingSelection.roomId)?.name ??
                'Неизвестная переговорная'
              }
              bookings={bookings}
              onSave={handleSaveBooking}
              onCancelBooking={handleCancelBooking}
              onClose={handleCloseBooking}
            />
          </BookingDialog>
        )}
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  )
}

export default AppRoutes