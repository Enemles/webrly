'use client'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { Lane } from '@prisma/client'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { LaneColors, LaneFormSchema } from '@/lib/types'
import {
  saveActivityLogsNotification,
} from '@/lib/services/notification'
import { toast } from '../ui/use-toast'
import { useModal } from '@/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { getPipelineDetails, upsertLane } from '@/lib/services/pipeline'
import TagComponent from '../global/tag'

interface CreateLaneFormProps {
  defaultData?: Lane
  pipelineId: string
}

const LaneForm: React.FC<CreateLaneFormProps> = ({
  defaultData,
  pipelineId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState<string>(defaultData?.color || 'BLUE')
  
  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      color: defaultData?.color || 'BLUE',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
        color: defaultData.color || 'BLUE',
      })
      setSelectedColor(defaultData.color || 'BLUE')
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!pipelineId) return
    try {
      const response = await upsertLane({
        ...values,
        color: selectedColor,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
      })

      const d = await getPipelineDetails(pipelineId)
      if (!d) return

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a lane | ${response?.name}`,
        subaccountId: d.subAccountId,
      })

      toast({
        title: 'Success',
        description: 'Saved pipeline details',
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not save pipeline details',
      })
    }
    setClose()
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    form.setValue('color', color)
  }

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lane Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {LaneColors.map((colorName) => (
                        <TagComponent
                          key={colorName}
                          selectedColor={handleColorSelect}
                          title=""
                          colorName={colorName}
                          isSelected={selectedColor === colorName}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LaneForm
