import type { Booking } from '../data/bookings'
import { rooms } from '../data/rooms'

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false
    }

    const date = new Date(`${value}T00:00:00Z`)

    if (Number.isNaN(date.getTime())) {
        return false
    }

    return date.toISOString().slice(0, 10) === value
}

function isValidTime(value: string): boolean {
    return /^(?:[01]\d|2[0-3]):(?:00|30)$/.test(value)
}

function isBooking(value: unknown): value is Booking {
    if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
    ) {
        return false
    }

    if (
        !('id' in value) ||
        !('roomId' in value) ||
        !('title' in value) ||
        !('date' in value) ||
        !('startTime' in value) ||
        !('endTime' in value)
    ) {
        return false
    }

    if (
        typeof value.id !== 'string' ||
        typeof value.roomId !== 'string' ||
        typeof value.title !== 'string' ||
        typeof value.date !== 'string' ||
        typeof value.startTime !== 'string' ||
        typeof value.endTime !== 'string'
    ) {
        return false
    }

    if (
        !value.id.trim() ||
        !value.title.trim() ||
        !rooms.some((room) => room.id === value.roomId)
    ) {
        return false
    }

    if (
        !isValidDate(value.date) ||
        !isValidTime(value.startTime) ||
        !isValidTime(value.endTime)
    ) {
        return false
    }

    return (
        value.startTime >= '08:00' &&
        value.endTime <= '20:00' &&
        value.startTime < value.endTime
    )
}

export function validateBookings(value: unknown): Booking[] {
    if (!Array.isArray(value)) {
        throw new Error('Бронирования должны быть массивом.')
    }

    const result: Booking[] = []
    const usedIds = new Set<string>()

    for (const item of value) {
        if (!isBooking(item)) {
            throw new Error('Одно из бронирований имеет неверный формат.')
        }

        if (usedIds.has(item.id)) {
            throw new Error('Найдены повторяющиеся ID бронирований.')
        }

        const hasConflict = result.some(
            (booking) =>
                booking.roomId === item.roomId &&
                booking.date === item.date &&
                item.startTime < booking.endTime &&
                item.endTime > booking.startTime
        )

        if (hasConflict) {
            throw new Error('Найдены пересекающиеся бронирования.')
        }

        usedIds.add(item.id)
        result.push(item)
    }

    return result
}