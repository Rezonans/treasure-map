(function () {
    // Depend from Angular Rails Templates
    angular.module('randomField', ['templates']).directive('randomField', function () {
        return {
            restrict: 'E',
            templateUrl: 'random-field.html',
            controller: ['$scope', 'cellTypes', function ($scope, cellTypes) {
                $scope.width = 6;
                $scope.height = 6;
                this.create = function (field) {
                    var cells = createRandomCells($scope.width, $scope.height, cellTypes);
                    field.replaceCells(cells);
                };
            }],
            controllerAs: 'randomField'
        };
    });

    function createRandomCells(width, height, types) {
        var cells = setEmptyCells(), incBlackhole = 0;

        function create() {
            createCell('earth');
            createCell('treasure');
            createCell('alien');
            createCell('blackhole');
            createCell('moon');
            createCell('stream');
            fillAllCells();
            return cells;
        }

        function setEmptyCells() {
            return _.times(height, function () {
                return _.times(width, function () {
                    return {};
                });
            });
        }

        // Create specific cell (by name) in specific or random position
        function createCell(name, point) {
            point = point || randomEmptyPos();
            if (name === 'stream') return createStream(point);
            if (name === 'blackhole') return createBlackhole(point);
            return setCell(name, point);
        }

        function createBlackhole(point) {
            return setCell('blackhole', point, function (type) {
                type.editableParams.num = (++incBlackhole);
            });
        }

        function setCell(name, point, call) {
            var type = types.find({name: name});

            if (call) call(type);
            if (point) {
                cells[point.y][point.x] = type;
                return true;
            }
            return false;
        }

        var createStream = function (start) {
            var incStream = 0, forceStream = Math.floor(1 + Math.random() * 4),
                offsets = [
                    {x: 0, y: 1, params: {name: 'stream', params: {direction: 'down'}}},
                    {x: 1, y: 0, params: {name: 'stream', params: {direction: 'right'}}},
                    {x: 0, y: -1, params: {name: 'stream', params: {direction: 'up'}}},
                    {x: -1, y: 0, params: {name: 'stream', params: {direction: 'left'}}}
                ];

            function stream(point, from) {
                var build = false;
                if (++incStream > 1000) return false;

                eachNeighbor(point, from, function (cell) {
                    if (from && cell.x === start.x && cell.y === start.y) {
                        setCellStream(point, start);
                        build = true;
                        return 'break';
                    }
                });
                if (build === true) {
                    return true;
                }

                eachNeighbor(point, from, function (cell) {
                    if (_.isEmpty(cell.data)) {
                        var position = {x: cell.x, y: cell.y};
                        setCellStream(point, position);

                        if (stream(position, point)) {
                            build = true;
                            return 'break';
                        } else {
                            clearCell(point);
                        }
                    }
                });

                return build;
            }

            function eachNeighbor(point, without, call) {
                var randomOffsets = _.shuffle(offsets);

                for (var i = 0; i < randomOffsets.length; i++) {
                    var x = point.x + randomOffsets[i].x, y = point.y + randomOffsets[i].y;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (without && x === without.x && y === without.y) continue;
                        if (call({x: x, y: y, data: cells[y][x]}) === 'break') break;
                    }
                }
            }

            function clearCell(point) {
                cells[point.y][point.x] = {};
            }

            function setCellStream(point, to) {
                var streamType, params, x = (to.x - point.x), y = (to.y - point.y);

                params = _.find(offsets, function (offset) {
                    return (offset.x === x && offset.y === y);
                }).params;

                streamType = types.find(params);
                streamType.editableParams.power = forceStream;
                cells[point.y][point.x] = streamType;
            }

            return stream(start);
        };

        function fillAllCells() {
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if (_.isEmpty(cells[y][x])) {
                        if (!createCell(_.sample(['alien', 'blackhole', 'stream']), {x: x, y: y})) {
                            createCell(_.sample(['alien', 'blackhole']), {x: x, y: y});
                        }
                    }
                }
            }
        }

        // Returns the position {'x': x, 'y': y} of a random empty cell
        function randomEmptyPos() {
            var emptyCells = [];

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if (_.isEmpty(cells[y][x])) emptyCells.push({x: x, y: y});
                }
            }

            if (emptyCells.length > 0) {
                var i = Math.floor(Math.random() * emptyCells.length);
                return emptyCells[i];
            }

            return false;
        }

        return create();
    }
})();
