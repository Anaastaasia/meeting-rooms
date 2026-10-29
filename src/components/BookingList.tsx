import type { Booking } from '../data/bookings'
import { rooms } from '../data/rooms'

type BookingListProps = {
    bookings: Booking[]
    onCancel: (bookingId: string) => void
}

function BookingList({ bookings, onCancel }: BookingListProps) {
    const now = Date.now()

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

                                <button
                                    type="button"
                                    onClick={() => onCancel(booking.id)}
                                    aria-label={`Отменить бронирование «${booking.title}»`}
                                >
                                    Отменить
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