<?php
require_once '../functions.php';

class Ups {

	public function __construct() {

	}

  public function getUpsInfo() {
    $cmd = 'upsc UPS@localhost | egrep \'device.mfr:|device.model:\' | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = preg_replace("/\s+/", ' ', $result);
    // $results = array(
    //   'mfr' => $result[0],
    //   'model' => $result[1]
    // );
    return $result;
	}
	
	public function getStatus() {
		$cmd = 'upsc UPS@localhost | grep ups.status | cut -d : -f2';
		return Shell::exec($cmd);
	}

}

?>