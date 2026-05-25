import { Helmet } from "react-helmet-async";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type PageMetaProps = {
  title: string;
  description: string;
  path?: string;
};

const PageMeta = ({ title, description, path = "" }: PageMetaProps) => {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE_URL}/og-image.webp`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.webp`} />
    </Helmet>
  );
};

export default PageMeta;
