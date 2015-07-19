'use strict';

/**
 * @ngdoc function
 * @name submissionViewerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the submissionViewerApp
 */
angular.module('submissionViewerApp')
  .controller('MainCtrl', function ($scope, UserService, $http, $filter, uiGridConstants) {
        $scope.user = UserService.user;

        $scope.getSubmissions = function() {
            var db_call = UserService.getSubmissions($scope.user.selectedAssignment.assignment_id);
            db_call.success(function(data) {
                var submissions = data.submissions;
                if ($scope.user.selectedAssignment.is_group === '1') {
                    submissions = _.uniq(submissions, false, function(s) {
                        if (s.attachments) {
                            return s.attachments[0].display_name + s.attachments[0].updated_at;
                        } else {
                            return false;
                        }
                    });
                }
                var canvas_submissions = [];
                angular.forEach(submissions, function(a) {
                    var student = _.find($scope.user.students, {user_id: a.user_id.toString()});
                    var section_num = 0;
                    if (!student) {
                        student = {user_name:"Unknown"};
                    } else {
                        var section = _.find($scope.user.sections, {section_id:student.section_id});
                        if (section) {
                            section_num = section.section_num;
                        }
                    }
                    if (a.attachments) {
                        var submitted_at = $filter('date')(new Date(a.submitted_at), 'MM/dd/yy hh:mm a');
                        var file_name = a.attachments[0].display_name;
                        var download_url = a.attachments[0].url;
                        canvas_submissions.push({user_name:student.user_name, section_num:section_num, submitted_at: submitted_at, user_id: a.user_id, preview_url: a.preview_url, download_url: download_url, file_name: file_name});
                    }
                });
                $scope.gridOptions.data = canvas_submissions;

            })
        };

        $scope.getCanvasAssignments = function() {
            UserService.getCanvasAssignments();
        };

        $scope.getStudents = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var params = {};
            $http({method: 'POST',
                url: UserService.appDir + 'php/getCanvasStudents.php' + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var students = data.students;
                    var members = "";
                    var ids = "(";
                    var user_index = 1;
                    angular.forEach(students, function(s) {
                        s.section_id = s.course_section_id;
                        s.user_name = s.user.sortable_name;
                        s.user_id = s.user_id;

                        var member = "(" + $scope.user.course_id +  ",\"" + s.user_name + "\"," + s.section_id + "," + s.user_id + ")";
                        ids += "'" + s.user_id + "'";

                        if (students.length !== user_index) {
                            member += ", ";
                            ids += ", ";
                        }
                        members += member;
                        user_index += 1;
                    });
                    ids += ")";
                    addStudents(members, ids);
                    $scope.user.students = students;
                    //$scope.userGridOptions.data = _.union($scope.userGridOptions.data, course_users);
                }).
                error(function(data, status) {
                    alert("Error: " + status + " Get students failed. Check your internet connection");
                });
        };

        var addStudents = function(members, ids) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "addStudents.php";
            var params = {};
            params.members = members;
            params.ids = ids;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function() {
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Add students failed. Check your internet connection");
                });
        };

        $scope.togglePublic = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "togglePublic.php";
            var params = {};
            params.public = $scope.user.selectedAssignment.public;
            params.assignment_id = $scope.user.selectedAssignment.assignment_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (!data) {
                        alert("Toggle public failed. Check your internet connection");
                    }
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Toggle public failed. Check your internet connection");
                });
        };

        $scope.toggleIsGroup = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "toggleIsGroup.php";
            var params = {};
            params.is_group = $scope.user.selectedAssignment.is_group;
            params.assignment_id = $scope.user.selectedAssignment.assignment_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (!data) {
                        alert("Toggle group failed. Check your internet connection");
                    } else {
                        if ($scope.user.selectedAssignment) {
                            $scope.getSubmissions();
                        }
                    }
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Toggle group failed. Check your internet connection");
                });
        };

        var addSections = function(inserts) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "addSections.php";
            var params = {};
            params.inserts = inserts;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    console.log(data);
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Add sections failed. Check your internet connection");
                });
        };

        $scope.getSections = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "getSections.php";
            var params = {};
            params.canvas_course_id = $scope.user.course_id;
            $http({method: 'POST',
                url: UserService.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var sections = JSON.parse(data.sections);
                    sections = _.sortBy(sections, function(s) {return s.id;});
                    var section_num = 1;
                    if ($scope.user.sections.length>0) {
                        section_num = parseInt($scope.user.sections[$scope.user.sections.length-1].section_num) + 1;
                    }
                    var inserts = "";
                    angular.forEach(sections, function(s) {
                        var has_section = _.find($scope.user.sections, function(sect) {
                            return parseInt(sect.section_id) === s.id;
                        });
                        if (has_section === undefined) {
                            var dash_split = s.name.split("-");
                            if (dash_split.length > 1) {
                                section_num = parseInt(dash_split[dash_split.length-1]);
                            } else {
                                section_num += 1;
                            }
                            s.section_num = section_num;
                            s.section_name = 'Section ' + s.section_num;
                            s.canvas_course_id = $scope.user.course_id;
                            s.section_id = s.id;
                            var values = "(" + $scope.user.course_id + "," + s.section_num + "," + s.section_id + "), ";
                            inserts += values;
                            $scope.user.sections.push(s);
                        }
                    });
                    if (inserts !== "") {
                        inserts = inserts.slice(0,-2);
                        addSections(inserts);
                    }
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Get sections failed. Check your internet connection");
                });
        };

        var num_filters = [
            {
                condition: uiGridConstants.filter.GREATER_THAN,
                placeholder: ' >'
            },
            {
                condition: uiGridConstants.filter.LESS_THAN,
                placeholder: ' <'
            }
        ];

        var data = [];

        $scope.gridOptions = {
            showGridFooter: true,
            showColumnFooter: false,
            enableFiltering: true,
            enableSorting: true,
            rowHeight: 40,
            columnDefs: [
                { field: 'user_name', displayName:"Student Name"},
                { field: 'section_num', displayName: "Sect", width:70, type:"number", filters:num_filters},
                { field: 'file_name', displayName:"File Name"},
                { field: 'submitted_at', width:140, displayName:"Submitted"},
                { field: 'preview_url', enableSorting: false, width:90, displayName:"Preview", enableFiltering: false, cellTemplate:'<div class="ui-grid-cell-contents"><a class="btn btn-default btn-sm" ng-href="{{COL_FIELD CUSTOM_FILTERS}}" target="_blank">Preview</a></div>'},
                { field: 'download_url', enableSorting: false, width:110, displayName:"Download", enableFiltering: false, cellTemplate:'<div class="ui-grid-cell-contents"><a class="btn btn-default btn-sm" ng-href="{{COL_FIELD CUSTOM_FILTERS}}">Download</a></div>'}
            ],
            data: data,
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        UserService.login($scope.gridOptions);
  });
