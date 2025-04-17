import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour convertir les objets Decimal en nombre
//pour éviter ce prisma warning : Warning: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
// {id: ..., name: ..., createdAt: Date, updatedAt: ..., laneId: ..., order: ..., value: Decimal, description: ..., customerId: ..., assignedUserId: ..., Tags: ..., Assigned: ..., Customer: ...}
export function convertDecimalToNumber<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object') {
    // Vérifie si l'objet est un Decimal (a une méthode toNumber)
    if (obj && typeof (obj as any).toNumber === 'function') {
      return (obj as any).toNumber() as unknown as T;
    }
    
    // Si c'est une date, on la laisse telle quelle
    if (obj instanceof Date) {
      return obj;
    }
    
    // Si c'est un tableau, on convertit chaque élément
    if (Array.isArray(obj)) {
      return obj.map(item => convertDecimalToNumber(item)) as unknown as T;
    }
    
    // Pour les objets classiques, on convertit récursivement chaque propriété
    const result = {} as Record<string, any>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertDecimalToNumber((obj as Record<string, any>)[key]);
      }
    }
    return result as unknown as T;
  }
  
  // Pour les types primitifs, on les retourne tels quels
  return obj;
}
