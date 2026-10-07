import "./globals.css";
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
    lang="fa"
    dir="rtl"
    >
      <body>{children}</body>
    </html>
  );
}
