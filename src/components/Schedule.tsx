import type { Room } from '../data/rooms'
import { addDays, getTodayInMoscow } from '../utils/date'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'



type ScheduleProps = {
    rooms: Room[]
    bookings: Booking[]
    selectedDate: string
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
}

const timeSlots = Array.from({ length: 24 }, (_, index) => {
    const totalMinutes = 8 * 60 + index * 30

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

function getBookingSlots(booking: Booking): number {
    const [startHours, startMinutes] = booking.startTime.split(':').map(Number)
    const [endHours, endMinutes] = booking.endTime.split(':').map(Number)

    const start = startHours * 60 + startMinutes
    const end = endHours * 60 + endMinutes

    return (end - start) / 30
}

function Schedule({
    rooms,
    bookings,
    selectedDate,
    onDateChange,
    onSelectSlot,
}: ScheduleProps) {
    return (
        <section className="schedule" aria-labelledby="schedule-heading">
            <h2 id="schedule-heading">Расписание переговорных</h2>
            <div className="schedule__date-controls">
                <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, -1))}
                    aria-label="Предыдущий день"
                >
                    ←
                </button>

                <label htmlFor="schedule-date">Дата</label>

                <input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                        if (event.target.value) {
                            onDateChange(event.target.value)
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, 1))}
                    aria-label="Следующий день"
                >
                    →
                </button>

                <button
                    type="button"
                    onClick={() => onDateChange(getTodayInMoscow())}
                >
                    Сегодня
                </button>
            </div>

            <p className="schedule__hint">
                Время указано по Москве, с 08:00 до 20:00.
            </p>

            <div className="schedule__scroll">
                <table className="schedule__table">
                    <thead>
                        <tr>
                            <th className="schedule__time" scope="col">
                                Время
                            </th>

                            {rooms.map((room) => (
                                <th key={room.id} scope="col">
                                    {room.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {timeSlots.map((time) => (
                            <tr key={time}>
                                <th className="schedule__time" scope="row">
                                    {time}
                                </th>
                                {rooms.map((room) => {
                                    const roomBookings = bookings.filter(
                                        (booking) =>
                                            booking.roomId === room.id &&
                                            booking.date === selectedDate
                                    )

                                    const startingBooking = roomBookings.find(
                                        (booking) => booking.startTime === time
                                    )

                                    const continuingBooking = roomBookings.find(
                                        (booking) =>
                                            booking.startTime < time &&
                                            time < booking.endTime
                                    )

                                    if (continuingBooking) {
                                        return null
                                    }

                                    if (startingBooking) {
                                        return (
                                            <td
                                                key={room.id}
                                                className="schedule__booking"
                                                rowSpan={getBookingSlots(startingBooking)}
                                            >
                                                <strong>{startingBooking.title}</strong>
                                                <span>
                                                    {startingBooking.startTime}–{startingBooking.endTime}
                                                </span>
                                            </td>
                                        )
                                    }

                                    return (
                                        <td key={room.id} className="schedule__free-cell">
                                            <button
                                                type="button"
                                                className="schedule__slot"
                                                aria-label={`Выбрать ${room.name}, ${time}`}
                                                onClick={() =>
                                                    onSelectSlot({
                                                        roomId: room.id,
                                                        date: selectedDate,
                                                        startTime: time,
                                                    })
                                                }
                                            >
                                                <span aria-hidden="true">+</span>
                                            </button>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default Schedule