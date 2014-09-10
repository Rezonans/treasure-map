var app = angular.module('treasureMap', ['ngAnimate', 'stateChecker', 'randomField']);

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
            cells.push(_.times(this.columnsCount(), function () { return {}; }));
            $rootScope.$emit('fieldCells.update');
        },
        removeRow: function (y) {
            cells.splice(y, 1);
            $rootScope.$emit('fieldCells.update');
        },
        addCol: function () {
            cells.forEach(function (row) { row.push({}); });
            $rootScope.$emit('fieldCells.update');
        },
        removeCol: function (x) {
            cells.forEach(function (row) { row.splice(x, 1); });
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

    this.replaceCells = function(newCells) {
        field.cells.length = 0;
        $.extend(field.cells, newCells);
    };

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
