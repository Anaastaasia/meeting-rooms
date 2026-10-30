import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import { hasBookingConflict } from '../utils/bookingConflicts'

type BookingFormProps = {
    selection: BookingSelection
    roomName: string
    bookings: Booking[]
    bookingToEdit?: Booking
    onSave: (booking: Booking) => void
    onClose: () => void
}

function BookingForm({
    selection,
    roomName,
    bookings,
    bookingToEdit,
    onSave,
    onClose,
}: BookingFormProps) {
    const [title, setTitle] = useState(bookingToEdit?.title ?? '')
    const [endTime, setEndTime] = useState(selection.endTime)
    const [error, setError] = useState('')

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedTitle = title.trim()

        if (!trimmedTitle) {
            setError('Введи название встречи.')
            return
        }

        if (!endTime || endTime <= selection.startTime || endTime > '20:00') {
            setError('Выбери окончание после начала, не позднее 20:00.')
            return
        }

        const endMinutes = Number(endTime.split(':')[1])

        if (endMinutes !== 0 && endMinutes !== 30) {
            setError('Выбери время с шагом 30 минут.')
            return
        }

        const startDateTime = new Date(
            `${selection.date}T${selection.startTime}:00+03:00`
        )

        if (startDateTime.getTime() <= Date.now()) {
            setError('Начало встречи уже наступило. Сохранить бронирование нельзя.')
            return
        }

        const hasConflict = hasBookingConflict(
            {
                ...selection,
                endTime,
            },
            bookings,
            bookingToEdit?.id
        )

        if (hasConflict) {
            setError('Это время пересекается с другим бронированием.')
            return
        }

        const newBooking: Booking = {
            id: bookingToEdit?.id ?? crypto.randomUUID(),
            roomId: selection.roomId,
            title: trimmedTitle,
            date: selection.date,
            startTime: selection.startTime,
            endTime,
        }

        onSave(newBooking)
    }

    return (
        <section
            className="booking-preview"
            aria-labelledby="booking-form-heading"
        >
            <h2 id="booking-form-heading">
                {bookingToEdit ? 'Редактирование бронирования' : 'Новое бронирование'}
            </h2>

            <p>Переговорная: {roomName}</p>
            <p>Дата: {selection.date}</p>
            <p>Начало: {selection.startTime}</p>

            <form className="booking-form" onSubmit={handleSubmit}>
                <label htmlFor="booking-title">Название встречи</label>
                <input
                    id="booking-title"
                    type="text"
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <label htmlFor="booking-end-time">Окончание</label>
                <input
                    id="booking-end-time"
                    type="time"
                    min="08:00"
                    max="20:00"
                    step={1800}
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                />

                {error && <p className="booking-form__error" role="alert">{error}</p>}

                <div className="booking-form__actions">
                    <button type="submit">
                        {bookingToEdit ? 'Сохранить изменения' : 'Забронировать'}
                    </button>
                    <button type="button" onClick={onClose}>Закрыть</button>
                </div>
            </form>
        </section>
    )
}

export default BookingForm