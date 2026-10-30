import type { Room } from '../data/rooms'
import {
    addDays,
    addThirtyMinutes,
    getTodayInMoscow,
} from '../utils/date'
import type { Booking } from '../data/bookings'
import type { BookingSelection } from '../types/booking'
import { useEffect, useRef, useState } from 'react'


type ScheduleProps = {
    rooms: Room[]
    bookings: Booking[]
    selectedDate: string
    onDateChange: (date: string) => void
    onSelectSlot: (selection: BookingSelection) => void
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
}: ScheduleProps) {
    const [dragSelection, setDragSelection] =
        useState<DragSelection | null>(null)

    const dragSelectionRef = useRef<DragSelection | null>(null)
    const tableRef = useRef<HTMLTableElement | null>(null)

    function updateDragSelection(selection: DragSelection | null) {
        dragSelectionRef.current = selection
        setDragSelection(selection)
    }

    function handleDragStart(roomId: string, time: string) {
        updateDragSelection({
            roomId,
            date: selectedDate,
            anchorTime: time,
            currentTime: time,
        })
    }

    function handleDragEnter(roomId: string, time: string) {
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

        const hasConflict = bookings.some(
            (booking) =>
                booking.roomId === range.roomId &&
                booking.date === range.date &&
                range.startTime < booking.endTime &&
                range.endTime > booking.startTime
        )

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
        <section className="schedule" aria-labelledby="schedule-heading">
            <h2 id="schedule-heading">Расписание переговорных</h2>
            <div className="schedule__date-controls">
                <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, -1))}
                    aria-label="Предыдущий день"
                >
                    ←
                </button>

                <label htmlFor="schedule-date">Дата</label>

                <input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                        if (event.target.value) {
                            onDateChange(event.target.value)
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate, 1))}
                    aria-label="Следующий день"
                >
                    →
                </button>

                <button
                    type="button"
                    onClick={() => onDateChange(getTodayInMoscow())}
                >
                    Сегодня
                </button>
            </div>

            <p className="schedule__hint">
                Время указано по Москве, с 08:00 до 20:00.
            </p>

            <div className="schedule__scroll">
                <table ref={tableRef} className="schedule__table">
                    <thead>
                        <tr>
                            <th className="schedule__time" scope="col">
                                Время
                            </th>

                            {rooms.map((room) => (
                                <th key={room.id} scope="col">
                                    {room.name}
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
                                        return (
                                            <td
                                                key={room.id}
                                                className="schedule__booking"
                                                rowSpan={getBookingSlots(startingBooking)}
                                            >
                                                <strong>{startingBooking.title}</strong>
                                                <span>
                                                    {startingBooking.startTime}–{startingBooking.endTime}
                                                </span>
                                            </td>
                                        )
                                    }

                                    const isSelected =
                                        selectedRange !== null &&
                                        selectedRange.roomId === room.id &&
                                        time >= selectedRange.startTime &&
                                        time < selectedRange.endTime

                                    return (
                                        <td key={room.id} className="schedule__free-cell">
                                            <button
                                                type="button"
                                                className={`schedule__slot${isSelected ? ' schedule__slot--selected' : ''}`}
                                                data-slot-room={room.id}
                                                data-slot-time={time}
                                                aria-label={`Выбрать ${room.name}, ${time}`}
                                                onMouseDown={(event) => {
                                                    if (event.button !== 0) {
                                                        return
                                                    }

                                                    event.preventDefault()
                                                    event.currentTarget.focus()
                                                    handleDragStart(room.id, time)
                                                }}
                                                onMouseEnter={() => handleDragEnter(room.id, time)}
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
                                                <span aria-hidden="true">+</span>
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