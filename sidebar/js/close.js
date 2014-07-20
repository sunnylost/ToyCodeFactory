/**
 * @author: sunnylost | sunnylost@gmail.com
 * @date: 2014/7/19
 * @name: top
 * @description:
 *      回到顶部
 */
!function(global) {
    var Sidebar = global.Sidebar;

    var close = Sidebar.loadPlugin({
        id: 'close',

        isNeedMainArea: false,

        init: function() {
        },

        events: {
            'click': function() {
                Sidebar.events.trigger('sidebar.close');
            }
        }
    })
}(window);