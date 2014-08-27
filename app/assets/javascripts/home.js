var app = angular.module('treasureMap', ['ngAnimate']);

app.factory('fieldCells', ['$rootScope', '$http', function ($rootScope, $http) {
    var cells = [[{}]],
        cellsByConditions = function (conditionsFn) {
            return cells.reduce(function (res, row, j) {
                return res.concat(row.reduce(function (rowRes, cell, i) {
                    if (conditionsFn(cell, i, j)) {
                        rowRes.push({cell: cell, coordinates: [i, j]});
                    }
                    return rowRes;
                }, []));
            }, []);
        };


    $rootScope.$on('createServer', function () {
        window.cells = cells;

        $http.post('/fields', {
            field: {
                cells: angular.toJson(cells)
            }
        }).success(function () {
            alert('ok');
        });
    });

    return {
        cells: cells,
        columnsCount: function () { return this.cells[0].length; },
        rowsCount: function () { return this.cells.length; },
        cellByCoordinates: function (coordinates) {
            return cells[coordinates[1]][coordinates[0]]
        },
        cellsByName: function (name) {
            return cellsByConditions(function (cell) {return cell.name == name});
        },
        updateCell: function (coordinates, state) {
            var cell = this.cellByCoordinates(coordinates);
            $.extend(cell, _.cloneDeep(state));
            $rootScope.$emit('fieldCells.update');
        },
        addRow: function () {
            this.cells.push(_.times(this.columnsCount(), function () { return {}; }))
            $rootScope.$emit('fieldCells.update');
        },
        removeRow: function (y) {
            this.cells.splice(y, 1);
            $rootScope.$emit('fieldCells.update');
        },
        addCol: function () {
            this.cells.forEach(function (row) { row.push({}); });
            $rootScope.$emit('fieldCells.update');
        },
        removeCol: function (x) {
            this.cells.forEach(function (row) { row.splice(x, 1); });
            $rootScope.$emit('fieldCells.update');
        }
    };
}]);

app.controller('FieldController', ['$scope', '$timeout', 'fieldCells', function($scope, $timeout, fieldCells) {
    var field = this;

    this.showRowRemover = false;
    this.showColRemover = false;

    this.cells = fieldCells.cells;

    this.addRow = fieldCells.addRow.bind(fieldCells);
    this.addCol = fieldCells.addCol.bind(fieldCells);

    this.moveRemovers = function (e, x, y) {
        var pos = $(e.currentTarget).position();
        this.rowRemoverTop = pos.top;
        this.colRemoverLeft = pos.left;
        this.removersCoordinates = [x, y];
    };

    this.mouseEnterHandler = function () {
        $timeout.cancel(timeoutPromise);
        fieldCells.rowsCount() > 1 && (this.showRowRemover = true);
        fieldCells.columnsCount() > 1 && (this.showColRemover = true);
    };

    var timeoutPromise;

    this.mouseLeaveHandler = function () {
        var that = this;
        timeoutPromise = $timeout(function() {
            that.showRowRemover = false;
            that.showColRemover = false;
        }, 300);
    };

    this.removeRow = function () {
        fieldCells.removeRow(this.removersCoordinates[1]);
    };

    this.removeCol = function () {
        fieldCells.removeCol(this.removersCoordinates[0]);
    };

    this.cellClick = function (e, x, y) {
        var target = $(e.currentTarget),
            pos = target.position();
        e.stopPropagation();
        $scope.$broadcast('field.cell.click', {
            positionLeft: pos.left,
            positionTop: pos.top + target.height(),
            coordinates: [x, y]
        });
    };
}]);

(function () {
    var states = [
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

    app.controller('StateCheckerController', ['$scope', '$rootScope', '$document', 'fieldCells', function($scope, $rootScope, $document, fieldCells) {
        var stateChecker = this;

        this.cells = fieldCells.cells;
        this.visible = false;
        this.availableStates = states;

        this.checkState = function (state) {
            fieldCells.updateCell(stateChecker.coordinates, state);
        };

        $scope.$on('field.cell.click', function (e, data) {
            $.extend(stateChecker, data);
            stateChecker.visible = !stateChecker.visible;
        });

        $document.bind('click', function () {
            $scope.$apply(function () {
                stateChecker.visible = false;
            });
        });

        $rootScope.$on('fieldCells.update', function () {
            stateChecker.availableStates = states.filter(function (state) {
                if (['moon', 'earth', 'treasure'].indexOf(state.name) === -1) {
                    return true;
                } else {
                    return fieldCells.cellsByName(state.name).length === 0;
                }
            });
        });
    }]);
})();

app.controller('CreateServerController', ['$rootScope', function ($rootScope) {
    this.create = function () {
        $rootScope.$emit('createServer');
    };
}]);

app.controller('CurrentFieldsController', ['$http', function ($http) {
    var currentFields = this;
    this.fields = [];
    $http.get('/fields').success(function (data) {
        currentFields.fields = data;
    });

    this.remove = function (id) {
        $http.delete('/fields/' + id).success(function () {
            alert('ok');
        });
    }
}]);
