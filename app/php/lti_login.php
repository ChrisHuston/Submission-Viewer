<?php
session_start();
class UserInfo {
    var $login_error = "NONE";
    var $assignments = [];
    var $students = [];
    var $sections = [];
    var $course_id;
    var $priv_level = 1;
}
$res = new UserInfo();

$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['course_id'])) {
    include("advanced_user_oo.php");
    Define('DATABASE_SERVER', $hostname);
    Define('DATABASE_USERNAME', $username);
    Define('DATABASE_PASSWORD', $password);
    Define('DATABASE_NAME', 'submission_viewer');

    $mysqli = new mysqli(DATABASE_SERVER, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME);

    $priv_level = $_SESSION['priv_level'];
    $res->priv_level = $priv_level;

    $course_id = $_SESSION['course_id'];
    $res->course_id = $course_id;

    $query = "SELECT user_name, section_id, user_id FROM
        course_users
        WHERE course_id='$course_id'; ";

    if ($priv_level == 1) {
        $query .= "SELECT assignment_id, assignment_name, public, is_group FROM
        assignments
        WHERE course_id='$course_id' AND public='1'
        ORDER BY assignment_name; ";
    } else {
        $query .= "SELECT assignment_id, assignment_name, public, is_group FROM
        assignments
        WHERE course_id='$course_id'
        ORDER BY assignment_name; ";
    }

    $query .= "SELECT s.section_id, s.section_num, s.canvas_course_id
                FROM course_sections s
                WHERE s.canvas_course_id='$course_id'
                ORDER BY s.section_num; ";

    $result = $mysqli->multi_query($query);

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $res->students = $json;
    }


    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $res->assignments = $json;
    }

    if ($mysqli->more_results()) {
        $mysqli->next_result();
        $result = $mysqli->store_result();
        $json = array();
        while ($row = $result->fetch_assoc()) {
            $json[] = $row;
        }
        $res->sections = $json;
    }


    echo json_encode($res);
} else {
    $res->login_error = "Authentication error.";
    echo json_encode($res);
}

?>