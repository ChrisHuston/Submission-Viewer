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

    $members = $_POST['members'];
    $ids = $_POST['ids'];
    $course_id = $_SESSION['course_id'];

    $query = "INSERT INTO course_users (course_id, user_name, section_id, user_id) VALUES ".$members." ON DUPLICATE KEY UPDATE section_id=VALUES(section_id); ";
    $query .= "DELETE FROM course_users WHERE course_id='$course_id' AND net_id NOT IN ".$ids."; ";
    $result = $mysqli->multi_query($query);

    $mysqli->close();
    echo json_encode($result);
}

?>