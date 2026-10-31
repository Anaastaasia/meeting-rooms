import { getTodayInMoscow } from './utils/date'
import './App.css'
import { rooms } from './data/rooms'
import { useState } from 'react'
import Schedule from './components/Schedule'
import type { Booking } from './data/bookings'
import type { BookingSelection } from './types/booking'
import { loadBookings, saveBookings } from './utils/bookingStorage'
import BookingForm from './components/BookingForm'
import BookingList from './components/BookingList'
import RoomPage from './pages/RoomPage'
import BookingDialog from './components/BookingDialog'
import { Link, Route, Routes } from 'react-router'
import RoomsPage from './pages/RoomsPage'
import Sidebar from './components/Sidebar'

function App() {

  const [selectedDate, setSelectedDate] = useState(getTodayInMoscow)
  const [bookingSelection, setBookingSelection] =
    useState<BookingSelection | null>(null)
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null)

  const [storageError, setStorageError] = useState('')

  const [storageState] = useState(() => {
    try {
      return {
        bookings: loadBookings(),
        canSave: true,
      }
    } catch {
      return {
        bookings: [] as Booking[],
        canSave: false,
      }
    }
  })

  const [bookings, setBookings] = useState<Booking[]>(storageState.bookings)
  function updateBookings(nextBookings: Booking[]) {
    setBookings(nextBookings)

    if (!storageState.canSave) {
      return
    }

    try {
      saveBookings(nextBookings)
      setStorageError('')
    } catch {
      setStorageError(
        'Изменения видны на странице, но не сохранены в браузере. После перезагрузки они могут потеряться.'
      )
    }
  }

  function handleCloseBooking() {
    setBookingSelection(null)
    setBookingToEdit(null)
  }

  function handleSelectSlot(selection: BookingSelection) {
    setBookingToEdit(null)
    setBookingSelection(selection)
  }

  function handleEditBooking(booking: Booking) {
    setBookingToEdit(booking)

    setBookingSelection({
      roomId: booking.roomId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    })
  }
  function handleSaveBooking(savedBooking: Booking) {
    const nextBookings = bookingToEdit
      ? bookings.map((booking) =>
        booking.id === bookingToEdit.id ? savedBooking : booking
      )
      : [...bookings, savedBooking]

    updateBookings(nextBookings)
    handleCloseBooking()
  }

  function handleCancelBooking(bookingId: string) {
    const nextBookings = bookings.filter(
      (booking) => booking.id !== bookingId
    )

    updateBookings(nextBookings)
    handleCloseBooking()
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app" id="main-content">
        <h1 className="visually-hidden">
          Место — бронирование переговорных
        </h1>
        {!storageState.canSave && (
          <p role="alert">
            Не удалось прочитать сохранённые бронирования. Новые записи
            пока не будут сохраняться в браузере.
          </p>
        )}

        {storageError && <p role="alert">{storageError}</p>}


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
          <BookingDialog onClose={handleCloseBooking} labelledBy="booking-form-heading">
            <BookingForm
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

export default App