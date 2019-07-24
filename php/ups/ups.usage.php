<?php
require_once 'ups.php';

class UpsUsage extends Ups {

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getUsage(),
			'status' => $this->getStatus()
		));
	}

  public function getUsage() {
    $cmd = 'upsc UPS@localhost | egrep \'input.voltage:|battery.voltage:\' | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = explode(PHP_EOL, $result);
    // $results = array(
    //   'battery_voltage' => array(
    //     'actual' => $result[0],
    //     'formatted' => round(log($result[0], 2), 3)
    //   ),
    //   'input_voltage' => array(
    //     'actual' => $result[1],
    //     'formatted' => round(log($result[1], 2), 3)
    //   )
    // );
		// return $results;
		return array(
			'battery_voltage' => $result[0],
			'input_voltage' => $result[1]
		);
  }

}

$ups_usage = new UpsUsage();

?>