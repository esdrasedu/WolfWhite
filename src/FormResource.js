angular.module('WolfWhite.directives').directive('wwResource', ['$parse', function ($parse) {
    return {
        name: 'wwResource',
        require: ['^form','^ngController', '?wwMethod', '?wwSuccess', '?wwError'],
        restrict: 'A',
        link: function (scope, iElement, iAttrs, controller) {
            var iForm = controller[0];
            iForm.$submiting = false;

            iElement.on('submit', function(){
                scope.$apply(function() {

                    var resource = scope[iAttrs.wwResource];
                    
                    if(resource){
                        if( !iAttrs.hasOwnProperty('wwMethod') )
                            iAttrs.wwMethod = (angular.isDefined(resource.id))?"$update":"$create";

                        if( angular.isFunction(resource[iAttrs.wwMethod]) ){
                            
                            iForm.$error = {};
                            iForm.$submiting = true;
                            
                            resource[iAttrs.wwMethod].call(scope[iAttrs.wwResource], [function( retorno ){
                                iForm.$submiting = false;
                                if(iAttrs.hasOwnProperty('wwSubmit')){
                                    var event = {target:resource, method:iAttrs.wwMethod};
                                    var fn = $parse(iAttrs.wwSubmit);
                                    fn(scope, {$event:event});
                                }
                            }, function( response ){
                                if ( response.status == 422 ) {
                                    if( angular.isDefined(response.config.data) ){
                                        iForm.$error = response.data.errors;
                                    }
                                }
                                if ( response.status == 404 )
                                    iForm.$error = {server:"Not found"};
                                
                                if(iAttrs.hasOwnProperty('wwError')){
                                    var event = {target:resource, method:iAttrs.wwMethod, errors:response};
                                    var fn = $parse(iAttrs.wwError);
                                    fn(scope, {$event:event});
                                }
                                iForm.$submiting = false;
                            }]);
                        } else {
                            console.error("Method "+iAttrs.wwMethod+" of resource not found");    
                        }
                    } else {
                       console.error("Respurce "+iAttrs.wwResource+" not found"); 
                    }

                });
            });
        }
    };
}]);