import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'

export function hasBookingConflict(
    selection: BookingSelection,
    bookings: Booking[],
    excludedBookingId?: string
): boolean {
    return bookings.some(
        (booking) =>
            booking.id !== excludedBookingId &&
            booking.roomId === selection.roomId &&
            booking.date === selection.date &&
            selection.startTime < booking.endTime &&
            selection.endTime > booking.startTime
    )
}