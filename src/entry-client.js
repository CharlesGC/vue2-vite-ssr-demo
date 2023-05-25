/*
 * @Description: 
 * @version: 
 * @Author: Charles Guo
 * @Date: 2023-05-24 16:03:22
 * @LastEditors: Charles Guo
 * @LastEditTime: 2023-05-24 18:17:29
 */
import createApp from "./app";
const { app, router } = createApp()

router.onReady(() => {
    app.$mount('#app')
})