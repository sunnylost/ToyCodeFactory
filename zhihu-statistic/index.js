/*
    相关链接：http://zhuanlan.zhihu.com/sulian/19601168
*/

var style = '\
    .sta-btn {\
        padding: 0 14px;\
        border-radius: 4px;\
        line-height: 42px;\
        margin: 0;\
        cursor: pointer;\
        font-size: 16px;\
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.15) inset,0 1px 1px rgba(0, 0, 0, 0.15);\
        text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\
        color: #FFF;\
        outline: 0;\
        -webkit-box-sizing: border-box;\
        -moz-box-sizing: border-box;\
        box-sizing: border-box;\
        display: inline-block;\
    }\
    .btn-dark-green {\
        background-color: #61C788;\
        background-image: -webkit-gradient(linear,0 0,0 100%,from(#6BC88E),to(#52C77E));\
        background-image: -webkit-linear-gradient(top,#6BC88E,#52C77E);\
        background-image: linear-gradient(top,#6bc88e,#52c77e);\
        background-repeat: repeat-x;\
        border: 1px solid #1CAC52;\
    }\
    .btn-dark-green:hover {\
        box-shadow: 0 0 6px #139142;\
        border: 1px solid #139142;\
    }\
    .btn-grey {\
        border: 1px solid #DDDEDF;\
        background-color: #FBFCFD;\
        color: #9D9E9F;\
        text-shadow: none;\
        box-shadow: none;\
    }\
    .sta-mask {\
        width: 100%;\
        height: 100%;\
        top: 0px;\
        left: 0px;\
        position: fixed;\
        z-index: 998;\
        background-color: rgba(0, 0, 0, 0.4);\
        text-align:center;\
    }\
    .sta-container {\
        position: fixed;\
        top: 10%;\
        left: 30%;\
        width: 40%;\
        height: 500px;\
        z-index: 1000;\
        border-radius: 10px;\
        background: #FBFCFD;\
    }\
    .sta-container i {\
        font-style: normal;\
    }\
    .sta-hide {\
        display: none;\
    }\
    .sta-title {\
        height: 40px;\
        line-height: 40px;\
        font-size: 1.2em;\
        text-align: left;\
        padding: 5px 5px 5px 10px;\
        background-image: -webkit-linear-gradient(top,#086ED5,#055DB5);\
        color: #fff;\
        overflow: hidden;\
    }\
    .sta-close {\
        float: right;\
        font-size: 1.2em;\
        padding-right: 10px;\
    }\
    .sta-close:hover {\
        color: red;\
    }\
    .sta-msg {\
        display: inline-block;\
    }\
    .sta-toolbar {\
        list-style: none;\
        overflow: hidden;\
        margin: 0;\
        padding: 5px;\
    }\
    .sta-toolbar li{\
        float: left;\
        margin-right: 10px;\
    }\
    .sta-toolbar .sta-changeview-btn {\
        cursor: pointer;\
        float: right;\
        height: 40px;\
        line-height: 40px;\
    }\
    .sta-result {\
        height: 370px;\
        padding: 10px;\
        overflow: auto;\
    }\
    .sta-result table {\
        width: 100%;\
        height: 100%;\
        text-align: center;\
        padding-top: 10px;\
        border-collapse: collapse;\
    }\
    .sta-result table tr:hover {\
        background: #414243;\
        color: #FFF;\
    }\
    .sta-result table tr:hover a {\
        color: #81B3D5;\
    }\
    #tempframe {\
        width:1px;\
        height:1px;\
        top:-999px;\
        left:-999px;\
        position:absolute;\
    }\
';
var html = '<div class="sta-mask"></div>\
            <div class="sta-container">\
                <div class="sta-title">\
                    <div class="sta-msg"></div>\
                    <img src="http://static.zhihu.com/static/img/spinner/grey-loading.gif"/>\
                    <i class="sta-btn sta-close" data-action="close" title="close">X</i>\
                </div>\
                <ul class="sta-toolbar">\
                    <li class="sta-btn btn-dark-green" data-action="sortResult" data-type="follower">关注者</li>\
                    <li class="sta-btn btn-dark-green" data-action="sortResult" data-type="ask">提问</li>\
                    <li class="sta-btn btn-dark-green" data-action="sortResult" data-type="answer">回答</li>\
                    <li class="sta-btn btn-dark-green" data-action="sortResult" data-type="agree">赞同</li>\
                    <li class="sta-btn btn-dark-green" data-action="sortResult" data-type="ratio">赞同/回答比</li>\
                    <li class="sta-btn btn-dark-green sta-changeview-btn" data-action="changeView" >改为逗号分隔</span>\
                </ul>\
                <div class="sta-result">\
                </div>\
                <iframe id="tempframe"></iframe>\
            </div>\
        ';

//用逗号分隔用户名
var users = 'guxizhao,zou-dao-kou,xiaodaoren,cai-tong,xu-xiang-nan,unogzx,shenbin,PeterDeng,namiheike,wu-si-yang-32,yskin,jixin'.split(',');
//回答数限制
var answerlimit = 10;
//赞同数限制
var agreelimit = 200;
//赞同回答比数限制
var ratiolimit = 5;
//关注者数限制
var followerlimit = 10;

var body = $(document.body),
    result = {
        length: 0,

        data: {},

        has: function(id) {
            return this.data[id];
        },

        isEmpty: function() {
            return this.length == 0;
        },

        push: function(item) {
            this[this.length++] = item;
            this.data[item.id] = 1;
        }
    },

    rparam = /\$(\d)/g,

    userIndex = 0,
    userLength = users.length,
    curSortBtn,
    showtable = true,

    messages = {
        wait: '共$1个用户，准备扫描第$2个...',
        loading: '正在加载$1的关注者:$2/$3...',
        loaded: '$1的$2个关注者加载完成',
        success: '所有$1名用户的关注者已经全部扫描完成，共找到$2个符合条件的用户',
        comma: '改为逗号分隔',
        table: '改为表格显示',
        quit: '确认退出？'
    },

    strings = {
        container: '.sta-container',
        greyClass: 'btn-grey',
        greenClass: 'btn-dark-green'
    };

var statistic = {
    cache: {},

    viewType: 'table',

    view: {
        templates: {
            table: {
                prefix: '<table border="1" cellpadding="2"><tr><td>编号</td><td>用户名</td><td>关注者</td><td>提问</td><td>回答</td><td>赞同</td><td>赞同/回答比</td></tr>',

                content:  '<tr><td>$0</td><td><a href="/people/$1/" target="_blank">$2</a></td><td>$3</td><td>$4</td><td>$5</td><td>$6</td><td>$7</td></tr>',

                suffix: '</table>',
            },
            comma: {
                prefix: '编号,用户名,关注者,提问,回答,赞同,赞同/回答比<ul>',

                content: '<li><span>$0</span>,<a href="/people/$1/" target="_blank">$2</a>,<span>$3</span>,<span>$4</span>,<span>$5</span>,<span>$6</span>,<span>$7</span></li>',

                suffix: '</ul>'
            }
        },

        compile: function(datas, type) {
            var tmp,
                r = [],
                i = 0,
                len = datas.length,
                view = this.templates[type],
                contentTmpl = view.content,
                item;

            for (; i < len; i++) {
                item = datas[i];
                tmp = [ i + 1, item.id, item.name, item.follower, item.ask, item.answer, item.agree, item.ratio ];
                r.push(contentTmpl.replace(rparam, function(a, b) {
                    return tmp[b];
                }));
            }
            return view.prefix + r.join('') + view.suffix;
        }
    },

    get: function(s) {
        return this.cache[s] || (this.cache[s] = this.el.find(this.ATTR[s]));
    },

    init: function() {
        body.append($('<style>').html(style))
            .append(html);
        this.el = $(strings.container);
        this.initEvent();
        this.loadUser();
    },

    initEvent: function() {
        var that = this;
        $.each(this.EVENT, function(sel, handlers) {
            var el = that.el.find(sel);
            $.each(handlers, function(name, handler) {
                el.on(name, $.proxy(handler, that));
            })
        })
    },

    /*
        切换视图
    */
    changeView: function(btn) {
        if(result.isEmpty()) return;
        this.viewType = this.viewType == 'table' ? 'comma' : 'table';
        btn.html(messages[this.viewType]);
        this.showResult();
    },

    loadUser: function() {
        var that = this,
            user;

        if(users.length && (user = users.shift())) {
            this.showMessage('wait', userLength, ++userIndex)
                .get('iframe').attr('src', '/people/' + user + '/followees').load(function() {
                that.loadMore($(this).contents());
            })
        } else {
            this.success();
        }
    },

    loadMore: function(c, name, total) {
        var btn = c.find('.zu-button-more[aria-role]'),
            num,
            that = this;

        name = name || c.find('.title-section.ellipsis a').html();
        if(btn.length) {
            btn.get(0).click();
            num = c.find('.zh-general-list .zm-profile-card .zm-list-content-medium').length;
            total = total || c.find('.zm-profile-side-following strong').html();
            that.showMessage('loading', name, num, total);
            setTimeout(function() {
                that.loadMore(c, name, total);
            }, 2000)
        } else {
            that.showMessage('loaded', name, total);
            that.showRatio(c);
        }
    },

    showRatio: function(c) {
        var el, link, id, name, details, follower, ask, answer, agree, ratio;
        var cards = c.find('.zh-general-list .zm-list-content-medium'),
            len = cards.length;
        while(len--) {
            el = $(cards[len]);
            link = el.find('.zg-link');
            id = link.attr('href');
            if(result.has(id)) continue;

            name = link.html();
            details = el.find('.details a');
            follower = parseInt(details[0].innerHTML, 10);
            ask = parseInt(details[1].innerHTML, 10);
            answer = parseInt(details[2].innerHTML, 10);
            agree = parseInt(details[3].innerHTML, 10);

            if (answer >= answerlimit && agree >= agreelimit && (ratio = agree / answer) >= ratiolimit && follower > followerlimit) {
                result.push({
                    name : name,
                    id : id,
                    follower : follower,
                    ask : ask,
                    agree : agree,
                    answer : answer,
                    ratio : ratio.toFixed(2)
                })
            }
        }
        this.showResult()
            .loadUser();
    },

    showResult: function () {
        this.get('result').html(this.view.compile(result, this.viewType));
        return this;
    },

    /*
        结果排序
    */
    sortResult: function(el) {
        var type;
        if(result.isEmpty()) return;
        if(curSortBtn) {
            if(curSortBtn[0] == el[0]) return;
            curSortBtn.removeClass(strings.greyClass).addClass(strings.greenClass);
        }
        curSortBtn = el;
        curSortBtn.removeClass(strings.greenClass).addClass(strings.greyClass);
        type = curSortBtn.data('type');
        result = ([]).sort.call(result, function(a, b) {
            return b[type] - a[type];
        });
        this.showResult();
    },

    showMessage: function(state) {
        var msg = messages[state],
            args = ([]).slice.call(arguments);

        msg = msg.replace(rparam, function(m, a) {
            return args[a];
        })

        this.get('message').html(msg);
        return this;
    },

    success: function () {
        this.showMessage('success', userIndex, result.length);
        this.hideIcon();
    },

    close: function() {
        if(confirm(messages.quit)) {
            this.el.hide();
            $('.sta-mask').hide();
        }
    },

    showIcon: function() {
        this.get('icon').show();
    },

    hideIcon: function() {
        this.get('icon').hide();
    }
};

statistic.ATTR = {
    message: '.sta-msg',

    icon: 'img',

    result: '.sta-result',

    viewBtn: '.sta-change-btn',

    iframe: '#tempframe'
};

statistic.EVENT = {
    '.sta-btn': {
        click: function(e) {
            var target = $(e.target);
            this[target.data('action')](target);
        }
    }
};

statistic.init();