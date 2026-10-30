import type { Booking } from '../data/bookings'
import { bookings as initialBookings } from '../data/bookings'
import { validateBookings } from './bookingValidation'

const STORAGE_KEY = 'meeting-room-bookings'

export function loadBookings(): Booking[] {
    const savedBookings = localStorage.getItem(STORAGE_KEY)

    if (savedBookings === null) {
        return validateBookings(initialBookings)
    }

    const parsedBookings: unknown = JSON.parse(savedBookings)

    return validateBookings(parsedBookings)
}

export function saveBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}