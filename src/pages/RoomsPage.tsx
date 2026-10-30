import { useSearchParams } from 'react-router'
import { rooms } from '../data/rooms'
import RoomCard from '../components/RoomCard'

const equipmentOptions = Array.from(
    new Set(rooms.flatMap((room) => room.equipment))
)

function RoomsPage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const capacityParam = Number(searchParams.get('capacity') ?? 0)

    const minCapacity = [0, 2, 4, 6, 8, 10, 20].includes(capacityParam)
        ? capacityParam
        : 0

    const equipmentParam = searchParams.get('equipment') ?? ''

    const selectedEquipment = equipmentOptions.includes(equipmentParam)
        ? equipmentParam
        : ''

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

    function handleEquipmentChange(value: string) {
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams)

            if (value === '') {
                nextParams.delete('equipment')
            } else {
                nextParams.set('equipment', value)
            }

            return nextParams
        })
    }

    const filteredRooms = rooms.filter((room) => {
        const matchesCapacity = room.capacity >= minCapacity

        const matchesEquipment =
            selectedEquipment === '' ||
            room.equipment.includes(selectedEquipment)

        return matchesCapacity && matchesEquipment
    })

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
                <label htmlFor="room-equipment">Оборудование</label>

                <select
                    id="room-equipment"
                    value={selectedEquipment}
                    onChange={(event) =>
                        handleEquipmentChange(event.target.value)
                    }
                >
                    <option value="">Любое</option>

                    {equipmentOptions.map((equipment) => (
                        <option key={equipment} value={equipment}>
                            {equipment}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    disabled={minCapacity === 0 && selectedEquipment === ''}
                    onClick={() => {
                        setSearchParams((currentParams) => {
                            const nextParams = new URLSearchParams(currentParams)

                            nextParams.delete('capacity')
                            nextParams.delete('equipment')

                            return nextParams
                        })
                    }}
                >
                    Сбросить фильтры
                </button>
            </div>

            <div className="rooms-grid">
                {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <p role="status">
                    Нет переговорных с такими параметрами.
                    Измени или сбрось фильтры.
                </p>
            )}
        </section>
    )
}

export default RoomsPage