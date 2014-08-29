(function(){
    angular.module('stateChecker', ['templates']).directive('stateChecker', function() {
        return {
            restrict: 'E',
            templateUrl: 'state-checker.html',
            controller: ['$scope', '$rootScope', '$document', 'fieldCells', function($scope, $rootScope, $document, fieldCells) {
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
            }],
            controllerAs: 'stateChecker'
        };
    });

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

})();
