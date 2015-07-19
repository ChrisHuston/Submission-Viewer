<?php
session_start();
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['course_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'submission_viewer');
    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    class UserInfo {
        var $assignments = [];
    }
    $res = new UserInfo();

    $course_id = $_SESSION['course_id'];

    $query = "SELECT assignment_id, assignment_name, public FROM assignments
        WHERE course_id='$course_id'; ";

    $result = $mysqli->query($query);
    $json = array();
    while ($row = $result->fetch_assoc()) {
        $json[] = $row;
    }
    $res->assignments = $json;

    $mysqli->close();
    echo json_encode($res);
}

?>