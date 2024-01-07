const hifiController = require('../controller/hifiCtrl');
const hifiRouter = require('koa-router')({
    prefix: '/hifi'
});

hifiRouter.get('/', hifiController.getHifi);
hifiRouter.get('/by_artist/:Artist_Name', hifiController.getHifiByArtist);
hifiRouter.get('/by_track/:Track_Title', hifiController.getHifiByTrack);
hifiRouter.get('/by_cd/:CD_Title', hifiController.getHifiByCD);
hifiRouter.get('/clear_errors', hifiController.clearLossyErrors);
hifiRouter.get('/count_errors', hifiController.countLossyErrors);

module.exports = hifiRouter;
