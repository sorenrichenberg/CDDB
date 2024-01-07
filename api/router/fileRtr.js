const fileController = require('../controller/fileCtrl');
const fileRouter = require('koa-router')({
    prefix: '/file'
});

fileRouter.get('/', fileController.getFiles);
fileRouter.get('/:MD5', fileController.getFileByMD5);
fileRouter.put('/', fileController.updateFile);
fileRouter.post('/', fileController.insertFile);
fileRouter.delete('/:MD5', fileController.deleteFileByMD5);

module.exports = fileRouter;
