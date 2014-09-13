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
