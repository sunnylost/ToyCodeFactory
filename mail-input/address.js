function log() {
                console.log(arguments[0]);
            }

             $.fn.getCursorPosition = function() {
                var input = this.get(0);
                if (!input) return; // No (input) element found
                if ('selectionStart' in input) {
                    // Standard-compliant browsers
                    return input.selectionStart;
                } else if (document.selection) {
                    // IE
                    input.focus();
                    var sel = document.selection.createRange();
                    var selLen = document.selection.createRange().text.length;
                    sel.moveStart('character', -input.value.length);
                    return sel.text.length - selLen;
                }
            };

            /*
                1，输入分号、回车、鼠标点击输入区域外，完成输入
                2，双击已输入邮箱，进入编辑状态
                3，左右键控制输入邮箱位置
                4，当输入框无内容时，第一次按删除键，前面的已输入邮箱高亮，再按删除键，邮箱删除。
            */
            (function() {
                var container,
                    wrapper,
                    area,  //当前输入input
                    areaParent,  //input父节点
                    areaIsBlank, //input是否为空
                    perWidth = 16,  //每个字宽度
                    selectClass = 'address-select',
                    addressHTML = '<div class="address" data-address="$0">\
                                    <b>$1<span>$2</span></b>\
                                    <span class="semicolon">;</span>\
                                   </div>',
                    areaHTML = '<div class="address"><input type="text" class="input-area"></div>',
                    rholder = /\$(\d)/g,
                    remail = /^(\w+)(@\w+\.[a-zA-Z]+)$/;

                var init = function() {
                    container = $('#container');
                    wrapper = $('.wrapper');
                    area = $('.address-edit .input-area');
                    areaParent = area.parent();
                    area.data('last-value', '');
                    hasChange = false,
                    isLeft = true,  //光标是否在input最左边
                    isRight = true; //光标是否在input最右边

                    bindEvent();
                };

                var bindEvent = function() {
                    area.on('keyup', function(e) {
                        var code = e.which;
                        //log(code);
                        codeCommand[code] && codeCommand[code](e);
                    })
                    .on('input propertychange', function() {
                        var last = area.data('last-value'),
                            latest = area.val();
                        var isBlank = (!last && !latest) ? true : false;
                        var cursorPosition = area.getCursorPosition();

                        isLeft = cursorPosition == 0;
                        isRight = cursorPosition == latest.length;

                        area.data('last-value', latest);
                        hasChange = true;
                        latest = latest || ' ';
                        areaParent.css('width', latest.length * perWidth);
                        //areaIsBlank = $.trim(this.value) ? false : true;
                    })
                    .on('focus', function() {
                        addressUtil.unselect();
                    })
                    .on('blur', function(e) {
                        var val = area.val();
                        if(addressUtil.isValid(val)) {
                            addressUtil.create(val);
                        }
                    });

                    wrapper.on('click',function(e) {
                        area.focus();
                    }).on('dblclick', '*', function(e) {
                        var target = $(e.currentTarget);
                        if(target.parent().hasClass('address')) {
                            target = target.parent();
                        }
                        if(target.hasClass('address')) {
                            addressUtil.edit(target);
                            e.stopPropagation();
                        }
                    });
                };

                var codeCommand = {
                    8: function(e) {  //删除
                        addressUtil.delete();
                    },

                    46: function(e) {  //Delete键

                    },

                    13: function() {  //回车
                        var val = $.trim(area.val()).split(';').join('');
                        val && addressUtil.create(val);
                    },

                    37: function() {  //左箭头
                        if(isLeft && areaParent.prev()[0]) {
                            addressUtil.forward();
                        } else {
                            isLeft = area.getCursorPosition() == 0;
                        }
                        addressUtil.unselect();
                    },

                    39: function() {  //右箭头
                        if(isRight && areaParent.next()[0]) {
                            addressUtil.back();
                        } else {
                            isRight = area.getCursorPosition() == area.val().length;
                        }
                        addressUtil.unselect();
                    }
                };

                codeCommand[32] = codeCommand[186] = codeCommand[13]; //回车与分号逻辑相同，回车=32，分号=186

                //按键操作
                var addressUtil = {
                    addresses: {},

                    isValid: function(address) {
                        return remail.test(address);
                    },

                    //邮件地址是否已存在
                    isExist: function(address) {
                        return this.addresses[address];
                    },

                    //取消地址的选中状态
                    unselect: function() {
                        var select = wrapper.find('.address-select');
                        if(select.length > 0) {
                            select.removeClass('address-select');
                        }
                    },

                    create: function(content) {
                        if(this.isExist(content)) {
                            log('already exist!');
                            return false;
                        }
                        var o = {};
                        var matches = content.match(remail);
                        if(matches) {
                            var html = addressHTML.replace(rholder, function(a, b) {
                                return matches[b];
                            });
                            var el = $(html);
                            area.val('');
                            el.insertBefore(areaParent);
                            this.addresses[content] = true;
                            this.reset(); //清理工作
                        }
                    },

                    edit: function(target) {
                        var address = target.data('address');
                        area.val(address);
                        areaParent.css('width', address.length * perWidth);
                        target.replaceWith(areaParent);
                        area.focus();
                        delete this.addresses[address];
                    },

                    delete: function() {
                        if(!hasChange) {
                            isLeft = true;
                        }
                        if(isLeft) {
                            var select = wrapper.find('.' + selectClass);
                            if(select[0]) {
                                delete this.addresses[select.data('address')];
                                this.reset();
                                return select.remove();
                            }
                            addressUtil.selectBefore();
                        }
                        hasChange = false;
                    },

                    forward: function() {
                        areaParent.insertBefore(areaParent.prev());
                        area.focus();
                    },

                    back: function() {
                        areaParent.insertAfter(areaParent.next());
                        area.focus();
                    },

                    select: function(el) {
                        el.addClass(selectClass);
                    },

                    selectBefore: function() {
                        this.select(areaParent.prev());
                    },

                    selectAfter: function() {
                        this.select(areaParent.after());
                    },

                    reset: function() {
                        isLeft = true;
                        isRight = true;
                        hasChange = false;
                        areaParent.css('width', 10);
                        area.focus();
                    }
                };

                var emailHint = {
                    suffix: []
                };

                init();
            })();

          /*  <ul node-type="panel">
            <!--userlist start-->
            <li action-type="item" action-data="value=aeff@sina.com">
            <a href="#">aeff@sina.com</a>
            </li>
            <li action-type="item" action-data="value=aeff@163.com"><a href="#">aeff@163.com</a></li><li action-type="item" action-data="value=aeff@qq.com"><a href="#">aeff@qq.com</a></li><li action-type="item" action-data="value=aeff@126.com"><a href="#">aeff@126.com</a></li><li action-type="item" action-data="value=aeff@vip.sina.com"><a href="#">aeff@vip.sina.com</a></li><li action-type="item" action-data="value=aeff@sina.cn"><a href="#">aeff@sina.cn</a></li><li action-type="item" action-data="value=aeff@hotmail.com"><a href="#">aeff@hotmail.com</a></li><li action-type="item" action-data="value=aeff@gmail.com"><a href="#">aeff@gmail.com</a></li><li action-type="item" action-data="value=aeff@sohu.com"><a href="#">aeff@sohu.com</a></li><li action-type="item" action-data="value=aeff@139.com"><a href="#">aeff@139.com</a></li><li action-type="item" action-data="value=aeff@wo.com.cn"><a href="#">aeff@wo.com.cn</a></li><li action-type="item" action-data="value=aeff@189.cn"><a href="#">aeff@189.cn</a></li><li action-type="item" action-data="value=aeff@21cn.com"><a href="#">aeff@21cn.com</a></li><!--userlist end--></ul>*/