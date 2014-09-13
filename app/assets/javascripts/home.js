var app = angular.module('treasureMap', ['ngAnimate', 'stateChecker', 'randomField']);

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
        this.showRowRemover = false;
    };

    this.removeCol = function () {
        fieldCells.removeCol(this.removersCoordinates[0]);
        this.showColRemover = false;
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
