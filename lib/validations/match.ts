import { z } from 'zod'

export const createMatchSchema = z.object({
  // Basic match info
  location: z.string()
    .min(3, 'La ubicación debe tener al menos 3 caracteres')
    .max(100, 'La ubicación no puede exceder 100 caracteres'),
  
  match_type: z.enum(['friendly', 'training']).default('friendly'),
  
  capacity: z.number()
    .int('Debe ser un número entero')
    .default(18),
  
  is_private: z.boolean().default(false),
  
  // Date and time
  date: z.string()
    .min(1, 'Selecciona una fecha'),
  
  start_time: z.string()
    .min(1, 'Selecciona una hora de inicio')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  
  duration: z.number()
    .min(1, 'Mínimo 1 hora')
    .max(4, 'Máximo 4 horas')
    .default(1.5),
  
  // Cost and renter info
  total_cost: z.number()
    .min(0, 'El costo no puede ser negativo')
    .max(500, 'El costo no puede exceder 500€')
    .nullable()
    .optional(),
  
  renter_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
  
  renter_player_id: z.string().uuid().optional(),
  
  // Optional description
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
})
  .refine((data) => {
    // At least one of renter_name or renter_player_id must be provided
    return data.renter_name || data.renter_player_id
  }, {
    message: 'Proporciona el nombre del organizador',
    path: ['renter_name']
  })
  .refine((data) => {
    // Validate that the date is not in the past
    const selectedDate = new Date(data.date + 'T' + data.start_time)
    const now = new Date()
    return selectedDate > now
  }, {
    message: 'La fecha y hora deben ser en el futuro',
    path: ['date']
  })
  .refine((data) => {
    // Validate capacity based on match type
    if (data.match_type === 'training') {
      return data.capacity >= 1 && data.capacity <= 6
    } else {
      return data.capacity >= 14 && data.capacity <= 18
    }
  }, {
    message: 'Capacidad inválida para el tipo de partido seleccionado',
    path: ['capacity']
  })

export type CreateMatchFormData = z.infer<typeof createMatchSchema>

// Helper function to convert form data to API format
export function formatMatchData(formData: CreateMatchFormData) {
  const startDateTime = new Date(formData.date + 'T' + formData.start_time)
  const endDateTime = new Date(startDateTime.getTime() + (formData.duration * 60 * 60 * 1000))
  
  return {
    starts_at: startDateTime.toISOString(),
    ends_at: endDateTime.toISOString(),
    location: formData.location,
    capacity: formData.capacity,
    is_private: formData.is_private,
    match_type: formData.match_type as 'friendly' | 'training',
    total_cost: formData.total_cost || null,
    renter_name: formData.renter_name || null,
    renter_player_id: formData.renter_player_id || null,
  }
}
