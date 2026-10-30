import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type BookingDialogProps = {
    children: ReactNode
    labelledBy: string
    onClose: () => void
}

function BookingDialog({ children, labelledBy, onClose }: BookingDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog) {
            return
        }

        dialog.showModal()

        return () => {
            dialog.close()
        }
    }, [])

    return (
        <dialog
            ref={dialogRef}
            className="booking-dialog"
            aria-labelledby={labelledBy}
            onCancel={(event) => {
                event.preventDefault()
                onClose()
            }}
        >
            {children}
        </dialog>
    )
}

export default BookingDialog