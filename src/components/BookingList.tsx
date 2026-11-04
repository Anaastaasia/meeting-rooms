import type { Booking } from '../data/bookings'
import { rooms } from '../data/rooms'
import { useEffect, useState } from 'react'

type BookingListProps = {
    bookings: Booking[]
    onEdit: (booking: Booking) => void
}
type BookingCardContentProps = {
    booking: Booking
    roomName: string
}

function formatBookingDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number)

    const currentYear = Number(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
        }).format(new Date())
    )

    const bookingDate = new Date(Date.UTC(year, month - 1, day))

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        ...(year !== currentYear ? { year: 'numeric' as const } : {}),
        timeZone: 'UTC',
    }).format(bookingDate)
}

function BookingCardContent({
    booking,
    roomName,
}: BookingCardContentProps) {
    return (
        <span className="booking-list__info">
            <strong className="booking-list__title">
                {booking.title}
            </strong>

            <span className="booking-list__room">
                <span className="room-dot" aria-hidden="true" />
                {roomName}
            </span>

            <span className="booking-list__time">
                {formatBookingDate(booking.date)} · {booking.startTime}–
                {booking.endTime} · Москва
            </span>
        </span>
    )
}

function BookingList({ bookings, onEdit }: BookingListProps) {
    const [now, setNow] = useState(() => Date.now())
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')

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
            const endDateTime = new Date(
                `${booking.date}T${booking.endTime}:00+03:00`
            )

            return endDateTime.getTime() > now
        })
        .sort((first, second) => {
            const firstStart = `${first.date}T${first.startTime}`
            const secondStart = `${second.date}T${second.startTime}`

            return firstStart.localeCompare(secondStart)
        })

    const pastBookings = bookings
        .filter((booking) => {
            const endDateTime = new Date(
                `${booking.date}T${booking.endTime}:00+03:00`
            )

            return endDateTime.getTime() <= now
        })
        .sort((first, second) => {
            const firstStart = `${first.date}T${first.startTime}`
            const secondStart = `${second.date}T${second.startTime}`

            return secondStart.localeCompare(firstStart)
        })


    const displayedBookings =
        activeTab === 'upcoming' ? upcomingBookings : pastBookings

    return (
        <section
            className="booking-list"
            aria-labelledby="bookings-heading"
        >
            <h2 id="bookings-heading">Мои бронирования</h2>

            <div className="booking-list__tabs" role="group" aria-label="Тип бронирований">
                <button
                    type="button"
                    className={activeTab === 'upcoming' ? 'active' : ''}
                    aria-pressed={activeTab === 'upcoming'}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Предстоящие
                </button>

                <button
                    type="button"
                    className={activeTab === 'history' ? 'active' : ''}
                    aria-pressed={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                >
                    История
                </button>
            </div>

            {displayedBookings.length === 0 ? (
                <p>
                    {activeTab === 'upcoming'
                        ? 'Предстоящих бронирований пока нет.'
                        : 'История бронирований пока пуста.'}
                </p>
            ) : (
                <ul className="booking-list__items">
                    {displayedBookings.map((booking) => {
                        const room = rooms.find(
                            (room) => room.id === booking.roomId
                        )

                        const startTime = new Date(
                            `${booking.date}T${booking.startTime}:00+03:00`
                        ).getTime()

                        const isOngoing =
                            activeTab === 'upcoming' && startTime <= now

                        return (
                            <li
                                className="booking-list__item"
                                key={booking.id}
                                data-room={booking.roomId}
                            >
                                {activeTab === 'history' ? (
                                    <div className="booking-list__open">
                                        <BookingCardContent
                                            booking={booking}
                                            roomName={room?.name ?? 'Неизвестная переговорная'}
                                        />

                                        <span className="booking-list__status booking-list__status--completed">
                                            Завершено
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        className="booking-list__open"
                                        type="button"
                                        onClick={() => onEdit(booking)}
                                        aria-label={`Открыть бронирование «${booking.title}», ${booking.date}, ${booking.startTime}–${booking.endTime}`}
                                    >
                                        <BookingCardContent
                                            booking={booking}
                                            roomName={room?.name ?? 'Неизвестная переговорная'}
                                        />

                                        <span className="booking-list__actions">
                                            <span
                                                className={`booking-list__status ${isOngoing
                                                    ? 'booking-list__status--ongoing'
                                                    : 'booking-list__status--upcoming'
                                                    }`}
                                            >
                                                {isOngoing ? 'Идёт сейчас' : 'Предстоящая'}
                                            </span>

                                            <span className="booking-list__open-label" aria-hidden="true">
                                                Открыть →
                                            </span>
                                        </span>
                                    </button>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default BookingList