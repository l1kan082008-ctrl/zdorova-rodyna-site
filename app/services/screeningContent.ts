import { screeningStreetAddress } from "@/lib/screening40";

const siteUrl = "https://zdorovarodynaplus.com.ua";

export const screeningUrl = `${siteUrl}/services/screening-40`;
export const screeningSeoTitle = "Скринінг здоров’я 40+ у Рівному — Здорова Родина";
export const screeningSeoDescription =
  `Скринінг здоров’я 40+ у Рівному — «Здорова Родина», ${screeningStreetAddress}. Огляд лікаря й аналізи. Заявка онлайн або телефоном.`;
export const screeningSeoImage = {
  url: `${siteUrl}/promo/screening-40.webp`,
  width: 1536,
  height: 1024,
  type: "image/webp",
  alt: "Скринінг здоров’я 40+ у медичному центрі «Здорова Родина»",
} as const;

export function screeningStructuredData(phone: string) {
  const serviceId = `${screeningUrl}#service`;
  const clinicId = `${siteUrl}/#medical-clinic`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${screeningUrl}#webpage`,
        url: screeningUrl,
        name: screeningSeoTitle,
        description: screeningSeoDescription,
        inLanguage: "uk-UA",
        mainEntity: { "@id": serviceId },
        about: { "@id": serviceId },
        publisher: { "@id": clinicId },
        primaryImageOfPage: { "@id": `${screeningUrl}#primaryimage` },
        breadcrumb: { "@id": `${screeningUrl}#breadcrumbs` },
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: "Скринінг здоров’я 40+ у Рівному",
        serviceType: "Скринінг здоров’я 40+",
        url: screeningUrl,
        description: screeningSeoDescription,
        provider: { "@id": clinicId },
        areaServed: { "@type": "City", name: "Рівне" },
      },
      {
        "@type": "MedicalClinic",
        "@id": clinicId,
        name: "Медичний центр «Здорова Родина»",
        url: `${siteUrl}/`,
        telephone: phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: screeningStreetAddress,
          addressLocality: "Рівне",
          addressCountry: "UA",
        },
      },
      {
        "@type": "ImageObject",
        "@id": `${screeningUrl}#primaryimage`,
        url: screeningSeoImage.url,
        contentUrl: screeningSeoImage.url,
        width: screeningSeoImage.width,
        height: screeningSeoImage.height,
        encodingFormat: screeningSeoImage.type,
        caption: screeningSeoImage.alt,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${screeningUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Послуги", item: `${siteUrl}/services` },
          { "@type": "ListItem", position: 2, name: "Скринінг здоров’я 40+", item: screeningUrl },
        ],
      },
    ],
  };
}
