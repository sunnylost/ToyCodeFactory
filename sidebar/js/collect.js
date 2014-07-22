/**
 * @author: sunnylost | sunnylost@gmail.com
 * @date: 2014/7/22
 * @name: collect
 * @description:
 *      回到顶部
 */
!function(global) {
    global.Sidebar.loadPlugin({
        id: 'collect',

        isNeedMainArea: true,

        init: function() {
            this.hintContent = '我的收藏';
        },

        events: {
            'click': function() {
            }
        }
    })
}(window);