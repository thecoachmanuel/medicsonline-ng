import "dotenv/config"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const port = Number(process.env.PORT || 3000)

const nextApp = next({ dev })

await nextApp.prepare()

const handle = nextApp.getRequestHandler()

// Create a simple HTTP server for Next.js
import { createServer } from "http"

const server = createServer((req, res) => {
  return handle(req, res)
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
