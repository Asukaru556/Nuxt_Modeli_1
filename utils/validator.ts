// Auth
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const isValidPassword = (pass: string) => pass.length >= 4 && !/\s/.test(pass)

// Category
export const validateCategoryName = (name: string) => {
  if (!name || name.trim().length === 0) return 'Поле является обязательным!'
  if (name.length >= 256) return 'Должно быть не больше 256 символов!'
  return ''
}

// Model
export const validateRequiredMax = (val: string, max: number) => {
  if (!val || val.toString().trim().length === 0) return 'Поле обязательно!'
  if (val.length > max) return `Не более ${max} символов`
  return ''
}

export const validateNonNegative = (val: number | string | null | undefined, label: string): string => {
  if (val === null || val === undefined || String(val).trim() === '') return 'Поле обязательно!'
  
  const num = Number(val)
  if (isNaN(num)) return 'Введите число'
  if (num < 0) return `${label} не может быть меньше 0`
  return ''
}

export const validateCategory = (val: number | null) => {
  if (val === null || val === undefined) {
    return 'Выберите категорию из списка'
  }
  return ''
}

export const validateImageFile = (file: File | null) => {
  if (!file) return 'Изображение обязательно'
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return 'Разрешены только изображения (JPG, PNG, GIF)'
  }
  return ''
}

export const validateModelFile = (file: File | null) => {
  if (!file) return 'Файл модели обязателен'
  
  const fileName = file.name.toLowerCase()
  const isModel = fileName.endsWith('.glb') || fileName.endsWith('.obj') || fileName.endsWith('.fbx')
  
  if (!isModel) {
    return 'Разрешены только форматы .glb, .obj, .fbx'
  }
  return ''
}