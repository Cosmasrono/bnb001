"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

type Listing = {
  id: string;
  title: string;
  city: string;
  country: string;
  price: number;
  images: string[];
  bedrooms: number;
  maxGuests: number;
  category: string;
  rating?: number;
  reviewCount?: number;
};

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
];

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const images = listing.images.length > 0 ? listing.images : [PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/listings/${listing.id}`} className="block group">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={images[imgIdx]}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Save button */}
          <button
            onClick={(e) => { e.preventDefault(); setSaved((v) => !v); }}
            className="absolute top-3 right-3 z-10 p-1.5 transition-transform hover:scale-110"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "#FF385C" : "rgba(0,0,0,0.4)"} stroke={saved ? "#FF385C" : "white"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>

          {/* Image nav dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white w-3" : "bg-white/60"}`}
                />
              ))}
            </div>
          )}

          {/* Nav arrows (on hover) */}
          {images.length > 1 && imgIdx > 0 && (
            <button onClick={(e) => { e.preventDefault(); setImgIdx((v) => v - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {images.length > 1 && imgIdx < images.length - 1 && (
            <button onClick={(e) => { e.preventDefault(); setImgIdx((v) => v + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between">
            <p className="font-semibold text-gray-900 text-sm leading-snug pr-2 line-clamp-1">{listing.title}</p>
            {listing.rating ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF385C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm font-medium">{listing.rating.toFixed(1)}</span>
                {listing.reviewCount ? <span className="text-xs text-gray-500">({listing.reviewCount})</span> : null}
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm text-gray-400">New</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{listing.city}, {listing.country}</p>
          <p className="text-sm text-gray-500">{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} · up to {listing.maxGuests} guests</p>
          <p className="text-sm mt-1">
            <span className="font-semibold">KSh {listing.price.toLocaleString()}</span>
            <span className="text-gray-500"> / night</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
