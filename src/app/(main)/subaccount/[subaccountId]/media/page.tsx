import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/services/media";
import React from "react";

type Props = {
  params: {
    subaccountId: string
  }
}

const Page = async ({ params }: Props) => {

  const data = await getMedia(params.subaccountId)
  return <>
    <MediaComponent
      data={data}
      subaccountId={params.subaccountId}>
    </MediaComponent>
  </>

}

export default Page