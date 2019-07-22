<?php
require_once 'ups.php';

class Usage extends Ups {

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getStatus()
		));
	}

  public function getStatus() {
    $cmd = 'upsc UPS@localhost | egrep \'input.voltage:|battery.voltage:\' | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = explode(PHP_EOL, $result);
    $results = array(
      'battery_voltage' => array(
        'actual' => $result[0],
        'formatted' => round(log($result[0], 2), 3)
      ),
      'input_voltage' => array(
        'actual' => $result[1],
        'formatted' => round(log($result[1], 2), 3)
      )
    );
    return $results;
  }

}

$ups_usage = new Usage();

?>