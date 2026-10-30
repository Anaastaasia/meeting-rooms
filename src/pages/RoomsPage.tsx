import { useSearchParams } from 'react-router'
import { rooms } from '../data/rooms'
import RoomCard from '../components/RoomCard'

function RoomsPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const capacityParam = Number(searchParams.get('capacity') ?? 0)

    const minCapacity = [0, 2, 4, 6, 8, 10, 20].includes(capacityParam)
        ? capacityParam
        : 0

    function handleCapacityChange(value: number) {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams)

            if (value === 0) {
                nextParams.delete('capacity')
            } else {
                nextParams.set('capacity', String(value))
            }

            return nextParams
        })
    }

    const filteredRooms = rooms.filter(
        (room) => room.capacity >= minCapacity
    )

    return (
        <section aria-labelledby="rooms-heading">
            <h2 id="rooms-heading">Переговорные</h2>

            <div className="rooms-filter">
                <label htmlFor="min-capacity">
                    Количество участников
                </label>

                <select
                    id="min-capacity"
                    value={minCapacity}
                    onChange={(event) =>
                        handleCapacityChange(Number(event.target.value))
                    }
                >
                    <option value={0}>Любое</option>
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>

            <div className="rooms-grid">
                {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <p role="status">
                    Нет переговорных с такой вместимостью.
                    Попробуй уменьшить количество участников.
                </p>
            )}
        </section>
    )
}

export default RoomsPage