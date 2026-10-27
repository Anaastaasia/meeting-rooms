import { getTodayInMoscow, addDays } from '../utils/date'

export type Booking = {
    id: string
    roomId: string
    title: string
    date: string
    startTime: string
    endTime: string
}

const today = getTodayInMoscow()

export const bookings: Booking[] = [
    {
        id: 'booking-1',
        roomId: 'elbrus',
        title: 'Планёрка',
        date: today,
        startTime: '09:00',
        endTime: '10:00',
    },
    {
        id: 'booking-2',
        roomId: 'altai',
        title: 'Обсуждение проекта',
        date: today,
        startTime: '11:30',
        endTime: '13:00',
    },
    {
        id: 'booking-3',
        roomId: 'elbrus',
        title: 'Встреча с командой',
        date: addDays(today, 1),
        startTime: '14:00',
        endTime: '15:00',
    },
]