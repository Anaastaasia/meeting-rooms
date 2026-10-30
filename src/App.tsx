import { getTodayInMoscow } from './utils/date'
import './App.css'
import { rooms } from './data/rooms'
import RoomCard from './components/RoomCard'
import { useEffect, useState } from 'react'
import type { Room } from './data/rooms'
import Schedule from './components/Schedule'
import type { Booking } from './data/bookings'
import type { BookingSelection } from './types/booking'
import { loadBookings, saveBookings } from './utils/bookingStorage'
import BookingForm from './components/BookingForm'
import BookingList from './components/BookingList'

function App() {
  const [minCapacity, setMinCapacity] = useState(0)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayInMoscow)
  const [bookingSelection, setBookingSelection] =
    useState<BookingSelection | null>(null)
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

  useEffect(() => {
    if (!storageState.canSave) {
      return
    }

    try {
      saveBookings(bookings)
    } catch {
      setStorageError('Не удалось сохранить бронирования в браузере.')
    }
  }, [bookings, storageState.canSave])

  const selectedRoom = rooms.find(
    (room) => room.id === selectedRoomId
  )

  const filteredRooms = rooms.filter(
    (room) => room.capacity >= minCapacity
  )
  function handleSelectRoom(room: Room) {
    setSelectedRoomId(room.id)
  }
  function handleCancelBooking(bookingId: string) {
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== bookingId)
    )
  }
  return (
    <main className="app">
      {!storageState.canSave && (
        <p role="alert">
          Не удалось прочитать сохранённые бронирования. Новые записи
          пока не будут сохраняться в браузере.
        </p>
      )}

      {storageError && <p role="alert">{storageError}</p>}
      <header className="page-header">
        <p className="page-header__label">Офис · Москва</p>
        <h1>Бронирование переговорных</h1>
        <p>Выбери комнату и удобное время.</p>
      </header>

      <Schedule
        rooms={filteredRooms}
        bookings={bookings}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSelectSlot={setBookingSelection}
      />

      {bookingSelection && (
        <BookingForm
          key={`${bookingSelection.roomId}-${bookingSelection.date}-${bookingSelection.startTime}-${bookingSelection.endTime}`}
          selection={bookingSelection}
          roomName={
            rooms.find((room) => room.id === bookingSelection.roomId)?.name ??
            'Неизвестная переговорная'
          }
          bookings={bookings}
          onSave={(newBooking) => {
            setBookings((currentBookings) => [
              ...currentBookings,
              newBooking,
            ])
            setBookingSelection(null)
          }}
          onClose={() => setBookingSelection(null)}
        />
      )}

      <BookingList
        bookings={bookings}
        onCancel={handleCancelBooking}
      />

      <section aria-labelledby="rooms-heading">
        <h2 id="rooms-heading">Переговорные</h2>
        <div className="rooms-filter">
          <label htmlFor="min-capacity">Количество участников</label>

          <select
            id="min-capacity"
            value={minCapacity}
            onChange={(event) =>
              setMinCapacity(Number(event.target.value))
            }
          >
            <option value={0}>Любое</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={handleSelectRoom}
            />
          ))}
        </div>
        {filteredRooms.length === 0 && (
          <p role="status">
            Нет переговорных с такой вместимостью. Попробуй уменьшить
            количество участников.
          </p>
        )}
      </section>
      {selectedRoom && (
        <section
          className="room-details"
          aria-labelledby="selected-room-heading"
        >
          <h2 id="selected-room-heading">
            Расписание: {selectedRoom.name}
          </h2>

          <p>Вместимость: {selectedRoom.capacity} чел.</p>
          <p>Время работы: 08:00–20:00, Москва.</p>
          <p>Следующим шагом здесь добавим выбор даты и расписание.</p>

          <button
            className="room-details__close"
            type="button"
            onClick={() => setSelectedRoomId(null)}
          >
            Закрыть расписание
          </button>
        </section>
      )}
    </main>
  )
}

export default App