import React from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'

interface TagComponentProps {
  title: string
  colorName: string
  selectedColor?: (color: string) => void
  isSelected?: boolean
}

const TagComponent: React.FC<TagComponentProps> = ({
  colorName,
  title,
  selectedColor,
  isSelected = false,
}) => {
  return (
    <div
      className={clsx('p-2 rounded-sm flex-shrink-0 text-xs cursor-pointer relative', {
        'bg-[#57acea]/10 text-[#57acea]': colorName === 'BLUE',
        'bg-[#ffac7e]/10 text-[#ffac7e]': colorName === 'ORANGE',
        'bg-rose-500/10 text-rose-500': colorName === 'ROSE',
        'bg-emerald-400/10 text-emerald-400': colorName === 'GREEN',
        'bg-purple-400/10 text-purple-400': colorName === 'PURPLE',
        'border-[1px] border-[#57acea]': colorName === 'BLUE' && !title,
        'border-[1px] border-[#ffac7e]': colorName === 'ORANGE' && !title,
        'border-[1px] border-rose-500': colorName === 'ROSE' && !title,
        'border-[1px] border-emerald-400': colorName === 'GREEN' && !title,
        'border-[1px] border-purple-400': colorName === 'PURPLE' && !title,
        'ring-2 ring-offset-1': isSelected && !title,
        'ring-[#57acea]': isSelected && colorName === 'BLUE' && !title,
        'ring-[#ffac7e]': isSelected && colorName === 'ORANGE' && !title,
        'ring-rose-500': isSelected && colorName === 'ROSE' && !title,
        'ring-emerald-400': isSelected && colorName === 'GREEN' && !title,
        'ring-purple-400': isSelected && colorName === 'PURPLE' && !title,
      })}
      key={colorName}
      onClick={() => {
        if (selectedColor) selectedColor(colorName)
      }}
    >
      {title}
      {isSelected && !title && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}

export default TagComponent
