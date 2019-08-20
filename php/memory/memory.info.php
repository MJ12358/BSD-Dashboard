<?php
require_once 'memory.php';

class MemoryInfo extends Memory {

	public function __construct() {
		echo json_encode(array(
			'info' => $this->getInfo(),
			'dimms' => $this->getDimmInfo()
		));
	}

	private function getInfo() {
		$cmd = 'dmidecode -t 16 | grep \'Error Correction Type:\|Maximum Capacity:\|Number Of Devices:\'';
		$output = array_filter(explode("\n", Shell::exec($cmd)));
		$results = array();
		foreach ($output as $key => $value) {
			$tmp = explode(':', $value);
			$results[trim($tmp[0])] = trim($tmp[1]);
		}
		return $results;
	}

	private function getDimmInfo() {
		$cmd = 'dmidecode -t 17 | grep \'Memory Device\|Locator:\|Type:\|Speed:\|Size:\|Manufacturer:\|Data Width:\'';
		$output = array_filter(explode("Memory Device\n", Shell::exec($cmd)));
		$results = array();
		foreach ($output as $key => $value) {
			preg_match('/Locator:\s(\w+)/', $value, $match);
			$results[$match[1]] = array();
			foreach (array_filter(explode(PHP_EOL, $value)) as $k2 => $v2) {
				$tmp = explode(':', $v2);
				$results[$match[1]][trim($tmp[0])] = trim($tmp[1]);
			}
		}
		return $results;
	}

}

$memory_info = new MemoryInfo();

?>