
import { supabase } from './supabase'
import type { Booking } from '../data/bookings'

type BookingRow = {
    id: string
    room_id: string
    title: string
    date: string
    start_time: string
    end_time: string
    user_id?: string
}

function mapBooking(row: BookingRow): Booking {
    return {
        id: row.id,
        roomId: row.room_id,
        title: row.title,
        date: row.date,
        startTime: row.start_time.slice(0, 5),
        endTime: row.end_time.slice(0, 5),
        userId: row.user_id,
    }
}



export async function fetchBookings(): Promise<Booking[]> {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError && authError.name !== 'AuthSessionMissingError') {
        throw authError
    }

    if (user) {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, room_id, user_id, title, date, start_time, end_time')
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })

        if (error) throw error

        return data.map(mapBooking)
    }

    const { data, error } = await supabase
        .from('bookings')
        .select('id, room_id, title, date, start_time, end_time')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

    if (error) throw error

    return data.map(mapBooking)
}




export async function createBooking(
    booking: Booking,
    userId: string
): Promise<void> {
    const { error } = await supabase
        .from('bookings')
        .insert({
            id: booking.id,
            room_id: booking.roomId,
            user_id: userId,
            title: booking.title,
            date: booking.date,
            start_time: booking.startTime,
            end_time: booking.endTime,
        })

    if (error) {
        throw error
    }
}


export async function updateBooking(
    booking: Booking,
    userId: string
): Promise<void> {
    const { data, error } = await supabase
        .from('bookings')
        .update({
            title: booking.title,
            start_time: booking.startTime,
            end_time: booking.endTime,
        })
        .eq('id', booking.id)
        .eq('user_id', userId)
        .select('id')

    if (error) {
        throw error
    }

    if (!data || data.length === 0) {
        throw new Error(
            'Бронирование не найдено или у тебя нет прав на его изменение.'
        )
    }
}


export async function deleteBooking(
    bookingId: string,
    userId: string
): Promise<void> {
    const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select('id')

    if (error) {
        throw error
    }

    if (!data || data.length === 0) {
        throw new Error(
            'Бронирование не найдено или у тебя нет прав на его отмену.'
        )
    }
}


