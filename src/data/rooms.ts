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
    capacity: 4,
    equipment: ['Экран', 'Видеосвязь'],
    images: [
      {
        src: '/rooms/elbrus.jpg',
        alt: 'Переговорная Эльбрус: общий вид',
      },
    ],
  },
  {
    id: 'altai',
    name: 'Алтай',
    capacity: 22,
    equipment: ['Экран', 'Маркерная доска'],
    images: [
      {
        src: '/rooms/altai.jpg',
        alt: 'Переговорная Алтай: общий вид',
      },
      {
        src: '/rooms/altai-2.jpg',
        alt: 'Переговорная Алтай: второй ракурс',
      },
    ],
  },
  {
    id: 'baikal',
    name: 'Байкал',
    capacity: 12,
    equipment: ['Экран', 'Видеосвязь', 'Маркерная доска'],
    images: [
      {
        src: '/rooms/baikal.jpg',
        alt: 'Переговорная Байкал: общий вид',
      },
      {
        src: '/rooms/baikal-2.jpg',
        alt: 'Переговорная Байкал: второй ракурс',
      },
    ],
  },
  {
    id: 'setun',
    name: 'Сетунь',
    capacity: 8,
    equipment: ['Экран', 'Проектор', 'Видеосвязь'],
    images: [
      {
        src: '/rooms/setun.jpg',
        alt: 'Переговорная Сетунь: общий вид',
      },
      {
        src: '/rooms/setun-2.jpg',
        alt: 'Переговорная Сетунь: второй ракурс',
      },
    ],
  },
  {
    id: 'vega',
    name: 'Вега',
    capacity: 12,
    equipment: ['Экран', 'Маркерная доска'],
    images: [
      {
        src: '/rooms/vega.jpg',
        alt: 'Переговорная Вега: общий вид',
      },
      {
        src: '/rooms/vega-2.jpg',
        alt: 'Переговорная Вега: второй ракурс',
      },
    ],
  },
  {
    id: 'agate',
    name: 'Агат',
    capacity: 8,
    equipment: ['Экран', 'Маркерная доска'],
    images: [
      {
        src: '/rooms/agate.jpg',
        alt: 'Переговорная Агат: общий вид',
      },
      {
        src: '/rooms/agate-2.jpg',
        alt: 'Переговорная Агат: второй ракурс',
      },
    ],
  },
]