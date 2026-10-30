export type Room = {
  id: string
  name: string
  capacity: number
  equipment: string[]
  image: string
  imageAlt: string
}

export const rooms: Room[] = [
  {
    id: 'elbrus',
    name: 'Эльбрус',
    capacity: 6,
    equipment: ['Телевизор', 'Маркерная доска'],
    image: '/rooms/elbrus.jpg',
    imageAlt: 'Переговорная Эльбрус: стол, 6 стульев',
  },
  {
    id: 'altai',
    name: 'Алтай',
    capacity: 10,
    equipment: ['Проектор', 'Видеосвязь'],
    image: '/rooms/altai.jpg',
    imageAlt: 'Переговорная Алтай: стол, 10 стульев, доска',
  },
  {
    id: 'baikal',
    name: 'Байкал',
    capacity: 4,
    equipment: ['Телевизор'],
    image: '/rooms/baikal.jpg',
    imageAlt: 'Переговорная Байкал: стол, 4 стула, телевизор',
  },
  {
    id: 'sibir',
    name: 'Сибирь',
    capacity: 8,
    equipment: ['Проектор'],
    image: '/rooms/sibir.jpg',
    imageAlt: 'Переговорная Сибирь: стол, 8 стульев, проектор',
  },
]