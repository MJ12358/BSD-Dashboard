<?php
require_once 'network.php';

class NetworkTemperature extends Network {

	private $average_temperature;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getTemperature(),
			'avg' => $this->average_temperature
		));
	}

  private function getTemperature() {
		$result = array();
		foreach ($this->getInterfaceNames() as $key => $value) {
			$nic = preg_split("/$key/", $value)[0];
			$cmd = "sysctl -n dev.$nic.$key.phy.temp";
			$result[$value] = Shell::exec($cmd);
		}
		$this->average_temperature = round(array_sum(array_values($result)) / count($result), 2);
		return $result;
  }

}

$network_temperature = new NetworkTemperature();

?>