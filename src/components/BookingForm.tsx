import { useEffect, useRef, useState } from 'react'
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
    onCancelBooking: (bookingId: string) => void
    onClose: () => void
}

function BookingForm({
    selection,
    roomName,
    bookings,
    bookingToEdit,
    onSave,
    onCancelBooking,
    onClose,
}: BookingFormProps) {
    const [title, setTitle] = useState(bookingToEdit?.title ?? '')
    const [endTime, setEndTime] = useState(selection.endTime)
    const [error, setError] = useState('')
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)

    const titleRef = useRef<HTMLInputElement | null>(null)
    const returnButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (isConfirmingCancel) {
            returnButtonRef.current?.focus()
        } else {
            titleRef.current?.focus()
        }
    }, [isConfirmingCancel])

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

        const savedBooking: Booking = {
            id: bookingToEdit?.id ?? crypto.randomUUID(),
            roomId: selection.roomId,
            title: trimmedTitle,
            date: selection.date,
            startTime: selection.startTime,
            endTime,
        }

        onSave(savedBooking)
    }

    if (isConfirmingCancel && bookingToEdit) {
        return (
            <section className="booking-preview">
                <h2 id="booking-form-heading">Отменить бронирование?</h2>

                <div className="booking-summary">
                    <strong>{bookingToEdit.title}</strong>
                    <p>{roomName}</p>
                    <p>
                        {bookingToEdit.date} · {bookingToEdit.startTime}–
                        {bookingToEdit.endTime} · Москва
                    </p>
                </div>

                <p className="booking-cancel-note">
                    Встреча будет удалена, а время освободится.
                    Несохранённые изменения будут потеряны.
                </p>

                <div className="booking-form__actions">
                    <button
                        ref={returnButtonRef}
                        type="button"
                        onClick={() => setIsConfirmingCancel(false)}
                    >
                        Вернуться к редактированию
                    </button>

                    <button
                        className="button--danger"
                        type="button"
                        onClick={() => onCancelBooking(bookingToEdit.id)}
                    >
                        Отменить бронирование
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section
            className="booking-preview"
            aria-labelledby="booking-form-heading"
        >
            <h2 id="booking-form-heading">
                {bookingToEdit ? 'Бронирование' : 'Новое бронирование'}
            </h2>

            <div className="booking-summary">
                <strong>{roomName}</strong>
                <p>{selection.date} · Москва</p>
                <p>Начало в {selection.startTime}</p>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
                <label htmlFor="booking-title">Название встречи</label>

                <input
                    ref={titleRef}
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

                {error && (
                    <p className="booking-form__error" role="alert">
                        {error}
                    </p>
                )}

                <div className="booking-form__actions">
                    <button type="submit">
                        {bookingToEdit ? 'Сохранить изменения' : 'Забронировать'}
                    </button>

                    <button type="button" onClick={onClose}>
                        Закрыть
                    </button>
                </div>
            </form>

            {bookingToEdit && (
                <div className="booking-cancel-section">
                    <button
                        className="button--danger-text"
                        type="button"
                        onClick={() => setIsConfirmingCancel(true)}
                    >
                        Отменить бронирование
                    </button>
                </div>
            )}
        </section>
    )
}

export default BookingForm