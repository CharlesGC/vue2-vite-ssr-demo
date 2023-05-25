/*
 * @Description: 
 * @version: 
 * @Author: Charles Guo
 * @Date: 2023-05-24 16:45:04
 * @LastEditors: Charles Guo
 * @LastEditTime: 2023-05-25 11:17:09
 */
const express = require('express')
const path = require('path')
const fs = require('fs')
const clc = require('cli-color')
const { fileURLToPath } = require('url')
const { createServer: createViteServer } = require('vite')
const serveStatic = require('serve-static')

const isProd = process.env.NODE_ENV === 'production'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
    const app = express()

    // 以中间件模式创建 Vite 应用，并将 appType 配置为 'custom'
    // 这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    const vite = await createViteServer({
        server: { middlewareMode: 'ssr', appType: 'custom' }
    })

    if (isProd) {
        // 如果是线上环境 就使用打包好的文件
        app.use(serveStatic(path.resolve(__dirname, 'dist/client'), { index: false }))
    } else {
        // 如果是开发环境 就使用vite自己的中间件处理路由
        // 使用 vite 的 Connect 实例作为中间件
        // 如果你使用了自己的 express 路由（express.Router()），你应该使用 router.use
        app.use(vite.middlewares)
    }

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl
        let template
        let render
        // res.set({ 'Content-type': 'text/html' })
        // res.send(fs.readFileSync("index.html"))
        // 服务 index.html - 下面我们来处理这个问题
        try {

            if (isProd) {
                // 线上环境都使用打包后的产物
                template = fs.readFileSync(
                    path.resolve(__dirname, 'dist/client/index.html'),
                    'utf-8'
                )

                render = (await import('./dist/server/entry-server.mjs')).render
            } else {
                // 开发环境则使用本地文件
                template = fs.readFileSync('index.html', 'utf-8')

                template = await vite.transformIndexHtml(url, template)

                render = (await vite.ssrLoadModule('src/entry-server.js')).render
            }

            const appHtml = await render(url)

            const html = template.replace(`<!--ssr-outlet-->`, appHtml)

            res.status(200).set({ 'Content-type': 'text/html' }).end(html)
        } catch (e) {
            vite.ssrFixStacktrace(e)
            next(e)
        }
    })

    app.listen(3000, () => {
        console.log(clc.green.underline('http://localhost:3000/'));
        console.log(clc.green.underline('http://127.0.0.1:3000/'));
    })
}

createServer()