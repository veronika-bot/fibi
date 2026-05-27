import type { Student, Homework, Chat, Lesson } from './types'

export const MOCK_TUTOR = {
  name: 'Вероника', lastName: 'Иванова', avatar: 'ВИ',
  subject: 'Математика', exp: 5, rating: 4.9, reviews: 47,
  chartRank: 2, checksTotal: 312, streakDays: 18,
  tier: 'own_students' as const,
  bio: 'Репетитор по математике. ОГЭ и ЕГЭ. Подготовила более 200 учеников.',
}

export const MOCK_STUDENTS: Student[] = [
  { id:'s1', name:'Анна Смирнова', avatar:'АС', exam:'ОГЭ', score:72, streak:5,
    weakTopics:['Геометрия','Неравенства'], hwPending:2, hwDone:8, lastActive:'2ч назад', notes:'', tutor:'vi' },
  { id:'s2', name:'Кирилл Попов', avatar:'КП', exam:'ЕГЭ профиль', score:61, streak:12,
    weakTopics:['Интегралы','Тригонометрия'], hwPending:1, hwDone:14, lastActive:'вчера', notes:'', tutor:'vi' },
  { id:'s3', name:'Маша Козлова', avatar:'МК', exam:'ЕГЭ база', score:85, streak:21,
    weakTopics:['Дроби'], hwPending:0, hwDone:22, lastActive:'1ч назад', notes:'', tutor:'vi' },
  { id:'s4', name:'Тима Орлов', avatar:'ТО', exam:'ОГЭ', score:55, streak:3,
    weakTopics:['Уравнения','Функции'], hwPending:3, hwDone:5, lastActive:'3д назад', notes:'', tutor:'vi' },
]

export const MOCK_HW: Homework[] = [
  { id:'h1', title:'Геометрия: треугольники', studentId:'s1', studentName:'Анна Смирнова',
    status:'submitted', dueDate:'2026-05-28', tasks:8, submitted:'2026-05-27' },
  { id:'h2', title:'Квадратные уравнения', studentId:'s2', studentName:'Кирилл Попов',
    status:'assigned', dueDate:'2026-05-30', tasks:12 },
  { id:'h3', title:'Проценты и дроби', studentId:'s3', studentName:'Маша Козлова',
    status:'checked', dueDate:'2026-05-25', tasks:10, grade:9 },
  { id:'h4', title:'Линейные уравнения', studentId:'s4', studentName:'Тима Орлов',
    status:'overdue', dueDate:'2026-05-22', tasks:7 },
  { id:'h5', title:'Вероятность и статистика', studentId:'s1', studentName:'Анна Смирнова',
    status:'assigned', dueDate:'2026-06-01', tasks:6 },
]

export const MOCK_CHATS: Chat[] = [
  { id:'c1', name:'Анна Смирнова', avatar:'АС', lastMsg:'Спасибо, поняла!', time:'10:41', unread:2, online:true },
  { id:'c2', name:'Кирилл Попов', avatar:'КП', lastMsg:'Можно перенести урок?', time:'вчера', unread:1, online:false },
  { id:'c3', name:'Маша Козлова', avatar:'МК', lastMsg:'Домашку сдала', time:'вчера', unread:0, online:true },
  { id:'c4', name:'Тима Орлов', avatar:'ТО', lastMsg:'Буду на следующей неделе', time:'пн', unread:0, online:false },
]

export const MOCK_LESSONS: Lesson[] = [
  { id:'l1', studentName:'Анна Смирнова', date:'Сегодня', time:'15:00', topic:'Геометрия — площади', duration:60 },
  { id:'l2', studentName:'Кирилл Попов', date:'Сегодня', time:'17:00', topic:'Тригонометрия', duration:90 },
  { id:'l3', studentName:'Маша Козлова', date:'Завтра', time:'11:00', topic:'ЕГЭ: разбор варианта', duration:60 },
]

export const MOCK_CHART = [
  { rank:1, name:'Дина Ахметова', avatar:'ДА', checks:487, badge:'founder', score:98 },
  { rank:2, name:'Вероника Иванова', avatar:'ВИ', checks:312, badge:'founder', score:94 },
  { rank:3, name:'Елена Соколова', avatar:'ЕС', checks:241, badge:null, score:87 },
  { rank:4, name:'Артём Новиков', avatar:'АН', checks:198, badge:null, score:82 },
  { rank:5, name:'Светлана Петрова', avatar:'СП', checks:175, badge:null, score:79 },
  { rank:6, name:'Игорь Васильев', avatar:'ИВ', checks:132, badge:null, score:71 },
]

export const ACTIVITY_DATA = [
  { day: 'Пн', checks: 12, students: 3 },
  { day: 'Вт', checks: 8,  students: 2 },
  { day: 'Ср', checks: 18, checks2: 18, students: 4 },
  { day: 'Чт', checks: 5,  students: 1 },
  { day: 'Пт', checks: 22, students: 5 },
  { day: 'Сб', checks: 15, students: 3 },
  { day: 'Вс', checks: 9,  students: 2 },
]
