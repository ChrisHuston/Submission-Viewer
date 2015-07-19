'use strict';

/**
 * @ngdoc service
 * @name submissionViewerApp.User
 * @description
 * # User
 * Factory in the submissionViewerApp.
 */
angular.module('submissionViewerApp')
  .factory('UserService', function ($http, $filter) {
        var inst = {};
        inst.user = {loginError:null, course_id:null, priv_level:1, assignments:[], submissions:[], students:[], sections:[], selectedAssignment:null, gridOptions:{}};
        inst.appDir = 'https://www.your_server.com/app/submission_viewer/';
        var students = [];

        inst.login = function(gridOptions) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script = 'lti_login.php';
            var params = {};
            $http({method: 'POST',
                url: inst.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    if (data.login_error === "NONE") {
                        inst.user.assignments = data.assignments;
                        inst.user.students = data.students;
                        inst.user.sections = data.sections;
                        inst.user.course_id = data.course_id;
                        inst.user.priv_level = parseInt(data.priv_level);
                        gridOptions.columnDefs[4].visible = inst.user.priv_level>1;
                    } else {
                        inst.user.loginError =  data.login_error;
                    }
                }).
                error(function(data, status) {
                    inst.user.loginError =  "Error: " + status + " Sign-in failed. Check your internet connection";
                    $location.path('/');
                });
        };


        var getAssignments = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "getAssignments.php";
            var params = {};
            $http({method: 'POST',
                url: inst.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    inst.user.assignments = data.assignments;
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Add assignments failed. Check your internet connection");
                });
        };

        var addAssignments = function(assignments, ids) {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script;
            php_script = "addAssignments.php";
            var params = {};
            params.assignments = assignments;
            params.ids = ids;
            $http({method: 'POST',
                url: inst.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    getAssignments();
                }).
                error(function(data, status) {
                    alert( "Error: " + status + " Add assignments failed. Check your internet connection");
                });
        };

        inst.getCanvasAssignments = function() {
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script = 'getCanvasAssignments.php';
            var params = {};
            $http({method: 'POST',
                url: inst.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data) {
                    var assignments = data.assignments;
                    var submission_assignments = [];
                    angular.forEach(assignments, function(a) {
                        if (a.submission_types[0] === "online_upload") {
                            submission_assignments.push({assignment_name: a.name, assignment_id: a.id, public:'0'});
                        }
                    });

                    var assignments = "";
                    var ids = "(";
                    var user_index = 1;
                    angular.forEach(submission_assignments, function(s) {
                        var assignment = "(" + inst.user.course_id +  "," + s.assignment_id + ",\"" + s.assignment_name + "\",0)";
                        ids += "'" + s.assignment_id + "'";

                        if (submission_assignments.length !== user_index) {
                            assignment += ", ";
                            ids += ", ";
                        }
                        assignments += assignment;
                        user_index += 1;
                    });
                    ids += ")";
                    addAssignments(assignments, ids);
                }).
                error(function(data, status) {
                    inst.user.loginError =  "Error: " + status + " Get assignments failed. Check your internet connection";
                });
        };

        inst.getSubmissions = function(assignment_id) {
            inst.user.submissions = [];
            var uniqueSuffix = "?" + new Date().getTime();
            var php_script = 'getSubmissions.php';
            var params = {};
            params.assignment_id = assignment_id;
            var db_call = $http({method: 'POST',
                url: inst.appDir + 'php/' + php_script + uniqueSuffix,
                data: params,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            db_call.error(function(data, status) {
                    inst.user.loginError =  "Error: " + status + " Sign-in failed. Check your internet connection";
                    $location.path('/');
                });
            return db_call;
        };

        return inst;
  });
