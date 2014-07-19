/**
 * @author: sunnylost | sunnylost@gmail.com
 * @date: 2014/7/19
 * @name: top
 * @description:
 *      回到顶部
 */
!function(global) {
    var Sidebar = global.Sidebar;

    var goTop = Sidebar.loadPlugin({
        id: 'go-top',

        init: function() {
            this.hintContent = '返回顶部';
        },

        events: {
            'click': function() {
            }
        }
    })
}(window);