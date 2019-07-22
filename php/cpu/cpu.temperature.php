<?php
require_once 'cpu.php';

class Temperature extends Cpu {

	public function __construct() {
		parent::__construct();
		echo json_encode(array(
			'data' => $this->getTemperature(),
			'tjmax' => $this->getTj_max()
		));
	}

  public function getTemperature() {
    $temps = array();
    for($i = 0; $i < $this->$core_count; $i++) {
      $cmd = 'sysctl -n dev.cpu.' . $i . '.temperature';
      $temps[] = floatval(explode('C', Shell::exec($cmd))[0]);
		}
		// $results = array();
		// foreach($temps as $key => $value) {
		// 	$results[] = array('CPU ' . $key => $value);
		// }
    return $temps;
  }

  public function getTj_max() {
    $cmd = 'sysctl -n dev.cpu.0.coretemp.tjmax';
    return floatval(explode('C', Shell::exec($cmd))[0]);
  }

}

$cpu_temperature = new Temperature();

?>