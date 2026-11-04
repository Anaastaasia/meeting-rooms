
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TooltipPoint = {
    x: number
    y: number
}

type BookingTooltipProps = {
    anchor: HTMLElement | null
    message: string
    point: TooltipPoint | null
    onClose: () => void
}

type TooltipPosition = {
    top: number
    left: number
}

const OFFSET = 14
const SCREEN_MARGIN = 12

function BookingTooltip({
    anchor,
    message,
    point,
    onClose,
}: BookingTooltipProps) {
    const tooltipId = useId()
    const tooltipRef = useRef<HTMLDivElement | null>(null)
    const [position, setPosition] = useState<TooltipPosition | null>(null)

    useEffect(() => {
        if (!anchor || !point) return

        const tooltip = tooltipRef.current
        if (!tooltip) return

        const width = tooltip.offsetWidth
        const height = tooltip.offsetHeight

        const rect = anchor.getBoundingClientRect()

        let left = rect.right + OFFSET
        let top = point.y - 12

        if (left + width > window.innerWidth - SCREEN_MARGIN) {
            left = rect.left - width - OFFSET
        }

        if (left < SCREEN_MARGIN) {
            left = point.x + OFFSET
        }

        if (top + height > window.innerHeight - SCREEN_MARGIN) {
            top = window.innerHeight - height - SCREEN_MARGIN
        }

        setPosition({
            left: Math.max(
                SCREEN_MARGIN,
                Math.min(left, window.innerWidth - width - SCREEN_MARGIN)
            ),
            top: Math.max(
                SCREEN_MARGIN,
                Math.min(top, window.innerHeight - height - SCREEN_MARGIN)
            ),
        })
    }, [anchor, point, message])

    useEffect(() => {
        if (!anchor) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        function handlePointerDown(event: PointerEvent) {
            if (
                event.target instanceof Node &&
                !anchor?.contains(event.target)
            ) {
                onClose()
            }
        }

        function handleScroll() {
            onClose()
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('scroll', handleScroll, true)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [anchor, onClose])

    if (!anchor || !point) return null

    return createPortal(
        <div
            ref={tooltipRef}
            id={tooltipId}
            className="booking-tooltip"
            role="tooltip"
            style={{
                top: position?.top ?? -1000,
                left: position?.left ?? -1000,
                visibility: position ? 'visible' : 'hidden',
            }}
        >
            <span className="booking-tooltip__icon" aria-hidden="true">
                i
            </span>
            <span>{message}</span>
        </div>,
        document.body
    )
}

export default BookingTooltip
