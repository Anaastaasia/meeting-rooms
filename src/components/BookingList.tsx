import type { Booking } from '../data/bookings'
import { rooms } from '../data/rooms'
import { useEffect, useState } from 'react'

type BookingListProps = {
    bookings: Booking[]
    onEdit: (booking: Booking) => void
}

function BookingList({ bookings, onEdit }: BookingListProps) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        function updateNow() {
            setNow(Date.now())
        }

        const intervalId = window.setInterval(updateNow, 15_000)

        window.addEventListener('focus', updateNow)

        return () => {
            window.clearInterval(intervalId)
            window.removeEventListener('focus', updateNow)
        }
    }, [])

    const upcomingBookings = bookings
        .filter((booking) => {
            const startDateTime = new Date(
                `${booking.date}T${booking.startTime}:00+03:00`
            )

            return startDateTime.getTime() > now
        })
        .sort((first, second) => {
            const firstStart = `${first.date}T${first.startTime}`
            const secondStart = `${second.date}T${second.startTime}`

            return firstStart.localeCompare(secondStart)
        })

    return (
        <section
            className="booking-list"
            aria-labelledby="bookings-heading"
        >
            <h2 id="bookings-heading">Предстоящие бронирования</h2>

            {upcomingBookings.length === 0 ? (
                <p>Предстоящих бронирований пока нет.</p>
            ) : (
                <ul className="booking-list__items">
                    {upcomingBookings.map((booking) => {
                        const room = rooms.find(
                            (room) => room.id === booking.roomId
                        )

                        return (
                            <li
                                className="booking-list__item"
                                key={booking.id}
                                data-room={booking.roomId}
                            >
                                <button
                                    className="booking-list__open"
                                    type="button"
                                    onClick={() => onEdit(booking)}
                                    aria-label={`Открыть бронирование «${booking.title}», ${booking.date}, ${booking.startTime}–${booking.endTime}`}
                                >
                                    <span className="booking-list__info">
                                        <strong className="booking-list__title">
                                            {booking.title}
                                        </strong>

                                        <span className="booking-list__room">
                                            <span className="room-dot" aria-hidden="true" />
                                            {room?.name ?? 'Неизвестная переговорная'}
                                        </span>

                                        <span className="booking-list__time">
                                            {booking.date} · {booking.startTime}–
                                            {booking.endTime} · Москва
                                        </span>
                                    </span>

                                    <span className="booking-list__open-label" aria-hidden="true">
                                        Открыть →
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default BookingList