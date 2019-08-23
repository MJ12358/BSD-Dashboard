<?php
require_once 'disk.php';

class DiskTemperature extends Disk {

	private $average_temperature;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getTemperature(),
			'avg' => $this->average_temperature
		));
	}

  // requires root
  public function getTemperature() {
		$result = array();
    foreach($this->getNames() as $key => $value) {
      $cmd = "smartctl -A /dev/$value | awk '/Temperature_Celsius/{print $0}' | awk '{print $10}'";
			$temp = Shell::exec($cmd);
			if ($temp) {
				$result[$value] = $temp;
			}
		}
		$this->average_temperature = round(array_sum(array_values($result)) / count($result), 2);
    return $result;
  }

}

$disk_temperature = new DiskTemperature();

?>