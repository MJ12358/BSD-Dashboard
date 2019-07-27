<?php
require_once 'cpu.php';

class CpuUsagePerCore extends Cpu {
	
	public function __construct() {
		echo json_encode($this->getUsage());
	}

	public function getUsage() {
		$cmd = 'top -Pqd2 c | grep CPU | cut -d : -f2';
		$result = explode("\n", Shell::exec($cmd));
		$results = array();
		for ($i = 0; $i < count($result); $i++) {
			$line = preg_split(',', $value);
			$tmp = str_replace('%', '', prev(end($line)));
			$results['CPU ' . $i] = 100 - floatval($tmp);
		}
		return $results;
	}

}

$cpu_usage_per_core = new CpuUsagePerCore();

?>