export type Exam = 'ОГЭ' | 'ЕГЭ база' | 'ЕГЭ профиль'
export type HWStatus = 'assigned' | 'submitted' | 'checked' | 'overdue'
export type SubscriptionTier = 'platform' | 'own_students' | 'none'

export interface Student {
  id: string; name: string; avatar: string; exam: Exam
  score: number; streak: number; weakTopics: string[]
  hwPending: number; hwDone: number; lastActive: string
  notes: string; tutor: string
}

export interface Homework {
  id: string; title: string; studentId: string; studentName: string
  status: HWStatus; dueDate: string; tasks: number; submitted?: string
  grade?: number; comment?: string
}

export interface Message {
  id: string; from: string; fromId: string; text: string
  time: string; read: boolean; avatar: string
}

export interface Chat {
  id: string; name: string; avatar: string; lastMsg: string
  time: string; unread: number; online: boolean
}

export interface Lesson {
  id: string; studentName: string; date: string; time: string
  topic: string; duration: number
}
