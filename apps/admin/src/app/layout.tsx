import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-[color:var(--surface)] text-[color:var(--fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
