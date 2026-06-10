import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/services/media";
import React from "react";

type Props = {
  params: Promise<{
    subaccountId: string
  }>
}

const Page = async (props: Props) => {
  const params = await props.params;

  const data = await getMedia(params.subaccountId)
  return <>
    <MediaComponent
      data={data}
      subaccountId={params.subaccountId}>
    </MediaComponent>
  </>
}

export default Page