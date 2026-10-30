import type { Room } from '../data/rooms'

type RoomCardProps = {
    room: Room
    onSelect: (room: Room) => void
}

function RoomCard({ room, onSelect }: RoomCardProps) {
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
                <button
                    className="room-card__button"
                    type="button"
                    onClick={() => onSelect(room)}
                >
                    Посмотреть расписание
                </button>
            </div>
        </article>
    )
}

export default RoomCard;
