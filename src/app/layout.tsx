import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "管理后台",
  description: "基于大模型收录的本地生活智能分发系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Script
          id="toutiao-push"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
              var el = document.createElement("script");
              el.src = "https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?b5ae3e75488180e5f80dda29fc5bbbb9944aaba67070a0c701972d204484cdcb3d72cd14f8a76432df3935ab77ec54f830517b3cb210f7fd334f50ccb772134a";
              el.id = "ttzz";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(el, s);
              })(window)
            `
          }}
        />
      </body>
    </html>
  );
}
