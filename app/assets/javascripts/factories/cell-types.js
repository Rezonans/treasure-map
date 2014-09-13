app.factory('cellTypes', function () {
    var values = [
        {
            name: 'wall',
            className: ''
        },
        {
            name: 'stream',
            className: 'fa-long-arrow-up',
            params: {
                direction: 'up'
            },
            editableParams: {
                power: 1
            }
        },
        {
            name: 'stream',
            className: 'fa-long-arrow-right',
            params: {
                direction: 'right'
            },
            editableParams: {
                power: 1
            }
        },
        {
            name: 'stream',
            className: 'fa-long-arrow-down',
            params: {
                direction: 'down'
            },
            editableParams: {
                power: 1
            }
        },
        {
            name: 'stream',
            className: 'fa-long-arrow-left',
            params: {
                direction: 'left'
            },
            editableParams: {
                power: 1
            }
        },
        {
            name: 'blackhole',
            className: 'fa-recycle',
            editableParams: {
                num: 1
            }
        },
        {
            name: 'earth',
            className: 'fa-globe'
        },
        {
            name: 'treasure',
            className: 'fa-gift'
        },
        {
            name: 'alien',
            className: 'fa-drupal'
        },
        {
            name: 'moon',
            className: 'fa-moon-o'
        }
    ];

    return {
        values: values,
        find: function (params) {
            return _.clone(_.find(values, function(type) {
                return _.isEqual(_.merge({}, type, params), type);
            }), true);
        }
    };
});
