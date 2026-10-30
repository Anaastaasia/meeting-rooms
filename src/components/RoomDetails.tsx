import type { Room } from '../data/rooms'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import Schedule from './Schedule'
import RoomGallery from './RoomGallery'

type RoomDetailsProps = {
    room: Room
    bookings: Booking[]
    selectedDate: string
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
}

function RoomDetails({
    room,
    bookings,
    selectedDate,
    onDateChange,
    onSelectSlot,
}: RoomDetailsProps) {
    return (
        <section
            className="room-details"
            aria-labelledby="selected-room-heading"
        >
            <div className="room-details__header">
                <h2 id="selected-room-heading">
                    Переговорная «{room.name}»
                </h2>
            </div>

            <RoomGallery key={room.id} images={room.images} />

            <p>Вместимость: {room.capacity} чел.</p>
            <p>Время работы: 08:00–20:00, Москва.</p>

            <h3>Оборудование</h3>

            <ul>
                {room.equipment.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>

            <Schedule
                rooms={[room]}
                bookings={bookings}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onSelectSlot={onSelectSlot}
            />
        </section>
    )
}

export default RoomDetails