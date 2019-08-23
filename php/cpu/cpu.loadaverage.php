<?php
require_once 'cpu.php';

class CpuLoadAverage extends Cpu {
	
	public function __construct() {
		echo json_encode(array(
			'clock' => $this->getFrequency(),
			'data' => $this->getLoadAverage()
		));
	}

  private function current_load() {
    $cmd = 'top -P ---btIquz';
  }

  private function getFrequency() {
    $cmd = 'sysctl -n dev.cpu.0.freq';
    return Shell::exec($cmd) . ' Mhz';
  }

  private function getLoadAverage() {
    $result = array();
    foreach(sys_getloadavg() as $key => $value) {
      $result[] = round($value, 2);
    }
    return $result;
  }

}

$load_average = new CpuLoadAverage();

?>