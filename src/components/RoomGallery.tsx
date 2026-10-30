import { useState } from 'react'
import type { RoomImage } from '../data/rooms'

type RoomGalleryProps = {
    images: RoomImage[]
}

function RoomGallery({ images }: RoomGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    const activeImage = images[activeIndex]

    function handlePrevious() {
        setActiveIndex((currentIndex) =>
            currentIndex === 0 ? images.length - 1 : currentIndex - 1
        )
    }

    function handleNext() {
        setActiveIndex((currentIndex) =>
            currentIndex === images.length - 1 ? 0 : currentIndex + 1
        )
    }

    if (!activeImage) {
        return <p>Фотографии пока не добавлены.</p>
    }

    return (
        <div className="room-gallery">
            <img
                className="room-gallery__image"
                src={activeImage.src}
                alt={activeImage.alt}
            />

            {images.length > 1 && (
                <div className="room-gallery__controls">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        aria-label="Предыдущая фотография"
                    >
                        ←
                    </button>

                    <span aria-live="polite" aria-atomic="true">
                        Фото {activeIndex + 1} из {images.length}
                    </span>

                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Следующая фотография"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    )
}

export default RoomGallery