<?php
require_once 'cpu.php';

class CpuUsagePerCore extends Cpu {

	public $total_usage;
	
	public function __construct() {
		echo json_encode(array(
			'data' => $this->getUsage(),
			'total' => $this->total_usage
		));
	}

	public function getUsage() {
		$cmd = 'top -Pqd2 c | grep CPU | cut -d : -f2';
		$result = explode("\n", Shell::exec($cmd));
		$results = array();
		for ($i = 0; $i < count($result); $i++) {
			$line = explode(',', $result[$i]);
			$tmp = str_replace('% idle', '', end($line));
			$results['CPU ' . $i] = round(100 - floatval(trim($tmp)), 2);
		}
		$this->total_usage = round(array_sum(array_values($results)), 2);
		return $results;
	}

}

$cpu_usage_per_core = new CpuUsagePerCore();

?>