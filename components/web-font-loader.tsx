"use client"

import Script from "next/script"

export function WebFontLoader() {
  return (
    <Script
      src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
      strategy="afterInteractive"
      onLoad={() => {
        // @ts-ignore
        WebFont.load({
          google: {
            families: ['Plus Jakarta Sans:400,500,600,700']
          }
        });
      }}
    />
  )
} 