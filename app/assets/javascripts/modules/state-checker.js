// Depend from Angular Rails Templates
angular.module('stateChecker', ['templates']).directive('stateChecker', function() {
    return {
        restrict: 'E',
        templateUrl: 'state-checker.html',
        controller: ['$scope', '$rootScope', '$document', 'fieldCells', 'cellTypes', function($scope, $rootScope, $document, fieldCells, cellTypes) {
            var stateChecker = this;

            this.cells = fieldCells.cells;
            this.visible = false;
            this.availableStates = cellTypes.values;

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
                stateChecker.availableStates = cellTypes.values.filter(function (state) {
                    if (['moon', 'earth', 'treasure'].indexOf(state.name) === -1) {
                        return true;
                    } else {
                        return fieldCells.cellsByName(state.name).length === 0;
                    }
                });
            });
        }],
        controllerAs: 'stateChecker'
    };
});
