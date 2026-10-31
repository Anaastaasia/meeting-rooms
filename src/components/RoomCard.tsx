import { Link } from 'react-router'
import type { Room } from '../data/rooms'

type RoomCardProps = {
    room: Room
}

function RoomCard({ room }: RoomCardProps) {
    const coverImage = room.images[0]

    return (
        <article className="room-card" data-room={room.id}>
            <Link
                className="room-card__link"
                to={`/rooms/${room.id}`}
                aria-label={`Открыть переговорную «${room.name}»`}
            >
                {coverImage && (
                    <img
                        className="room-card__image"
                        src={coverImage.src}
                        alt={coverImage.alt}
                        loading="lazy"
                    />
                )}

                <div className="room-card__content">
                    <div className="room-card__heading">
                        <span className="room-dot" aria-hidden="true" />
                        <h3>{room.name}</h3>
                        <span className="room-card__arrow" aria-hidden="true">
                            ↗
                        </span>
                    </div>

                    <p className="room-card__capacity">
                        До {room.capacity} человек
                    </p>

                    <ul
                        className="room-card__equipment"
                        aria-label="Оборудование"
                    >
                        {room.equipment.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </Link>
        </article>
    )
}

export default RoomCard