<?php
require_once 'disk.php';

class Temperature extends Disk {

	public function __construct() {
		// parent::__construct();
		echo json_encode(array(
			'data' => $this->getTemperature()
		));
	}

  // requires root
  public function getTemperature() {
    $result = array();
    foreach($this->getNames() as $key => $value) {
      $cmd = 'smartctl -A /dev/' . $value . ' | awk \'/Temperature_Celsius/{print $0}\' | awk \'{print $10}\'';
			// $result[$value] = Shell::exec($cmd);
			$result[] = Shell::exec($cmd);
    }
    return $result;
  }

}

$disk_temperature = new Temperature();

?>