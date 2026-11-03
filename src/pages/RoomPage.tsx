import { Link, useParams } from 'react-router'
import { rooms } from '../data/rooms'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import RoomDetails from '../components/RoomDetails'

type RoomPageProps = {
    bookings: Booking[]
    selectedDate: string
    isLoading: boolean
    isUnavailable: boolean
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
    onEditBooking: (booking: Booking) => void
}

function RoomPage({
    bookings,
    selectedDate,
    isLoading,
    isUnavailable,
    onDateChange,
    onSelectSlot,
    onEditBooking,
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
                isLoading={isLoading}
                isUnavailable={isUnavailable}
                onDateChange={onDateChange}
                onSelectSlot={onSelectSlot}
                onEditBooking={onEditBooking}
            />
        </>
    )
}

export default RoomPage