'use client'

import React, { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pipeline } from '@prisma/client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '../ui/input'
import { FormCard } from '../common/FormCard'
import { useModalForm } from '@/hooks/use-modal-form'
import { CreatePipelineFormSchema } from '@/lib/types'
import { upsertPipeline } from '@/lib/services/pipeline'
import { saveActivityLogsNotification } from '@/lib/services/notification'

interface CreatePipelineFormProps {
  defaultData?: Pipeline
  subAccountId: string
}

const CreatePipelineForm: React.FC<CreatePipelineFormProps> = ({
  defaultData,
  subAccountId,
}) => {
  const { handleModalSubmit, isSubmitting } = useModalForm()
  
  const form = useForm<z.infer<typeof CreatePipelineFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreatePipelineFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
      })
    }
  }, [defaultData, form])

  const onSubmit = async (values: z.infer<typeof CreatePipelineFormSchema>) => {
    if (!subAccountId) return

    await handleModalSubmit(
      async (data) => {
        const response = await upsertPipeline({
          ...data,
          id: defaultData?.id,
          subAccountId: subAccountId,
        })

        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updates a pipeline | ${response?.name}`,
          subaccountId: subAccountId,
        })

        return response
      },
      values,
      {
        successMessage: 'Pipeline saved successfully',
        errorMessage: 'Failed to save pipeline',
        shouldRefresh: true
      }
    )
  }

  return (
    <FormCard
      title="Pipeline Details"
      description="Configure the pipeline details"
      form={form}
      onSubmit={onSubmit}
      isLoading={isSubmitting}
      submitText="Save"
    >
      <FormField
        disabled={isSubmitting}
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pipeline Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Pipeline Name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormCard>
  )
}

export default CreatePipelineForm
