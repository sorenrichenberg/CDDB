const cdController = require('../controller/cdCtrl');
const cdRouter = require('koa-router')({
    prefix: '/cd'
});

cdRouter.get('/', cdController.getCDs);
cdRouter.get('/:ID', cdController.getCDById);
cdRouter.put('/', cdController.updateCD);
cdRouter.post('/', cdController.insertCD);
cdRouter.delete('/:ID', cdController.deleteCDById);

module.exports = cdRouter;
