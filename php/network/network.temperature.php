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
			$cmd = 'sysctl -n dev.' . $value . 'phy.temp';
			$result[$value] = Shell::exec($cmd);
		}
		$this->average_temperature = round(array_sum(array_values($result)) / count($result), 2);
		return $result;
  }

}

$network_temperature = new NetworkTemperature();

?>