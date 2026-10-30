import type { Booking } from '../data/bookings'
import { rooms } from '../data/rooms'
import { useEffect, useState } from 'react'

type BookingListProps = {
    bookings: Booking[]
    onEdit: (booking: Booking) => void
    onCancel: (bookingId: string) => void
}

function BookingList({ bookings, onEdit, onCancel }: BookingListProps) {
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
                            <li className="booking-list__item" key={booking.id}>
                                <div>
                                    <h3>{booking.title}</h3>
                                    <p>{room?.name ?? 'Неизвестная переговорная'}</p>
                                    <p>
                                        {booking.date} · {booking.startTime}–
                                        {booking.endTime} · Москва
                                    </p>
                                </div>

                                <div className="booking-list__actions">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(booking)}
                                        aria-label={`Изменить бронирование «${booking.title}»`}
                                    >
                                        Изменить
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onCancel(booking.id)}
                                        aria-label={`Отменить бронирование «${booking.title}»`}
                                    >
                                        Отменить
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default BookingList