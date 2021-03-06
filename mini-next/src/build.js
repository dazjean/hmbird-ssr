import webPack from './webpack/run';
import tools, { getCoreConfig } from './tools';

export const build = async (page = true) => {
    const dev = tools.isDev();
    const config = getCoreConfig();
    await new webPack(page, dev, false).run(); // 客户端代码编译
    config.ssr && (await new webPack(page, dev, true).run()); // 服务端代码编译
};
