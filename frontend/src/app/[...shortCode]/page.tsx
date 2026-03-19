import { redirect } from "next/navigation";

const shortBaseUrl = process.env.NEXT_PUBLIC_SHORT_BASE_URL || "http://localhost:8000/api/drive/r";

type PageProps = {
  params: { shortCode: string[] };
};

export default function ShortLinkRedirectPage({ params }: PageProps) {
  const code = Array.isArray(params.shortCode) ? params.shortCode.join("/") : params.shortCode;
  redirect(`${shortBaseUrl}/${code}`);
}
