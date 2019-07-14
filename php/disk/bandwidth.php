<?php
require_once 'disk.php';

class Bandwidth extends Disk {

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getBandwidth()
		));
	}

  public function getBandwidth() {
    // diskinfo -tv /dev/ada0 is really cool but takes a long time (benchmark)
    // possibly -I 1 (to get stats within time period)
    // zpool iostat tank 1 2 // this is in continuous interval
    // $cmd = 'iostat -x -n 7';
		$cmd = 'zpool iostat tank 1 2 | tail -1';
		// this returns more than one space between properties
		$result = preg_replace('/\h+/', ' ', Shell::exec($cmd));
		// now turn that into an array
    $result = explode(' ', $result);
    return array(
			'bytes_out' => Convert::to_bytes($result[5]),
			'bytes_in' => Convert::to_bytes($result[6]),
			'formatted_out' => $result[5],
			'formatted_in' => $result[6]
    );
	}

}

?>