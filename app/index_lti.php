<?php
session_start();
require_once 'ims-blti/blti.php';
$context = new BLTI("YourSecret", false, false);

if ( $context->valid ) {
    $_SESSION['course_id'] = $_POST['custom_canvas_course_id'];
    $_SESSION['canvas_course_id'] = $_POST['custom_canvas_course_id'];
    $_SESSION['net_id'] = strtolower($_POST['custom_canvas_user_login_id']);
    $_SESSION['family_name'] = $_POST['lis_person_name_family'];
    $_SESSION['given_name'] = $_POST['lis_person_name_given'];
    $_SESSION['full_name'] = $_POST['lis_person_name_full'];
    $_SESSION['canvas_user_id'] = $_POST['custom_canvas_user_id'];
    $_SESSION['is_lti'] = true;
    $roles = $_POST['roles'];
    if (strpos($roles, 'Administrator') !== false || strpos($roles, 'Instructor') !== false || strpos($roles, 'Designer') !== false) {
        $_SESSION['priv_level'] = 3;
    } else if (strpos($roles, 'TeachingAssistant') !== false) {
        $_SESSION['priv_level'] = 2;
    } else {
        $_SESSION['priv_level'] = 1;
    }
}
?>

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Submission Viewer</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
      <link rel="styleSheet" href="../bower_components/angular-ui-grid/ui-grid.min.css"/>
    <link rel="stylesheet" href="styles/main.css">
  </head>
  <body ng-app="submissionViewerApp">

    <!-- Add your site or application content here -->
    <div class="container">
      <div ng-include="'views/main.html'" ng-controller="MainCtrl"></div>
    </div>

    <script src="../bower_components/angular/angular.min.js"></script>
    <script src="../bower_components/angular-touch/angular-touch.min.js"></script>
    <script src="../bower_components/lodash/dist/lodash.min.js"></script>
    <script src="../bower_components/angular-ui-grid/ui-grid.min.js"></script>
    <script src="scripts/app.js"></script>
    <script src="scripts/controllers/main.js"></script>
    <script src="scripts/services/user.js"></script>
</body>
</html>
