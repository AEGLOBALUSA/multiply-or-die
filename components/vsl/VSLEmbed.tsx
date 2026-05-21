"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VSLEmbedProps {
  vimeoId?: string;
  wistiaId?: string;
  posterSrc?: string;
  title?: string;
}

export function VSLEmbed({
  vimeoId,
  wistiaId,
  posterSrc = "/images/vsl-poster.jpg",
  title = "Ashley Evans — Why Multiply or Die",
}: VSLEmbedProps) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`
    : wistiaId
      ? `https://fast.wistia.net/embed/iframe/${wistiaId}?autoPlay=true`
      : null;

  return (
    <section
      id="vsl"
      className="py-24 bg-obsidian-800"
      aria-label="Video message from Ashley Evans"
    >
      <div className="mx-auto max-w-display px-6 sm:px-12 lg:px-20">
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-obsidian-700 border border-obsidian-500 group">
          {playing && embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <>
              {/* Poster image facade — only loads iframe on click */}
              <Image
                src={posterSrc}
                alt="Video thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 1120px) 100vw, 1120px"
              />
              <div className="absolute inset-0 bg-obsidian-900/40" />
              <button
                onClick={() => setPlaying(true)}
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-5",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet focus-visible:ring-inset"
                )}
                aria-label={`Play: ${title}`}
              >
                <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shadow-[0_0_60px_rgba(200,166,90,0.4)] group-hover:scale-110 transition-transform duration-200">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-obsidian-900 translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="font-sans text-bone/80 text-sm">{title}</span>
              </button>
            </>
          )}
        </div>

        {/* Transcript link for accessibility */}
        <p className="mt-4 text-center">
          <a
            href="/transcript"
            className="font-sans text-sm text-bone/40 hover:text-bone/70 transition-colors underline underline-offset-2"
          >
            Read transcript
          </a>
        </p>
      </div>
    </section>
  );
}
