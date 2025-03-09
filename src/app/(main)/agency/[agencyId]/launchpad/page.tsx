import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'

type Props = {}

function LaunchPad(props: Props) {

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className="w-full h-full max-w-[800px]">
        <Card>
          <CardHeader>
            <CardTitle>Lets get started</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image src='/appstore.png' alt='app store logo' width={80} height={80} className='rounded-md object-contain' />
                <p>
                  Save the website as a shortcut on your mobile device
                </p>
              </div>
              <Button>Start</Button>
            </div>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image src='/appstore.png' alt='app store logo' width={80} height={80} className='rounded-md object-contain' />
                <p>
                  Save the website as a shortcut on your mobile device
                </p>
              </div>
              <Button>Start</Button>
            </div>
            <div className='flex justify-between items-center w-full border p-4 rounded-lg gap-2'>
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image src='/appstore.png' alt='app store logo' width={80} height={80} className='rounded-md object-contain' />
                <p>
                  Save the website as a shortcut on your mobile device
                </p>
              </div>
              <Button>Start</Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LaunchPad
