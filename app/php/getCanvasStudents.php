<?php
session_start();
class DbInfo {
    var $students = [];
}
$res = new DbInfo();

$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_SESSION['course_id'])) {

    function parse_headers( $header )
    {
        $retVal = array();
        $fields = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $header));
        foreach( $fields as $field ) {
            if( preg_match('/([^:]+): (.+)/m', $field, $match) ) {
                $match[1] = preg_replace('/(?<=^|[\x09\x20\x2D])./e', 'strtoupper("\0")', strtolower(trim($match[1])));
                if( isset($retVal[$match[1]]) ) {
                    $retVal[$match[1]] = array($retVal[$match[1]], $match[2]);
                } else {
                    $retVal[$match[1]] = trim($match[2]);
                }
            }
        }
        return $retVal;
    }
    function get_api_data($url, $ch){
        $token = "1064~PANNjKSDEQ1mvsZFTnyraP1cLuCs24qZpBuRQKQWPFLxbRWTz3B3EvMPj8QL9x6z";
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_VERBOSE, 1); //Requires to load headers
        curl_setopt($ch, CURLOPT_HEADER, 1);  //Requires to load headers
        $headers = array('Authorization: Bearer ' . $token);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        //curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, false);
        //curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_CERTINFO, TRUE);
        $result = curl_exec($ch);

        if ($result === false) {
            return 'Curl error: ' . curl_error($ch);
        }

        #Parse header information from body response
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $canvas_header = substr($result, 0, $header_size);
        $body = substr($result, $header_size);
        $data = json_decode($body);

        #Parse Link Information
        $header_info = parse_headers($canvas_header);


        if(isset($header_info['Link'])){
            $links = explode(',', $header_info['Link']);
            foreach ($links as $value) {
                if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
                    $links[$match[2]] = $match[1];
                }
            }
        }

        #Check for Pagination
        if(isset($links['next'])){
            $next_data = get_api_data($links['next'], $ch);
            $data = array_merge($data,$next_data);
            return $data;
        }else{
            return $data;
        }
    }

    $ch = curl_init();
    $course_id = $_SESSION['course_id'];
    $url = "https://canvas.dartmouth.edu/api/v1/courses/".$course_id."/enrollments?type[]=StudentEnrollment&per_page=100";
    $res->students = get_api_data($url, $ch);

    echo json_encode($res);
} else {
    echo json_encode(false);
}

?>