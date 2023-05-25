/*
 * @Description: 
 * @version: 
 * @Author: Charles Guo
 * @Date: 2023-05-24 16:03:34
 * @LastEditors: Charles Guo
 * @LastEditTime: 2023-05-25 09:30:35
 */
import createApp from "./app";
import { createRenderer } from "vue-server-renderer";

export async function render(url) {
    const { app, router } = createApp()
    const html = createRenderer().renderToString(app)
    return html
}