<?php
require_once 'cpu.php';

class CpuTemperature extends Cpu {

	private $average_temperature;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getTemperature(),
			'tjmax' => $this->getTj_max(),
			'avg' => $this->average_temperature
		));
	}

  private function getTemperature() {
		$result = array();
    for($i = 0; $i < $this->getCores(); $i++) {
			$cmd = 'sysctl -n dev.cpu.' . $i . '.temperature';
			$temp = floatval(explode('C', Shell::exec($cmd))[0]);
			$result['CPU ' . $i] = $temp;
		}
		$this->average_temperature = round(array_sum(array_values($result)) / count($result), 2);
    return $result;
  }

  private function getTj_max() {
    $cmd = 'sysctl -n dev.cpu.0.coretemp.tjmax';
    return floatval(explode('C', Shell::exec($cmd))[0]);
  }

}

$cpu_temperature = new CpuTemperature();

?>