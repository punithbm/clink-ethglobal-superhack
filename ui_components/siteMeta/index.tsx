import Head from "next/head";
import { FC } from "react";

export interface IMetaHead {
  title?: string;
  description?: string;
  imageUrl?: string;
  urlEndpoint?: string;
}
const MetaHead: FC<IMetaHead> = (props) => {
  const { title, description, imageUrl, urlEndpoint } = props;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title}></meta>

        <meta name="description" content={description}></meta>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:url" content={`https://clink-safe.vercel.app/${urlEndpoint}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="clink-safe.vercel.app" />
        <meta property="twitter:url" content={`https://clink-safe.vercel.app/${urlEndpoint}`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Head>
    </>
  );
};

export default MetaHead;
