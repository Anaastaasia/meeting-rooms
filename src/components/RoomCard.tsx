import type { Room } from '../data/rooms'
import { Link } from 'react-router'

type RoomCardProps = {
    room: Room
}

function RoomCard({ room }: RoomCardProps) {
    const coverImage = room.images[0]
    return (
        <article className="room-card">
            {coverImage && (
                <img
                    className="room-card__image"
                    src={coverImage.src}
                    alt={coverImage.alt}
                    loading="lazy"
                />
            )}

            <div className="room-card__content">
                <h3>{room.name}</h3>
                <p>Вместимость: {room.capacity} чел.</p>
                <p className="room-card__equipment">
                    {room.equipment.join(' · ')}
                </p>
                <Link
                    className="room-card__button"
                    to={`/rooms/${room.id}`}
                >
                    Посмотреть расписание
                </Link>
            </div>
        </article>
    )
}

export default RoomCard;
