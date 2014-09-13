(function () {
    // Depend from Angular Rails Templates
    angular.module('randomField', ['templates']).directive('randomField', function () {
        return {
            restrict: 'E',
            templateUrl: 'random-field.html',
            controller: ['$scope', 'cellTypes', function ($scope, cellTypes) {
                this.create = function (field) {
                    if (_.isNumber($scope.width) && _.isNumber($scope.height)) {
                        field.replaceCells(createRandomCells($scope.width, $scope.height, cellTypes));
                    }
                };
            }],
            controllerAs: 'randomField'
        };
    });

    function createRandomCells(width, height, types) {
        var cells = new Cells(width, height),
            cellCreators = {
                stream: new StreamCreator(cells, types),
                blackhole: new BlackholeCreator(cells, types)
            },
            defaultCreator = new DefaultCreator(cells, types);

        // Create specific cell (by name) in specific position
        function createCell(name, pos) {
            return (cellCreators[name] || defaultCreator).make(pos, name);
        }

        ['earth', 'treasure', 'alien', 'blackhole', 'moon', 'stream'].forEach(function (name) {
            createCell(name, cells.randomEmptyPos());
        });

        cells.eachEmptyCell(function (x, y) {
            if (!createCell(_.sample(['alien', 'blackhole', 'stream']), {x: x, y: y})) {
                createCell(_.sample(['alien', 'blackhole']), {x: x, y: y});
            }
        });

        return cells.values();
    }

    var offsets = [
        {x: 0, y: 1, name: 'down'},
        {x: 1, y: 0, name: 'right'},
        {x: 0, y: -1, name: 'up'},
        {x: -1, y: 0, name: 'left'}
    ];

    var Cells = function (width, height) {
        var that = this;

        this.width = width;
        this.height = height;
        this.cellsPositions = [];
        this.cells = _.times(height, function (y) {
            return _.times(width, function (x) {
                that.cellsPositions.push({x: x, y: y});
                return {};
            });
        });
    };

    Cells.prototype.set = function (x, y, cell) {
        _.remove(this.cellsPositions, function (pos) { return pos.x === x && pos.y === y; });
        this.cells[y][x] = cell;
    };

    Cells.prototype.unset = function (x, y) {
        this.cellsPositions.push({x: x, y: y});
        this.cells[y][x] = {};
    };

    Cells.prototype.eachEmptyCell = function (cb) {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                _.isEmpty(this.cells[y][x]) && cb.call(this, x, y);
            }
        }
    };

    Cells.prototype.randomEmptyPos = function () {
        return _.sample(this.cellsPositions);
    };

    Cells.prototype.containsPos = function (x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    };

    Cells.prototype.someNeighbor = function (pos, without, cb) {
        var randomOffsets = _.shuffle(offsets),
            that = this;

        return randomOffsets.some(function (offset) {
            var x = pos.x + offset.x,
                y = pos.y + offset.y;

            if (that.containsPos(x, y) && !(without && x === without.x && y === without.y)) {
                return cb.call(that, x, y, that.cells[y][x]);
            }
        });
    };

    Cells.prototype.values = function () {
        return this.cells;
    };


    var DefaultCreator = function (cells, types) {
        this.cells = cells;
        this.types = types;
    };

    DefaultCreator.prototype.make = function (pos, name) {
        this.cells.set(pos.x, pos.y, this.types.find({name: name}));
        return true;
    };


    var BlackholeCreator = function (cells, types) {
        DefaultCreator.apply(this, arguments);
        this.inc = 0;
    };

    BlackholeCreator.prototype.make = function (pos) {
        var cell = this.types.find({name: 'blackhole'});
        cell.editableParams.num = (++this.inc);
        this.cells.set(pos.x, pos.y, cell);
        return true;
    };


    var StreamCreator = function (cells, types) {
        DefaultCreator.apply(this, arguments);
    };

    StreamCreator.prototype.make = function (start) {
        var incLimit = 0,
            that = this;

        this.forceStream = _.random(1, 5);

        function stream(pos, prev) {
           if (++incLimit > 1000) return false;

            return that.tryFinishStream(pos, prev, start) || that.tryNextCell(pos, prev, stream);
        }

        return stream(start);
    };

    StreamCreator.prototype.tryNextCell = function (pos, prev, streamFn) {
        var that = this;
        return this.cells.someNeighbor(pos, prev, function (x, y, cell) {
            if (_.isEmpty(cell)) {
                var next = {x: x, y: y};
                that.setCell(pos, next);

                if (streamFn(next, pos)) {
                    return true;
                } else {
                    that.cells.unset(pos.x, pos.y);
                }
            }
        });
    };

    StreamCreator.prototype.tryFinishStream = function (pos, prev, start) {
        var that = this;
        return this.cells.someNeighbor(pos, prev, function (x, y) {
            // if it is a start pos and there is a prev pos (it is not the first loop)
            if (prev && x === start.x && y === start.y) {
                that.setCell(pos, start);
                return true;
            }
        });
    };

    StreamCreator.prototype.setCell = function (pos, next) {
        var x = next.x - pos.x,
            y = next.y - pos.y,
            streamType, offsetName;

        offsetName = _.find(offsets, function (offset) {
            return offset.x === x && offset.y === y;
        }).name;

        streamType = this.types.find({name: 'stream', params: {direction: offsetName}});
        streamType.editableParams.power = this.forceStream;

        this.cells.set(pos.x, pos.y, streamType);
    };
})();
