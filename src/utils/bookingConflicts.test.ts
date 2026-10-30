import { describe, expect, it } from 'vitest'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import { hasBookingConflict } from './bookingConflicts'

const existingBooking: Booking = {
    id: 'booking-test',
    roomId: 'elbrus',
    title: 'Тестовая встреча',
    date: '2030-01-15',
    startTime: '10:00',
    endTime: '11:00',
}

const selection: BookingSelection = {
    roomId: 'elbrus',
    date: '2030-01-15',
    startTime: '10:30',
    endTime: '11:30',
}

describe('Проверка пересечений бронирований', () => {
    it('находит частичное пересечение', () => {
        const result = hasBookingConflict(selection, [existingBooking])

        expect(result).toBe(true)
    })

    it('разрешает встречу сразу после другой', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                startTime: '11:00',
                endTime: '12:00',
            },
            [existingBooking]
        )

        expect(result).toBe(false)
    })

    it('разрешает встречу сразу перед другой', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                startTime: '09:00',
                endTime: '10:00',
            },
            [existingBooking]
        )

        expect(result).toBe(false)
    })

    it('находит полное совпадение интервалов', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                startTime: '10:00',
                endTime: '11:00',
            },
            [existingBooking]
        )

        expect(result).toBe(true)
    })

    it('находит существующую встречу внутри нового интервала', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                startTime: '09:00',
                endTime: '12:00',
            },
            [existingBooking]
        )

        expect(result).toBe(true)
    })

    it('разрешает совпадающее время в другой комнате', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                roomId: 'altai',
            },
            [existingBooking]
        )

        expect(result).toBe(false)
    })

    it('разрешает совпадающее время в другой день', () => {
        const result = hasBookingConflict(
            {
                ...selection,
                date: '2030-01-16',
            },
            [existingBooking]
        )

        expect(result).toBe(false)
    })

    it('пропускает редактируемую встречу', () => {
        const result = hasBookingConflict(
            selection,
            [existingBooking],
            existingBooking.id
        )

        expect(result).toBe(false)
    })

    it('при редактировании продолжает проверять другие встречи', () => {
        const anotherBooking: Booking = {
            ...existingBooking,
            id: 'another-booking',
            startTime: '11:00',
            endTime: '12:00',
        }

        const result = hasBookingConflict(
            selection,
            [existingBooking, anotherBooking],
            existingBooking.id
        )

        expect(result).toBe(true)
    })

    it('разрешает бронирование при отсутствии других встреч', () => {
        const result = hasBookingConflict(selection, [])

        expect(result).toBe(false)
    })
})