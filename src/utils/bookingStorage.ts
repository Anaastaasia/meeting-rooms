import type { Booking } from '../data/bookings'
import { bookings as initialBookings } from '../data/bookings'

const STORAGE_KEY = 'meeting-room-bookings'

export function loadBookings(): Booking[] {
    const savedBookings = localStorage.getItem(STORAGE_KEY)

    if (savedBookings === null) {
        return initialBookings
    }

    const parsedBookings: unknown = JSON.parse(savedBookings)

    if (!Array.isArray(parsedBookings)) {
        throw new Error('Сохранённые бронирования имеют неверный формат.')
    }

    return parsedBookings as Booking[]
}

export function saveBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}