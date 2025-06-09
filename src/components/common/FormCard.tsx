'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import Loading from '@/components/global/loading'

export type FormCardProps = {
  title: string
  description?: string
  form: any // react-hook-form object
  onSubmit: (data: any) => Promise<void> | void
  children: React.ReactNode
  submitText?: string
  isLoading?: boolean
  className?: string
  showSubmitButton?: boolean
  submitButtonClassName?: string
}

export function FormCard({
  title,
  description,
  form,
  onSubmit,
  children,
  submitText = 'Enregistrer',
  isLoading,
  className = 'w-full',
  showSubmitButton = true,
  submitButtonClassName = 'w-20 mt-4'
}: FormCardProps) {
  const isSubmitting = isLoading ?? form.formState.isSubmitting

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {children}
            
            {showSubmitButton && (
              <Button
                className={submitButtonClassName}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? <Loading /> : submitText}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 