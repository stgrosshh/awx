/*********************************************
 *  Copyright (c) 2014 AnsibleWorks, Inc.
 *
 *  HostEventsViewer.js
 *
 *  View a list of events for a given job and host
 *
 */

'use strict';

angular.module('HostEventsViewerHelper', ['ModalDialog', 'Utilities'])

    .factory('HostEventsViewer', ['$log', '$compile', 'CreateDialog', 'Wait', 'GetBasePath', 'Empty', 'GetEvents',
    function($log, $compile, CreateDialog, Wait, GetBasePath, Empty, GetEvents) {
        return function(params) {
            var parent_scope = params.scope,
                url = params.url,
                host_id = params.id,
                host_name = params.name,
                title = params.title, //optional
                scope = parent_scope.$new(true);

            $log.debug('host_id: ' + host_id + ' host_name: ' + host_name);

            if (scope.removeModalReady) {
                scope.removeModalReady();
            }
            scope.removeModalReady = scope.$on('ModalReady', function() {
                Wait('stop');
                $('#host-events-modal-dialog').dialog('open');
            });

            if (scope.removeJobReady) {
                scope.removeJobReady();
            }
            scope.removeEventReady = scope.$on('EventsReady', function(e, data) {
                //var elem;

                scope.host_events = data.results;
                
                //elem = angular.element(document.getElementById('host-events-modal-dialog'));
                //$compile(elem)(scope);

                CreateDialog({
                    scope: scope,
                    width: 675,
                    height: 600,
                    minWidth: 450,
                    callback: 'ModalReady',
                    id: 'host-events-modal-dialog',
                    // onResizeStop: resizeText,
                    title: ( (title) ? title : 'Event Details' ),
                    onOpen: function() {

                    }
                });
            });

            GetEvents({
                url: url,
                scope: scope
            });

            scope.modalOK = function() {
                $('#host-events-modal-dialog').dialog('close');
                scope.$destroy();
            };
        };
    }])

    .factory('GetEvents', ['Wait', 'Rest', 'ProcessErrors', function(Wait, Rest, ProcessErrors) {
        return function(params) {
            var url = params.url,
                scope = params.scope;
            Wait('start');
            Rest.setUrl(url);
            Rest.get()
                .success(function(data) {
                    scope.$emit('EventsReady', data);
                })
                .error(function(data, status) {
                    ProcessErrors(scope, data, status, null, { hdr: 'Error!',
                        msg: 'Failed to get events ' + url + '. GET returned: ' + status });
                });
        };
    }]);