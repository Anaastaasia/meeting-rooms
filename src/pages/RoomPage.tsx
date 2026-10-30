import { Link, useParams } from 'react-router'
import { rooms } from '../data/rooms'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import RoomDetails from '../components/RoomDetails'

type RoomPageProps = {
    bookings: Booking[]
    selectedDate: string
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
}

function RoomPage({
    bookings,
    selectedDate,
    onDateChange,
    onSelectSlot,
}: RoomPageProps) {
    const { roomId } = useParams()

    const room = rooms.find((room) => room.id === roomId)

    if (!room) {
        return (
            <section aria-labelledby="room-not-found-heading">
                <h2 id="room-not-found-heading">
                    Переговорная не найдена
                </h2>

                <Link to="/rooms">Вернуться к переговорным</Link>
            </section>
        )
    }

    return (
        <>
            <Link to="/rooms">← Все переговорные</Link>

            <RoomDetails
                key={room.id}
                room={room}
                bookings={bookings}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onSelectSlot={onSelectSlot}
            />
        </>
    )
}

export default RoomPage