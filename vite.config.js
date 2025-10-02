import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function shareDirRedirect() {
  const make = (publicDir) => (req, res, next) => {
    try {
      const orig = req.url || '/'
      const pathname = orig.split('?')[0]
      if (pathname.startsWith('/share/') && !pathname.endsWith('/')) {
        const target = path.join(publicDir, pathname)
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
          const qs = orig.includes('?') ? orig.slice(orig.indexOf('?')) : ''
          res.statusCode = 301
          res.setHeader('Location', pathname + '/' + qs)
          return res.end()
        }
      }
    } catch {}
    next()
  }
  return {
    name: 'share-dir-redirect',
    configureServer(server) { server.middlewares.use(make(server.config.publicDir)) },
    configurePreviewServer(server) { server.middlewares.use(make(server.config.publicDir)) }
  }
}

const allowed = [
  'localhost',
  '127.0.0.1',
  // 당신의 Koyeb 서비스 도메인: 필요 시 여기에 추가하세요.
  'bold-jenn-kaionos-0733c85c.koyeb.app'
]

export default defineConfig({
  base: '/',
  server: { host: true, port: 5173 },
  preview: { host: true, port: process.env.PORT ? Number(process.env.PORT) : 8000, strictPort: true, allowedHosts: allowed },
  plugins: [shareDirRedirect()],
  build: { outDir: 'dist' }
})
