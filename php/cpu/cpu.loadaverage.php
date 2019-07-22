<?php
require_once 'cpu.php';

class LoadAverage extends Cpu {
	
	public function __construct() {
		echo json_encode(array(
			'clock' => $this->frequency(),
			'data' => $this->load_average()
		));
	}

  public function current_load() {
    $cmd = 'top -P ---btIquz';
  }

  public function frequency() {
    $cmd = 'sysctl -n dev.cpu.0.freq';
    return Shell::exec($cmd) . ' Mhz';
  }

  public function load_average() {
    $rs = sys_getloadavg();
    $result = array();
    foreach($rs as $key => $value) {
      $result[] = round($value, 2);
    }
    return $result;
  }

}

$load_average = new LoadAverage();

?>