import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amora Insights - China Innovation Intelligence",
  description: "Deep-dive research and analysis on China's innovation in Future Information, Health, Energy, Space, Materials, and Manufacturing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
