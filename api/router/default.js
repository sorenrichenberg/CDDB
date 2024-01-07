const cdRouter = require('./cdRtr');
const fileRouter = require('./fileRtr');
const hifiRouter = require('./hifiRtr');

const defaultRouter = require('koa-router')({
    prefix: '/api/v1'
});

defaultRouter.get('/', (ctx) => {
    ctx.body = 'Welcome to your CD Database.'
});

defaultRouter.use(
    cdRouter.routes(),
    fileRouter.routes(),
    hifiRouter.routes()
);

module.exports = api => {
    api.use(defaultRouter.routes());
    api.use(defaultRouter.allowedMethods());
}
