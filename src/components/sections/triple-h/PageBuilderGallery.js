"use client";

import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { mediaUrl } from "@/lib/page-builder";

export default function PageBuilderGallery({ autoplay = true, images = [], title = "Image gallery" }) {
  const slides = images.filter((image) => mediaUrl(image));
  if (!slides.length) return null;

  return (
    <Swiper
      aria-label={title}
      autoplay={autoplay && slides.length > 1 ? { delay: 4200, disableOnInteraction: false } : false}
      className="builder-gallery__swiper"
      grabCursor={slides.length > 1}
      loop={slides.length > 1}
      modules={[Autoplay, Navigation, Pagination]}
      navigation={slides.length > 1}
      pagination={slides.length > 1 ? { clickable: true } : false}
      slidesPerView={1}
      spaceBetween={18}
    >
      {slides.map((image, index) => (
        <SwiperSlide key={`${mediaUrl(image)}-${index}`}>
          <figure>
            <Image
              alt={image?.alt || `${title} — image ${index + 1}`}
              fill
              quality={75}
              sizes="(max-width: 900px) 100vw, 1200px"
              src={mediaUrl(image)}
            />
            {image?.caption ? <figcaption>{image.caption}</figcaption> : null}
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
