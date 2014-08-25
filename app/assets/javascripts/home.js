$(function () {
    var pole = new Pole('.pole');

    $('.create-server').click(function () {
        $.post('/fields', {
            field: {
                cells: JSON.stringify(pole.cells.map(function (rows) {
                    return rows.map(function (cell) { return cell.state; });
                }))
            }
        }).done(function () {
            console.log(arguments);
        });
    });
});

var Pole = function (selector) {
    var elem = $(selector),
        addRowElem = elem.find('.pole__add-row'),
        addColElem = elem.find('.pole__add-col'),
        removeButtons = elem.find('.pole__button-remove'),
        removeRowElem = removeButtons.filter('.pole__remove-row'),
        removeColElem = removeButtons.filter('.pole__remove-col'),
        that = this;

    this.elem = elem;
    this.colsNum = 1;
    this.rowsNum = 1;
    this.cells = [[]];

    var tId;
    elem.on('mouseenter', '.pole__cell, .pole__button-remove', function (e) {
        clearTimeout(tId);
        removeRowElem.css({top: $(e.currentTarget).position().top});
        removeColElem.css({left: $(e.currentTarget).position().left});
    }).on('mouseenter', '.pole__cell', function (e) {
        removeRowElem.attr('data-num', $(e.target).parent('tr').prevAll().length);
        removeColElem.attr('data-num', $(e.target).prevAll().length);

        that.rowsNum > 1 && removeRowElem.addClass('pole__button-remove-visible');
        that.colsNum > 1 && removeColElem.addClass('pole__button-remove-visible');
    }).on('mouseenter', '.pole__button-remove', function (e) {
        removeButtons.removeClass('pole__button-remove-visible');
        $(e.currentTarget).addClass('pole__button-remove-visible');
    }).on('mouseleave', '.pole__cell, .pole__button-remove', function () {
        tId = setTimeout(function () {
            removeButtons.removeClass('pole__button-remove-visible');
        }, 300);
    }).on('click', '.pole__cell', function (e) {
        $(e.currentTarget).data('cell', $(e.currentTarget).data('cell') || new Cell($(e.currentTarget), that));
        var cell = $(e.currentTarget).data('cell'),
            j = $(e.currentTarget).prevAll().length,
            i = $(e.currentTarget).parent('tr').prevAll().length;

        that.cells[i] = that.cells[i] || [];
        that.cells[i][j] = cell;

        cell.newState();
    });

    addRowElem.click(this.addRowHandler.bind(this));
    addColElem.click(this.addColHandler.bind(this));

    removeRowElem.click(function () {
        that.rowsNum --;
        $('tr').eq($(this).attr('data-num')).remove();
        removeButtons.removeClass('pole__button-remove-visible');
    });

    removeColElem.click(function () {
        var num = parseInt($(this).attr('data-num')) + 1;
        that.colsNum --;
        $('tr td:nth-child(' + num + ')').remove();
        removeButtons.removeClass('pole__button-remove-visible');
    });
};

Pole.prototype.findCellsByName = function (name) {
    return Array.prototype.concat.apply([], this.cells).filter(function (cell) {
        return cell.state.name === name;
    });
};

Pole.prototype.tplCell = '<td class="pole__cell"></td>';
Pole.prototype.tplRow = '<tr>{{cells}}</tr>';

Pole.prototype.addRowHandler = function () {
    var cells = new Array(this.colsNum + 1).join(this.tplCell);
    this.rowsNum++;
    this.elem.find('tr:last').after(this.tplRow.replace('{{cells}}', cells));
};

Pole.prototype.addColHandler = function () {
    this.colsNum++;
    this.elem.find('tr').append(this.tplCell);
};

var Cell = function (elem, pole) {
    this.stateIndex = 0;

    this.state = {};
    this.elem = elem;
    this.pole = pole;
};

Cell.prototype.states = [
    {
        className: '',
        name: null
    },
    {
        className: 'fa-long-arrow-up',
        name: 'stream',
        params: {
            direction: 'up'
        }
    },
    {
        className: 'fa-long-arrow-right',
        name: 'stream',
        params: {
            direction: 'right'
        }
    },
    {
        className: 'fa-long-arrow-down',
        name: 'stream',
        params: {
            direction: 'down'
        }
    },
    {
        className: 'fa-long-arrow-left',
        name: 'stream',
        params: {
            direction: 'left'
        }
    },
    {
        className: 'fa-recycle',
        name: 'blackhole'
    },
    {
        className: 'fa-globe',
        name: 'earth'
    },
    {
        className: 'fa-gift',
        name: 'treasure'
    },
    {
        className: 'fa-drupal',
        name: 'alien'
    },
    {
        className: 'fa-moon-o',
        name: 'moon'
    }
];

Cell.prototype.nextState = function () {
    this.stateIndex++;
    this.stateIndex >= this.states.length && (this.stateIndex = 0);

    this.state.name = this.states[this.stateIndex].name;
    this.state.params = jQuery.extend({}, this.states[this.stateIndex].params);

    this.stateHandlers(this.state);

    return this.state;
};

Cell.prototype.stateHandlers = function (state) {
    if (state.name === 'blackhole') {
        state.params.num = this.pole.findCellsByName('blackhole').length;
    }

    if (state.name === 'earth') {
        if (this.pole.findCellsByName('earth').length - 1) {
            this.nextState();
        }
    }

    if (state.name === 'treasure') {
        if (this.pole.findCellsByName('treasure').length - 1) {
            this.nextState();
        }
    }

    if (state.name === 'moon') {
        if (this.pole.findCellsByName('moon').length - 1) {
            this.nextState();
        }
    }
};


Cell.prototype.newState = function () {
    this.nextState();
    this.updateState();
};

Cell.prototype.updateState = function () {
    this.elem.find('.fa').remove();
    this.elem.append(this.tplIcon(this.stateIndex));
};

Cell.prototype.tplIcon = function (index) {
    var sub = '';
    if (index === 5) {
        sub = this.state.params.num;
    }
    return '<i class="fa ' + this.states[index].className + '">' +
        '<span class="pole__black-hole-index">' + sub + '</span>' + '</i>';
};
