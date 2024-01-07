const koa = require('koa');
const koajson = require('koa-json');
const koabodyparser = require('koa-bodyparser');
const defaultRouter = require('./router/default.js');
const api = new koa();

const API_PORT = 8065;

api.use(async (ctx, next) => {
    /**
     * Log response times of api calls
     */
    const startTime = Date.now();
    await next();
    const responseTime = Date.now() - startTime;
    ctx.set('X-Response-Time', responseTime);
    console.log(`Type: ${ctx.method} Status: ${ctx.status} Path: ${ctx.url} Response Time: ${responseTime}ms`);
});

api.use(async (ctx, next) => {
    /**
     * Log mySQL errors
     */
    try {
        await next();
    } catch (err) {
        console.log(`Path: ${ctx.url} Status: ${ctx.status} Error: ${err.sqlMessage ?? 'Unknown error!'}`)
    }
});

api.use(koajson());
api.use(koabodyparser());

defaultRouter(api);

api.listen(API_PORT);
