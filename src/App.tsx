import { getTodayInMoscow } from './utils/date'
import './App.css'
import { rooms } from './data/rooms'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { supabase } from './lib/supabase'

function App() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = Boolean(user)
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('selectedDate') || getTodayInMoscow()
  })
  const [bookingSelection, setBookingSelection] =
    useState<BookingSelection | null>(null)
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const bookingsRequestId = useRef(0)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsRetrying, setBookingsRetrying] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const isScheduleUnavailable = bookingsLoading || Boolean(bookingsError)
  const [isSavingBooking, setIsSavingBooking] = useState(false)
  const [bookingSaveError, setBookingSaveError] = useState('')

  useEffect(() => {
    sessionStorage.setItem('selectedDate', selectedDate)
  }, [selectedDate])

  const refreshBookings = useCallback(async (): Promise<void> => {
    const requestId = ++bookingsRequestId.current

    try {
      const updatedBookings = await fetchBookings(isAuthenticated)

      if (requestId === bookingsRequestId.current) {
        setBookings(updatedBookings)
        setBookingsError('')
      }
    } catch (error) {
      if (requestId === bookingsRequestId.current) {
        console.error('Ошибка обновления бронирований:', error)

        setBookingsError(
          'Не удалось загрузить бронирования. Попробуй повторить загрузку.'
        )
      }
    }
  }, [isAuthenticated])

  async function retryBookings(): Promise<void> {
    if (bookingsRetrying) return

    setBookingsRetrying(true)

    try {
      await refreshBookings()
    } finally {
      setBookingsRetrying(false)
    }
  }


  useEffect(() => {
    if (isLoading) return

    let isActive = true

    async function loadServerBookings() {
      setBookingsLoading(true)
      setBookingsError('')
      const requestId = ++bookingsRequestId.current

      try {
        const data = await fetchBookings(isAuthenticated)

        if (isActive && requestId === bookingsRequestId.current) {
          setBookings(data)
          setBookingsError('')
        }
      } catch (error) {
        if (isActive && requestId === bookingsRequestId.current) {
          console.error('Ошибка загрузки бронирований:', error)

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
      bookingsRequestId.current += 1
    }
  }, [isLoading, isAuthenticated, user?.id])



  useEffect(() => {
    if (isLoading) return
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        async () => {
          try {
            await refreshBookings()
          } catch (error) {
            console.error(
              'Ошибка обновления бронирований через Realtime:',
              error
            )
          }
        }
      )


      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void refreshBookings().catch((error) => {
            console.error(
              'Ошибка синхронизации после подключения Realtime:',
              error
            )
          })
        }
      })



    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refreshBookings, isLoading])



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


    if (bookingToEdit && bookingToEdit.userId !== user.id) {
      setBookingSaveError('Редактировать можно только свои бронирования.')
      return
    }

    setIsSavingBooking(true)
    setBookingSaveError('')



    try {
      if (bookingToEdit) {
        await updateBooking(savedBooking, user.id)
        bookingsRequestId.current += 1

        setBookings((current) =>
          current.map((booking) =>
            booking.id === savedBooking.id
              ? { ...savedBooking, userId: user.id }
              : booking
          )
        )
      } else {
        await createBooking(savedBooking, user.id)

        bookingsRequestId.current += 1

        setBookings((current) => [
          ...current,
          { ...savedBooking, userId: user.id },
        ])
      }


      handleCloseBooking()
    } catch (error) {
      console.error('Ошибка сохранения бронирования:', error)

      setBookingSaveError(
        'Не удалось сохранить бронирование. Возможно, выбранное время уже занято или сервер недоступен.'
      )
    } finally {
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

      bookingsRequestId.current += 1

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


        {bookingsError && (
          <div className="bookings-error" role="alert">
            <span>{bookingsError}</span>

            <button
              type="button"
              disabled={bookingsRetrying}
              onClick={() => void retryBookings()}
            >
              {bookingsRetrying ? 'Загружаем…' : 'Повторить загрузку'}
            </button>
          </div>
        )}



        <Routes>
          <Route
            path="/"
            element={
              <Schedule
                rooms={rooms}
                bookings={bookings}
                currentUserId={user?.id ?? null}
                selectedDate={selectedDate}
                isLoading={bookingsLoading}
                isUnavailable={isScheduleUnavailable}
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
                isLoading={bookingsLoading}
                isUnavailable={isScheduleUnavailable}
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
                bookings={bookings.filter(
                  (booking) => booking.userId === user?.id
                )}
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