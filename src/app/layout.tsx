import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BONESMASH: the looksmaxxing simulator",
  description: "Click a 3D face with a hammer to bone smash it into a chiseled jawline. An ironic looksmaxxing parody game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-hidden bg-black">
        {children}
      </body>
    </html>
  );
}
