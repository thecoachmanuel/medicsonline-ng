import "./index.css"
import Providers from "./providers"

export const metadata = {
  title: "MediPulso",
  description: "MediPulso - A comprehensive healthcare platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
