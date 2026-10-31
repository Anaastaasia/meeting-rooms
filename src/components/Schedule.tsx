import type { Room } from '../data/rooms'
import {
    addDays,
    addThirtyMinutes,
    getTodayInMoscow,
} from '../utils/date'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import { useEffect, useId, useRef, useState } from 'react'
import { hasBookingConflict } from '../utils/bookingConflicts'
import { Link } from 'react-router'


type ScheduleProps = {
    rooms: Room[]
    bookings: Booking[]
    selectedDate: string
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
    onEditBooking: (booking: Booking) => void
}
type DragSelection = {
    roomId: string
    date: string
    anchorTime: string
    currentTime: string
}

function getSelectionRange(selection: DragSelection): BookingSelection {
    const startTime =
        selection.anchorTime < selection.currentTime
            ? selection.anchorTime
            : selection.currentTime

    const lastSlotTime =
        selection.anchorTime > selection.currentTime
            ? selection.anchorTime
            : selection.currentTime

    return {
        roomId: selection.roomId,
        date: selection.date,
        startTime,
        endTime: addThirtyMinutes(lastSlotTime),
    }
}

const timeSlots = Array.from({ length: 24 }, (_, index) => {
    const totalMinutes = 8 * 60 + index * 30

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

function getBookingSlots(booking: Booking): number {
    const [startHours, startMinutes] = booking.startTime.split(':').map(Number)
    const [endHours, endMinutes] = booking.endTime.split(':').map(Number)

    const start = startHours * 60 + startMinutes
    const end = endHours * 60 + endMinutes

    return (end - start) / 30
}

function Schedule({
    rooms,
    bookings,
    selectedDate,
    onDateChange,
    onSelectSlot,
    onEditBooking,
}: ScheduleProps) {
    const headingId = useId()
    const dateInputId = useId()
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        function updateNow() {
            setNow(Date.now())
        }

        const intervalId = window.setInterval(updateNow, 15_000)

        window.addEventListener('focus', updateNow)

        return () => {
            window.clearInterval(intervalId)
            window.removeEventListener('focus', updateNow)
        }
    }, [])

    const [dragSelection, setDragSelection] =
        useState<DragSelection | null>(null)

    const dragSelectionRef = useRef<DragSelection | null>(null)
    const tableRef = useRef<HTMLTableElement | null>(null)

    function updateDragSelection(selection: DragSelection | null) {
        dragSelectionRef.current = selection
        setDragSelection(selection)
    }

    function handleDragStart(
        roomId: string,
        time: string,
        currentTimestamp: number
    ) {
        const startTime = new Date(
            `${selectedDate}T${time}:00+03:00`
        ).getTime()

        if (startTime <= currentTimestamp) {
            return
        }

        updateDragSelection({
            roomId,
            date: selectedDate,
            anchorTime: time,
            currentTime: time,
        })
    }

    function handleDragEnter(
        roomId: string,
        time: string,
        currentTimestamp: number
    ) {
        const currentSelection = dragSelectionRef.current

        if (
            !currentSelection ||
            currentSelection.roomId !== roomId ||
            currentSelection.date !== selectedDate
        ) {
            return
        }

        const nextSelection = {
            ...currentSelection,
            currentTime: time,
        }

        const range = getSelectionRange(nextSelection)
        const rangeStart = new Date(
            `${range.date}T${range.startTime}:00+03:00`
        ).getTime()

        if (rangeStart <= currentTimestamp) {
            return
        }

        const hasConflict = hasBookingConflict(range, bookings)

        if (hasConflict) {
            return
        }

        updateDragSelection(nextSelection)
    }

    useEffect(() => {
        function handleMouseUp(event: MouseEvent) {
            const selection = dragSelectionRef.current

            if (!selection) {
                return
            }

            dragSelectionRef.current = null
            setDragSelection(null)

            if (!(event.target instanceof Element)) {
                return
            }

            const slot = event.target.closest<HTMLButtonElement>(
                'button[data-slot-room]'
            )

            if (
                !slot ||
                !tableRef.current?.contains(slot) ||
                slot.dataset.slotRoom !== selection.roomId ||
                slot.dataset.slotTime !== selection.currentTime ||
                selection.date !== selectedDate
            ) {
                return
            }

            onSelectSlot(getSelectionRange(selection))
        }

        function handleWindowBlur() {
            dragSelectionRef.current = null
            setDragSelection(null)
        }

        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('blur', handleWindowBlur)

        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('blur', handleWindowBlur)
        }
    }, [onSelectSlot, selectedDate])

    const selectedRange =
        dragSelection && dragSelection.date === selectedDate
            ? getSelectionRange(dragSelection)
            : null
    return (
        <section className="schedule" aria-labelledby={headingId}>
            <div className="schedule__header">
                <h2 id={headingId}>Расписание</h2>
                <p className="schedule__office">Москва · 08:00–20:00</p>
            </div>

            <div className="schedule__toolbar">
                <button
                    className="schedule__arrow"
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, -1))}
                    aria-label="Предыдущий день"
                >
                    ←
                </button>

                <div className="schedule__date-field">
                    <label className="visually-hidden" htmlFor={dateInputId}>
                        Дата расписания
                    </label>

                    <input
                        id={dateInputId}
                        type="date"
                        value={selectedDate}
                        onChange={(event) => {
                            if (event.target.value) {
                                onDateChange(event.target.value)
                            }
                        }}
                    />
                </div>

                <button
                    className="schedule__arrow"
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, 1))}
                    aria-label="Следующий день"
                >
                    →
                </button>

                <button
                    className="schedule__today"
                    type="button"
                    onClick={() => onDateChange(getTodayInMoscow())}
                >
                    Сегодня
                </button>
            </div>

            <div className="schedule__scroll">
                <table
                    ref={tableRef}
                    className="schedule__table"
                    style={{ minWidth: `${80 + rooms.length * 180}px` }}
                >
                    <colgroup>
                        <col style={{ width: '80px' }} />

                        {rooms.map((room) => (
                            <col key={room.id} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="schedule__time" scope="col">
                                Время
                            </th>

                            {rooms.map((room) => (
                                <th key={room.id} scope="col" data-room={room.id}>
                                    <Link
                                        className="schedule__room-link"
                                        to={`/rooms/${room.id}`}
                                        aria-label={`Открыть переговорную «${room.name}»`}
                                    >
                                        <span className="room-dot" aria-hidden="true" />

                                        <span className="schedule__room-info">
                                            <span className="schedule__room-name">
                                                {room.name}
                                            </span>

                                            <span className="schedule__room-capacity">
                                                До {room.capacity} человек
                                            </span>
                                        </span>
                                    </Link>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {timeSlots.map((time) => (
                            <tr key={time}>
                                <th className="schedule__time" scope="row">
                                    {time}
                                </th>
                                {rooms.map((room) => {
                                    const roomBookings = bookings.filter(
                                        (booking) =>
                                            booking.roomId === room.id &&
                                            booking.date === selectedDate
                                    )

                                    const startingBooking = roomBookings.find(
                                        (booking) => booking.startTime === time
                                    )

                                    const continuingBooking = roomBookings.find(
                                        (booking) =>
                                            booking.startTime < time &&
                                            time < booking.endTime
                                    )

                                    if (continuingBooking) {
                                        return null

                                    }

                                    if (startingBooking) {
                                        const bookingStart = new Date(
                                            `${startingBooking.date}T${startingBooking.startTime}:00+03:00`
                                        ).getTime()

                                        const canEdit = bookingStart > now

                                        return (
                                            <td
                                                key={room.id}
                                                className="schedule__booking"
                                                data-room={room.id}
                                                rowSpan={getBookingSlots(startingBooking)}
                                                style={{ height: `${getBookingSlots(startingBooking) * 64}px` }}
                                            >
                                                <button
                                                    type="button"
                                                    className="schedule__booking-button"
                                                    disabled={!canEdit}
                                                    onClick={() => onEditBooking(startingBooking)}
                                                    aria-label={
                                                        canEdit
                                                            ? `Изменить встречу «${startingBooking.title}», ${startingBooking.startTime}–${startingBooking.endTime}`
                                                            : `Встреча «${startingBooking.title}», ${startingBooking.startTime}–${startingBooking.endTime}. Редактирование недоступно`
                                                    }
                                                >
                                                    <strong>{startingBooking.title}</strong>
                                                    <span>
                                                        {startingBooking.startTime}–{startingBooking.endTime}
                                                    </span>
                                                </button>
                                            </td>
                                        )
                                    }

                                    const slotStart = new Date(
                                        `${selectedDate}T${time}:00+03:00`
                                    ).getTime()

                                    const isPast = slotStart <= now

                                    const isSelected =
                                        selectedRange !== null &&
                                        selectedRange.roomId === room.id &&
                                        time >= selectedRange.startTime &&
                                        time < selectedRange.endTime

                                    return (
                                        <td key={room.id} className="schedule__free-cell">
                                            <button
                                                type="button"
                                                className={[
                                                    'schedule__slot',
                                                    isSelected ? 'schedule__slot--selected' : '',
                                                    isPast ? 'schedule__slot--past' : '',
                                                ].filter(Boolean).join(' ')}
                                                disabled={isPast}
                                                data-slot-room={room.id}
                                                data-slot-time={time}
                                                aria-label={
                                                    isPast
                                                        ? `${room.name}, ${time}: время уже прошло`
                                                        : `Выбрать ${room.name}, ${time}`
                                                }
                                                onMouseDown={(event) => {
                                                    if (event.button !== 0) {
                                                        return
                                                    }

                                                    event.preventDefault()
                                                    event.currentTarget.focus()
                                                    handleDragStart(room.id, time, Date.now())
                                                }}
                                                onMouseEnter={() =>
                                                    handleDragEnter(room.id, time, Date.now())
                                                }
                                                onClick={(event) => {
                                                    if (event.detail !== 0) {
                                                        return
                                                    }

                                                    onSelectSlot({
                                                        roomId: room.id,
                                                        date: selectedDate,
                                                        startTime: time,
                                                        endTime: addThirtyMinutes(time),
                                                    })
                                                }}
                                            >
                                                <span aria-hidden="true">{isPast ? '—' : '+'}</span>
                                            </button>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default Schedule