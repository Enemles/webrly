'use client';
import { useModal } from '@/providers/modal-provider';
import React from 'react'
import { Button } from '../ui/button';
import CustomModal from '../global/CustomModal';
import UploadMediaForm from '../forms/upload-media';
import { Upload } from 'lucide-react';

type Props = {
  subaccountId: string
}
const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal()
  return (
    <Button
      onClick={
        () => setOpen(
          <CustomModal title='Upload Media' subHeading='Upload a file to your media list' >
            <UploadMediaForm subaccountId={subaccountId} />
          </CustomModal>
        )}>
      <div className="flex gap-2">
        Upload
        <Upload />
      </div>
    </Button>)
}

export default MediaUploadButton
