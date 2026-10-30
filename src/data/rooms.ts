export type RoomImage = {
  src: string
  alt: string
}

export type Room = {
  id: string
  name: string
  capacity: number
  equipment: string[]
  images: RoomImage[]
}

export const rooms: Room[] = [
  {
    id: 'elbrus',
    name: 'Эльбрус',
    capacity: 6,
    equipment: ['Телевизор', 'Маркерная доска'],
    images: [
      {
        src: '/rooms/elbrus.jpg',
        alt: 'Переговорная Эльбрус: общий вид',
      },
      {
        src: '/rooms/elbrus-2.jpg',
        alt: 'Переговорная Эльбрус: второй ракурс',
      },
      {
        src: '/rooms/elbrus-3.jpg',
        alt: 'Переговорная Эльбрус: третий ракурс',
      },
    ],
  },
  {
    id: 'altai',
    name: 'Алтай',
    capacity: 10,
    equipment: ['Проектор', 'Видеосвязь'],
    images: [
      {
        src: '/rooms/altai.jpg',
        alt: 'Переговорная Алтай: стол, 10 стульев, доска',
      },
      {
        src: '/rooms/altai-2.jpg',
        alt: 'Переговорная Алтай: второй ракурс',
      },
      {
        src: '/rooms/altai-3.jpg',
        alt: 'Переговорная Алтай: третий ракурс',
      },
    ],
  },
  {
    id: 'baikal',
    name: 'Байкал',
    capacity: 4,
    equipment: ['Телевизор'],
    images: [
      {
        src: '/rooms/baikal.jpg',
        alt: 'Переговорная Байкал: стол, 4 стула, телевизор',
      },
      {
        src: '/rooms/baikal-2.jpg',
        alt: 'Переговорная Байкал: второй ракурс',
      },
      {
        src: '/rooms/baikal-3.jpg',
        alt: 'Переговорная Байкал: третий ракурс',
      },
    ],
  },
  {
    id: 'sibir',
    name: 'Сибирь',
    capacity: 6,
    equipment: ['Проектор'],
    images: [
      {
        src: '/rooms/sibir.jpg',
        alt: 'Переговорная Сибирь: общий вид',
      },
      {
        src: '/rooms/sibir-2.jpg',
        alt: 'Переговорная Сибирь: второй ракурс',
      },
      {
        src: '/rooms/sibir-3.jpg',
        alt: 'Переговорная Сибирь: третий ракурс',
      },
    ],
  },
]